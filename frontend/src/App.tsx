import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { TelemetryDrawer } from './components/TelemetryDrawer';
import { ToolCallInspector } from './components/ToolCallInspector';
import { WeatherWidget } from './components/WeatherWidget';
import { NewsWidget } from './components/NewsWidget';
import { PlacesWidget } from './components/PlacesWidget';
import { TimeWidget } from './components/TimeWidget';
import { AQIWidget } from './components/AQIWidget';
import { HITLApprovalCard } from './components/HITLApprovalCard';
import { apiService } from './services/api';
import type { Session, Message, PendingApproval, ToolCall, DynamicCard } from './types';
import {
  Send,
  Loader2,
  Sparkles,
  Bot,
  User,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Compass,
} from 'lucide-react';

export function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [thoughtStatus, setThoughtStatus] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState<PendingApproval | null>(null);

  // Settings
  const [selectedModel, setSelectedModel] = useState('openai/gpt-oss-120b');
  const [availableModels, setAvailableModels] = useState<string[]>([
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3.8-27b',
  ]);
  const [hitlMode, setHitlMode] = useState('auto');
  const [telemetryOpen, setTelemetryOpen] = useState(false);
  const [tools, setTools] = useState<any[]>([]);
  const [healthInfo, setHealthInfo] = useState<any>(null);

  // UI state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load initial sessions and system metadata
  useEffect(() => {
    const initialize = async () => {
      try {
        const [health, toolList, sessList] = await Promise.all([
          apiService.getHealth().catch(() => null),
          apiService.getTools().catch(() => []),
          apiService.listSessions().catch(() => []),
        ]);

        if (health) {
          setHealthInfo(health);
          if (health.diagnostics?.available_models) {
            setAvailableModels(health.diagnostics.available_models);
          }
          if (health.diagnostics?.default_model) {
            setSelectedModel(health.diagnostics.default_model);
          }
        }

        setTools(toolList);
        setSessions(sessList);

        if (sessList.length > 0) {
          setActiveSessionId(sessList[0].session_id);
        } else {
          handleNewSession();
        }
      } catch (e) {
        console.error('Initialization error:', e);
      }
    };
    initialize();
  }, []);

  // Load messages when active session changes
  useEffect(() => {
    if (!activeSessionId) return;
    const loadSessionMessages = async () => {
      try {
        const msgs = await apiService.getSessionMessages(activeSessionId);
        setMessages(msgs);
      } catch (e) {
        console.error('Error fetching messages:', e);
      }
    };
    loadSessionMessages();
  }, [activeSessionId]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thoughtStatus, pendingApproval]);

  const handleNewSession = async () => {
    try {
      const newSess = await apiService.createSession();
      setSessions((prev) => [newSess, ...prev]);
      setActiveSessionId(newSess.session_id);
      setMessages([]);
      setPendingApproval(null);
      setThoughtStatus(null);
    } catch (e) {
      console.error('Failed to create new session', e);
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await apiService.deleteSession(id);
      const remaining = sessions.filter((s) => s.session_id !== id);
      setSessions(remaining);
      if (activeSessionId === id) {
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].session_id);
        } else {
          handleNewSession();
        }
      }
    } catch (e) {
      console.error('Failed to delete session', e);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend !== undefined ? textToSend : input).trim();
    if (!promptText || isStreaming) return;

    setInput('');
    setIsStreaming(true);
    setThoughtStatus('Initializing urban intelligence recon...');

    const userMsgId = 'user-' + Date.now();
    const assistantMsgId = 'assist-' + Date.now();

    const userMessage: Message = {
      id: userMsgId,
      role: 'user',
      content: promptText,
      timestamp: Date.now() / 1000,
    };

    const initialAssistantMessage: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      tool_calls: [],
      cards: [],
      timestamp: Date.now() / 1000,
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, initialAssistantMessage]);

    try {
      let activeAssistantContent = '';
      const toolCallsMap = new Map<string, ToolCall>();
      const cardsList: DynamicCard[] = [];

      await apiService.streamChat(
        {
          session_id: activeSessionId || undefined,
          message: promptText,
          model: selectedModel,
          hitl_mode: hitlMode,
        },
        {
          onSessionInit: (data) => {
            if (data.session_id && data.session_id !== activeSessionId) {
              setActiveSessionId(data.session_id);
              apiService.listSessions().then(setSessions);
            }
          },
          onThought: (status) => {
            setThoughtStatus(status);
          },
          onToolPending: (data) => {
            const tc: ToolCall = {
              id: data.tool_call_id,
              tool_name: data.tool_name,
              args: data.args,
              status: 'executing',
            };
            toolCallsMap.set(tc.id, tc);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, tool_calls: Array.from(toolCallsMap.values()) }
                  : m
              )
            );
          },
          onApprovalRequired: (approval) => {
            setPendingApproval(approval);
          },
          onToolResult: (data) => {
            const existing = toolCallsMap.get(data.tool_call_id);
            if (existing) {
              existing.status = data.status === 'rejected' ? 'rejected' : 'completed';
              existing.result = data.result;
              existing.execution_time_ms = data.execution_time_ms;
            }
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, tool_calls: Array.from(toolCallsMap.values()) }
                  : m
              )
            );
          },
          onCard: (card) => {
            cardsList.push(card);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, cards: [...cardsList] }
                  : m
              )
            );
          },
          onToken: (token) => {
            activeAssistantContent += token;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, content: activeAssistantContent }
                  : m
              )
            );
          },
          onDone: (data) => {
            setThoughtStatus(null);
            setPendingApproval(null);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      content: data.final_content || activeAssistantContent,
                      cards: data.cards?.length ? data.cards : cardsList,
                      isStreaming: false,
                    }
                  : m
              )
            );
            apiService.listSessions().then(setSessions);
          },
          onError: (err) => {
            setThoughtStatus(null);
            setPendingApproval(null);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      content:
                        activeAssistantContent +
                        `\n\n*(Error encountered: ${err.message || 'Execution error'})*`,
                      isStreaming: false,
                    }
                  : m
              )
            );
          },
        }
      );
    } catch (e: any) {
      console.error('Execution stream failure', e);
      setThoughtStatus(null);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleHITLDecision = async (approved: boolean, reason?: string) => {
    if (!pendingApproval || !activeSessionId) return;
    try {
      await apiService.approveToolCall(
        activeSessionId,
        pendingApproval.tool_call_id,
        approved,
        reason
      );
      setPendingApproval(null);
    } catch (e) {
      console.error('Error submitting approval decision', e);
    }
  };

  const handleQuickPrompt = (_city: string, promptText: string) => {
    setInput(promptText);
    handleSendMessage(promptText);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = text.replace(/[*#_`>]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const exportConversation = () => {
    if (messages.length === 0) return;
    let exportText = `# CityPulse AI - Reconnaissance Report\nExported: ${new Date().toISOString()}\n\n`;
    messages.forEach((m) => {
      exportText += `### ${m.role === 'user' ? 'Operator' : 'CityPulse Agent'}:\n${m.content}\n\n---\n\n`;
    });
    const blob = new Blob([exportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CityPulse-Recon-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen w-screen bg-background text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onQuickPrompt={handleQuickPrompt}
        healthInfo={healthInfo}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Navbar
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          hitlMode={hitlMode}
          onHitlModeChange={setHitlMode}
          availableModels={availableModels}
          onToggleTelemetry={() => setTelemetryOpen(!telemetryOpen)}
          telemetryOpen={telemetryOpen}
          onExportChat={exportConversation}
          hasMessages={messages.length > 0}
        />

        {/* Chat Timeline Stage */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto px-4 select-none">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30 mb-5 animate-pulse-slow">
                <Compass className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                CityPulse Autonomous Recon
              </h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Empowered by <strong>Groq LLM</strong>, <strong>OpenWeatherMap</strong>, and <strong>Tavily Intelligence</strong>. Ask any query about a global metropolis to initiate real-time tool orchestration.
              </p>

              {/* Starter Prompt Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-8 w-full text-left">
                {[
                  { title: 'Tokyo Tech & Climate', query: 'What is the current weather and latest tech news in Tokyo?' },
                  { title: 'Paris Culture Recon', query: 'Give me local time, atmospheric conditions, and top attractions in Paris.' },
                  { title: 'New York Financial Pulse', query: 'What are the breaking updates and weather conditions in New York right now?' },
                  { title: 'Bengaluru Silicon Valley', query: 'Live briefing for Bengaluru: climate, AQI, and top innovation hubs.' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.query)}
                    className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 transition-all flex flex-col justify-between group shadow-md"
                  >
                    <span className="font-semibold text-white flex items-center justify-between">
                      {item.title}
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 line-clamp-1">{item.query}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-md ${
                      isUser
                        ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950'
                        : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[88%]`}>
                    <div
                      className={`rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-cyan-600/20 border border-cyan-500/40 text-cyan-50 shadow-lg'
                          : 'bg-surfaceLight/80 border border-slate-700/60 text-slate-200 shadow-xl backdrop-blur-md'
                      }`}
                    >
                      {/* Tool Calls Inspector */}
                      {msg.tool_calls && msg.tool_calls.length > 0 && (
                        <ToolCallInspector toolCalls={msg.tool_calls} />
                      )}

                      {/* Dynamic Visual Cards */}
                      {msg.cards && msg.cards.length > 0 && (
                        <div className="space-y-2 my-2">
                          {msg.cards.map((card, cIdx) => {
                            if (card.type === 'weather_card') {
                              return <WeatherWidget key={cIdx} data={card} />;
                            }
                            if (card.type === 'news_card') {
                              return <NewsWidget key={cIdx} data={card} />;
                            }
                            if (card.type === 'places_card') {
                              return <PlacesWidget key={cIdx} data={card} />;
                            }
                            if (card.type === 'time_card') {
                              return <TimeWidget key={cIdx} data={card} />;
                            }
                            if (card.type === 'aqi_card') {
                              return <AQIWidget key={cIdx} data={card} />;
                            }
                            return null;
                          })}
                        </div>
                      )}

                      {/* Text Content */}
                      <div className="whitespace-pre-wrap font-sans selection:bg-cyan-500/30 selection:text-white">
                        {msg.content}
                      </div>

                      {/* Streaming cursor */}
                      {msg.isStreaming && (
                        <span className="inline-block w-1.5 h-4 ml-1 bg-cyan-400 animate-pulse align-middle" />
                      )}
                    </div>

                    {/* Action Footer (Copy, TTS) */}
                    {!isUser && msg.content && (
                      <div className="flex items-center gap-1.5 mt-1.5 px-1 text-[11px] text-slate-500">
                        <button
                          onClick={() => copyToClipboard(msg.id, msg.content)}
                          className="hover:text-cyan-400 p-1 transition-colors rounded"
                          title="Copy answer"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => toggleSpeech(msg.content)}
                          className="hover:text-cyan-400 p-1 transition-colors rounded"
                          title="Read aloud"
                        >
                          {isSpeaking ? (
                            <VolumeX className="w-3.5 h-3.5 text-cyan-400" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Pending Human In The Loop Approval Card */}
          {pendingApproval && (
            <div className="flex justify-center">
              <HITLApprovalCard
                approval={pendingApproval}
                onDecision={handleHITLDecision}
              />
            </div>
          )}

          {/* Live Thought Indicator */}
          {thoughtStatus && !pendingApproval && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 max-w-md animate-pulse">
              <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin flex-shrink-0" />
              <span>{thoughtStatus}</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-borderDark bg-surface/90 backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="max-w-3xl mx-auto flex items-end gap-2 bg-slate-900/80 border border-slate-700/80 focus-within:border-cyan-500/60 rounded-2xl p-2 shadow-2xl transition-all"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask for real-time weather, breaking news, POIs, or city intelligence..."
              disabled={isStreaming}
              className="flex-1 bg-transparent border-0 focus:outline-none text-xs md:text-sm text-slate-100 placeholder-slate-500 px-3 py-2 resize-none max-h-32"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 transition-all flex-shrink-0"
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
          <div className="text-center text-[10px] text-slate-500 mt-2 flex items-center justify-center gap-2">
            <span>Powered by Groq OSS • OpenWeather • Tavily Intelligence</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono">Production Ready v1.0</span>
          </div>
        </div>
      </div>

      {/* Slide-out Telemetry Drawer */}
      <TelemetryDrawer
        isOpen={telemetryOpen}
        onClose={() => setTelemetryOpen(false)}
        tools={tools}
      />
    </div>
  );
}

export default App;
