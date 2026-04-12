const API_BASE = "http://localhost:3001/api";

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Health ───
export const api = {
  health: () => request<Record<string, unknown>>("/health"),

  // ─── Leads ───
  executeTargeted: (body: {
    companyName: string;
    contactName?: string;
    contactTitle?: string;
    contactEmail?: string;
    contactLinkedIn?: string;
    location?: string;
    additionalContext?: string;
  }) =>
    request<{ pipelineId: string; status: string }>("/leads/execute", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  discover: (body: {
    productName: string;
    productDescription: string;
    targetIndustries: string[];
    targetGeographies?: string[];
    maxResults?: number;
  }) =>
    request<{ pipelineId: string; status: string }>("/leads/discover", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getLeads: () =>
    request<{ leads: import("./types").Lead[]; count: number }>("/leads"),

  getLead: (id: string) =>
    request<import("./types").LeadDetail>(`/leads/${id}`),

  // ─── Webhook / Simulate ───
  sendWebhookResponse: (body: {
    leadId: string;
    channel: import("./types").OutreachChannel;
    messageBody?: string;
  }) =>
    request<{
      status: string;
      sentiment: string;
      action: string;
      reasoning: string;
    }>("/webhook/response", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // ─── Config ───
  setSimulation: (enabled: boolean) =>
    request<{ simulationMode: boolean }>("/config/simulation", {
      method: "POST",
      body: JSON.stringify({ enabled }),
    }),

  // ─── Calendar ───
  getCalendarEvents: () =>
    request<{ events: import("./types").CalendarEvent[]; count: number }>("/calendar/events"),

  calendarChat: (message: string) =>
    request<{ reply: string }>("/calendar/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
};

// ─── SSE ───
export function createSSE(
  leadId?: string,
  onEvent?: (event: import("./types").SSEEvent) => void,
  onError?: (err: Event) => void
): EventSource {
  const url = leadId
    ? `${API_BASE}/events?leadId=${leadId}`
    : `${API_BASE}/events`;
  const es = new EventSource(url);

  es.onmessage = (e) => {
    try {
      const parsed = JSON.parse(e.data);
      onEvent?.(parsed);
    } catch {
      // ignore parse errors
    }
  };

  es.onerror = (e) => {
    onError?.(e);
  };

  return es;
}
