import type { Session, Message, PendingApproval, DynamicCard } from '../types';

const API_BASE = '/api';

export const apiService = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getTools() {
    const res = await fetch(`${API_BASE}/tools`);
    return res.json();
  },

  async listSessions(): Promise<Session[]> {
    const res = await fetch(`${API_BASE}/sessions`);
    return res.json();
  },

  async createSession(title?: string): Promise<Session> {
    const res = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    return res.json();
  },

  async getSessionMessages(sessionId: string): Promise<Message[]> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/messages`);
    const data = await res.json();
    return data.map((d: any) => ({
      id: d.id,
      role: d.role,
      content: d.content,
      tool_calls: d.tool_calls || [],
      cards: d.metadata?.cards || [],
      timestamp: d.timestamp,
    }));
  },

  async deleteSession(sessionId: string): Promise<void> {
    await fetch(`${API_BASE}/sessions/${sessionId}`, { method: 'DELETE' });
  },

  async approveToolCall(sessionId: string, toolCallId: string, approved: boolean, reason?: string) {
    const res = await fetch(`${API_BASE}/chat/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        tool_call_id: toolCallId,
        approved,
        user_override_reason: reason,
      }),
    });
    return res.json();
  },

  /**
   * SSE Stream consumer for real-time agent output
   */
  async streamChat(
    payload: {
      session_id?: string;
      message: string;
      model?: string;
      temperature?: number;
      hitl_mode?: string;
    },
    callbacks: {
      onSessionInit?: (data: { session_id: string; title: string }) => void;
      onThought?: (status: string) => void;
      onToolPending?: (toolCall: any) => void;
      onApprovalRequired?: (approval: PendingApproval) => void;
      onToolResult?: (result: any) => void;
      onCard?: (card: DynamicCard) => void;
      onToken?: (token: string) => void;
      onDone?: (data: any) => void;
      onError?: (err: any) => void;
    }
  ): Promise<void> {
    const response = await fetch(`${API_BASE}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Stream request failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      let currentEvent = 'message';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('event:')) {
          currentEvent = trimmed.slice(6).trim();
        } else if (trimmed.startsWith('data:')) {
          const rawData = trimmed.slice(5).trim();
          try {
            const parsed = JSON.parse(rawData);

            switch (currentEvent) {
              case 'session_init':
                callbacks.onSessionInit?.(parsed);
                break;
              case 'thought':
                callbacks.onThought?.(parsed.status);
                break;
              case 'tool_call_pending':
                callbacks.onToolPending?.(parsed);
                break;
              case 'tool_approval_required':
                callbacks.onApprovalRequired?.(parsed);
                break;
              case 'tool_result':
                callbacks.onToolResult?.(parsed);
                break;
              case 'card':
                callbacks.onCard?.(parsed);
                break;
              case 'token':
                callbacks.onToken?.(parsed.token);
                break;
              case 'done':
                callbacks.onDone?.(parsed);
                break;
              case 'error':
                callbacks.onError?.(parsed);
                break;
            }
          } catch (e) {
            console.error('Failed to parse SSE JSON payload', e, rawData);
          }
        }
      }
    }
  },
};
