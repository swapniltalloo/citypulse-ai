import asyncio
import json
import re
import time
import uuid
from typing import AsyncGenerator, Dict, Any, List, Optional
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage, BaseMessage
from backend.app.config import settings
from backend.app.agent.prompts import SYSTEM_PROMPT
from backend.app.tools import ALL_TOOLS, TOOL_REGISTRY
from backend.app.memory.session_store import session_store
from backend.app.schemas.chat import MessageRecord, ToolCallRecord

def get_llm(model_name: Optional[str] = None, temperature: Optional[float] = None) -> ChatGroq:
    selected_model = model_name or settings.DEFAULT_MODEL
    temp = temperature if temperature is not None else settings.DEFAULT_TEMPERATURE
    return ChatGroq(
        model=selected_model,
        groq_api_key=settings.GROQ_API_KEY,
        temperature=temp,
        streaming=True
    )

def extract_card_data(text: str) -> List[Dict[str, Any]]:
    cards = []
    pattern = r"<!-- JSON_CARD_DATA:(.*?) -->"
    matches = re.findall(pattern, text, re.DOTALL)
    for m in matches:
        try:
            parsed = json.loads(m.strip())
            cards.append(parsed)
        except Exception:
            pass
    return cards

def clean_card_tags(text: str) -> str:
    pattern = r"<!-- JSON_CARD_DATA:(.*?) -->"
    return re.sub(pattern, "", text, flags=re.DOTALL).strip()

class CityAgentRunner:
    """Production Agent Runner with Human-In-The-Loop & Streaming Telemetry"""

    @classmethod
    async def execute_stream(
        cls,
        session_id: str,
        user_message: str,
        model_name: Optional[str] = None,
        temperature: Optional[float] = None,
        hitl_mode: Optional[str] = "auto"
    ) -> AsyncGenerator[Dict[str, Any], None]:
        
        # 1. Fetch or initialize session
        session = session_store.get_session(session_id)
        if not session:
            session = session_store.create_session()
            session_id = session.session_id

        yield {
            "event": "session_init",
            "data": {
                "session_id": session_id,
                "title": session.title,
                "model": model_name or settings.DEFAULT_MODEL,
                "hitl_mode": hitl_mode
            }
        }

        # 2. Record user message
        user_record = MessageRecord(role="user", content=user_message)
        session_store.add_message(session_id, user_record)

        # 3. Assemble LangChain message history
        raw_history = session_store.get_messages(session_id)
        messages: List[BaseMessage] = [SystemMessage(content=SYSTEM_PROMPT)]
        
        # Add past dialogue (limit to last 12 messages for performance and context budget)
        for msg in raw_history[-12:]:
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))
            elif msg.role == "assistant":
                messages.append(AIMessage(content=msg.content))

        llm = get_llm(model_name, temperature)
        llm_with_tools = llm.bind_tools(ALL_TOOLS)

        active_hitl = hitl_mode or settings.DEFAULT_HITL_MODE
        iterations = 0
        final_text = ""
        collected_tool_records: List[ToolCallRecord] = []
        collected_cards: List[Dict[str, Any]] = []

        try:
            while iterations < settings.MAX_TOOL_ITERATIONS:
                iterations += 1
                
                yield {
                    "event": "thought",
                    "data": {
                        "iteration": iterations,
                        "status": "Analyzing request & selecting actions..."
                    }
                }

                # Invoke LLM with tools
                response_msg: AIMessage = await llm_with_tools.ainvoke(messages)
                messages.append(response_msg)

                tool_calls = getattr(response_msg, "tool_calls", None)

                # If no tool calls, this is the final response
                if not tool_calls:
                    content_text = response_msg.content or ""
                    # Stream tokens if available
                    for token_chunk in content_text.split(" "):
                        yield {
                            "event": "token",
                            "data": {"token": token_chunk + " "}
                        }
                        await asyncio.sleep(0.01)

                    final_text = content_text
                    break

                # Process each tool call requested by agent
                for tc in tool_calls:
                    call_id = tc.get("id", str(uuid.uuid4()))
                    tool_name = tc.get("name")
                    tool_args = tc.get("args", {})

                    tool_rec = ToolCallRecord(
                        id=call_id,
                        tool_name=tool_name,
                        args=tool_args,
                        status="pending"
                    )
                    collected_tool_records.append(tool_rec)

                    yield {
                        "event": "tool_call_pending",
                        "data": {
                            "tool_call_id": call_id,
                            "tool_name": tool_name,
                            "args": tool_args
                        }
                    }

                    # Check Human-In-The-Loop requirement
                    requires_approval = False
                    if active_hitl == "always_ask":
                        requires_approval = True
                    elif active_hitl == "sensitive_only" and tool_name in settings.SENSITIVE_TOOLS:
                        requires_approval = True

                    approved = True
                    if requires_approval:
                        yield {
                            "event": "tool_approval_required",
                            "data": {
                                "tool_call_id": call_id,
                                "tool_name": tool_name,
                                "args": tool_args,
                                "message": f"Agent is requesting permission to execute: {tool_name}"
                            }
                        }

                        approval_event = asyncio.Event()
                        session_store.register_pending_approval(
                            session_id=session_id,
                            tool_call_id=call_id,
                            tool_name=tool_name,
                            args=tool_args,
                            future_or_event=approval_event
                        )

                        # Wait for approval with timeout (default 90 seconds)
                        try:
                            await asyncio.wait_for(approval_event.wait(), timeout=90.0)
                            approval_info = session_store.get_pending_approval(call_id)
                            approved = bool(approval_info and approval_info.get("decision"))
                        except asyncio.TimeoutError:
                            approved = False
                            yield {
                                "event": "thought",
                                "data": {"status": f"Tool approval for {tool_name} timed out. Defaulting to deny."}
                            }

                    start_time = time.time()
                    if approved:
                        tool_func = TOOL_REGISTRY.get(tool_name)
                        if tool_func:
                            try:
                                yield {
                                    "event": "thought",
                                    "data": {"status": f"Executing tool: {tool_name}..."}
                                }
                                # Run sync tool in executor for non-blocking execution
                                loop = asyncio.get_event_loop()
                                tool_result_raw = await loop.run_in_executor(None, lambda: tool_func.invoke(tool_args))
                                exec_time_ms = round((time.time() - start_time) * 1000, 2)
                                
                                # Extract cards if any
                                extracted = extract_card_data(str(tool_result_raw))
                                for c in extracted:
                                    collected_cards.append(c)
                                    yield {
                                        "event": "card",
                                        "data": c
                                    }

                                tool_rec.status = "completed"
                                tool_rec.result = str(tool_result_raw)
                                tool_rec.execution_time_ms = exec_time_ms

                                yield {
                                    "event": "tool_result",
                                    "data": {
                                        "tool_call_id": call_id,
                                        "tool_name": tool_name,
                                        "result": str(tool_result_raw),
                                        "execution_time_ms": exec_time_ms
                                    }
                                }

                                messages.append(ToolMessage(
                                    content=str(tool_result_raw),
                                    tool_call_id=call_id
                                ))
                            except Exception as tool_err:
                                err_msg = f"Tool execution error in '{tool_name}': {str(tool_err)}"
                                tool_rec.status = "failed"
                                tool_rec.result = err_msg
                                messages.append(ToolMessage(
                                    content=err_msg,
                                    tool_call_id=call_id
                                ))
                        else:
                            err_msg = f"Unknown tool: '{tool_name}'."
                            messages.append(ToolMessage(content=err_msg, tool_call_id=call_id))
                    else:
                        denied_msg = f"Execution of tool '{tool_name}' was rejected by the operator."
                        tool_rec.status = "rejected"
                        tool_rec.result = denied_msg
                        messages.append(ToolMessage(
                            content=denied_msg,
                            tool_call_id=call_id
                        ))
                        yield {
                            "event": "tool_result",
                            "data": {
                                "tool_call_id": call_id,
                                "tool_name": tool_name,
                                "result": denied_msg,
                                "status": "rejected"
                            }
                        }

            # If loop finished or reached limit, extract any additional card tags from final text
            cards_in_final = extract_card_data(final_text)
            for c in cards_in_final:
                if c not in collected_cards:
                    collected_cards.append(c)
                    yield {"event": "card", "data": c}

            cleaned_final = clean_card_tags(final_text)
            
            # Record assistant message in session store
            assistant_record = MessageRecord(
                role="assistant",
                content=cleaned_final,
                tool_calls=collected_tool_records,
                metadata={"cards": collected_cards}
            )
            session_store.add_message(session_id, assistant_record)

            yield {
                "event": "done",
                "data": {
                    "session_id": session_id,
                    "final_content": cleaned_final,
                    "tools_used": [t.tool_name for t in collected_tool_records],
                    "cards": collected_cards,
                    "iterations": iterations
                }
            }

        except Exception as e:
            yield {
                "event": "error",
                "data": {
                    "error": str(e),
                    "message": "Encountered an unexpected error during agent execution."
                }
            }
