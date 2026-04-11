import type { SSEEvent, SSEEventType } from "../types/index.js";

type SSEClient = {
  id: string;
  leadId?: string;
  send: (event: SSEEvent) => void;
  close: () => void;
};

class SSEManager {
  private clients: Map<string, SSEClient> = new Map();

  addClient(client: SSEClient): void {
    this.clients.set(client.id, client);
    console.log(`📡 SSE client connected: ${client.id} (total: ${this.clients.size})`);
  }

  removeClient(clientId: string): void {
    this.clients.delete(clientId);
    console.log(`📡 SSE client disconnected: ${clientId} (total: ${this.clients.size})`);
  }

  /** Broadcast to all clients, or only those subscribed to a specific leadId */
  broadcast(event: SSEEvent): void {
    for (const client of this.clients.values()) {
      // Send to all clients, or filter by leadId if client is subscribed
      if (!client.leadId || client.leadId === event.leadId) {
        try {
          client.send(event);
        } catch {
          this.removeClient(client.id);
        }
      }
    }
  }

  /** Convenience: emit an agent status update */
  emitAgentStatus(
    leadId: string,
    agentNumber: number,
    agentName: string,
    status: "idle" | "running" | "complete" | "error",
    outputSummary?: string,
    error?: string
  ): void {
    this.broadcast({
      type: "agent_status",
      leadId,
      data: { agentNumber, agentName, status, outputSummary, error },
      timestamp: new Date().toISOString(),
    });
  }

  /** Convenience: emit a typed data update */
  emit(type: SSEEventType, leadId: string, data: unknown): void {
    this.broadcast({
      type,
      leadId,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  getClientCount(): number {
    return this.clients.size;
  }
}

// Singleton
export const sseManager = new SSEManager();
