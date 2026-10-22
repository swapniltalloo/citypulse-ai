"""
================================================================================
  CITYPULSE AI - PRODUCTION AUTONOMOUS URBAN INTELLIGENCE AGENT
================================================================================
  Enterprise-grade LangChain / LangGraph Agent with Groq LLM, OpenWeather,
  Tavily Real-time News, POI Intelligence, World Time, and Human-In-The-Loop.
================================================================================
"""

import sys
import os
import argparse
from dotenv import load_dotenv

# Ensure root path is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass
load_dotenv()

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.prompt import Prompt, Confirm
from rich import print as rprint

from backend.app.config import settings
from backend.app.agent.core import CityAgentRunner, clean_card_tags
from backend.app.memory.session_store import session_store

console = Console(legacy_windows=False)

def run_cli_mode():
    """Interactive Production CLI Mode with Rich Terminal Visualizations"""
    console.print(Panel.fit(
        f"[bold cyan]🏙️ CityPulse AI — Autonomous Urban Intelligence[/bold cyan]\n"
        f"[dim]Model: [bold green]{settings.DEFAULT_MODEL}[/bold green] | "
        f"Tools: [yellow]Weather, News, POIs, Time, AQI[/yellow] | "
        f"HITL Guardrails: [magenta]Enabled[/magenta][/dim]",
        border_style="cyan"
    ))

    session = session_store.create_session("Terminal Urban Recon Session")
    session_id = session.session_id

    # Display Tool Registry
    table = Table(title="Loaded Intelligence Tools", border_style="dim")
    table.add_column("Tool", style="cyan")
    table.add_column("Source", style="yellow")
    table.add_column("Description", style="white")

    table.add_row("get_weather", "OpenWeatherMap API", "Global real-time temperature, wind, humidity")
    table.add_row("get_news", "Tavily Search API", "Verified live news citations & breaking events")
    table.add_row("get_city_points_of_interest", "Urban Knowledge Engine", "Curated landmarks, tech & cultural hubs")
    table.add_row("get_city_time", "Geospatial Clock", "Timezone calculation & business operational hours")
    table.add_row("get_air_quality", "Atmospheric Pollution API", "AQI index & fine particulate health advisories")
    console.print(table)
    console.print("\n[dim]Commands: [bold]'exit'[/bold] to quit | [bold]'clear'[/bold] to new session | [bold]'web'[/bold] to launch web UI[/dim]\n")

    import asyncio

    async def chat_loop():
        nonlocal session_id
        while True:
            try:
                user_input = Prompt.ask("\n[bold green]You[/bold green]")
                if not user_input.strip():
                    continue
                if user_input.lower() in ["exit", "quit", "q"]:
                    console.print("[yellow]Shutting down CityPulse agent. Goodbye![/yellow]")
                    break
                if user_input.lower() == "clear":
                    session = session_store.create_session()
                    session_id = session.session_id
                    console.print("[green]Session cleared. Fresh state initialized.[/green]")
                    continue
                if user_input.lower() == "web":
                    console.print("[bold cyan]To start the web UI, run:[/bold cyan] [bold white]python Agents.py --serve[/bold white]")
                    continue

                console.print(f"\n[dim cyan]⚡ Agent analyzing query...[/dim cyan]")

                current_thought = ""
                final_answer = ""

                async for event in CityAgentRunner.execute_stream(
                    session_id=session_id,
                    user_message=user_input,
                    hitl_mode="sensitive_only"
                ):
                    event_type = event.get("event")
                    data = event.get("data", {})

                    if event_type == "thought":
                        status = data.get("status", "")
                        console.print(f"[dim grey62]  › {status}[/dim grey62]")

                    elif event_type == "tool_call_pending":
                        t_name = data.get("tool_name")
                        t_args = data.get("args")
                        console.print(f"  [bold yellow]⚙️ Invoking Tool:[/bold yellow] [cyan]{t_name}[/cyan] with {t_args}")

                    elif event_type == "tool_approval_required":
                        t_name = data.get("tool_name")
                        t_args = data.get("args")
                        t_id = data.get("tool_call_id")
                        
                        console.print(Panel(
                            f"[bold red]🛡️ HUMAN-IN-THE-LOOP APPROVAL REQUIRED[/bold red]\n"
                            f"Agent requests execution of: [bold yellow]{t_name}[/bold yellow]\n"
                            f"Arguments: [white]{t_args}[/white]",
                            border_style="red"
                        ))
                        approved = Confirm.ask("Approve this tool execution?", default=True)
                        session_store.resolve_pending_approval(t_id, approved)

                    elif event_type == "tool_result":
                        t_name = data.get("tool_name")
                        t_time = data.get("execution_time_ms", 0)
                        console.print(f"  [bold green]✓ Tool Completed:[/bold green] [dim]{t_name} in {t_time}ms[/dim]")

                    elif event_type == "token":
                        token = data.get("token", "")
                        console.print(f"[white]{token}[/white]", end="")

                    elif event_type == "done":
                        final_answer = data.get("final_content", "")
                        console.print("\n")
                        console.print(Panel(
                            clean_card_tags(final_answer),
                            title="[bold cyan]CityPulse Intelligence Synthesis[/bold cyan]",
                            border_style="green"
                        ))

                    elif event_type == "error":
                        console.print(f"[bold red]Error:[/bold red] {data.get('message')}")

            except (KeyboardInterrupt, EOFError):
                console.print("\n[yellow]Session interrupted. Exiting.[/yellow]")
                break

    asyncio.run(chat_loop())


def run_server_mode(host: str = "0.0.0.0", port: int = 8000, reload: bool = False):
    """Start Production FastAPI Server"""
    import uvicorn
    console.print(Panel.fit(
        f"[bold cyan]🚀 Starting CityPulse AI Production Server[/bold cyan]\n"
        f"API & UI URL: [bold green]http://localhost:{port}[/bold green]\n"
        f"Swagger Docs: [bold green]http://localhost:{port}/docs[/bold green]",
        border_style="cyan"
    ))
    uvicorn.run("backend.app.main:app", host=host, port=port, reload=reload)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CityPulse AI - Production Urban Intelligence Agent")
    parser.add_argument("--serve", action="store_true", help="Launch FastAPI production server")
    parser.add_argument("--host", default="0.0.0.0", help="Host address for server")
    parser.add_argument("--port", type=int, default=8000, help="Port for server")
    parser.add_argument("--reload", action="store_true", help="Enable hot reload")
    parser.add_argument("--cli", action="store_true", help="Run interactive CLI mode directly")
    args = parser.parse_args()

    if args.cli:
        run_cli_mode()
    else:
        # Default behavior: run server mode so web UI works out of the box!
        run_server_mode(host=args.host, port=args.port, reload=args.reload)
