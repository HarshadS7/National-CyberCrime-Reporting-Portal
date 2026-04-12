import { useEffect, useRef, useState, useCallback } from "react";
import { createSSE } from "@/lib/api";
import type { SSEEvent } from "@/lib/types";

export function useSSE(leadId?: string) {
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const connect = useCallback(
    (lid?: string) => {
      if (esRef.current) {
        esRef.current.close();
      }
      const id = lid || leadId;
      esRef.current = createSSE(
        id,
        (event) => {
          if (event.type === "connected") {
            setConnected(true);
          }
          setEvents((prev) => [...prev, event]);
        },
        () => {
          setConnected(false);
        }
      );
    },
    [leadId]
  );

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
    };
  }, [connect]);

  const clear = useCallback(() => setEvents([]), []);

  return { events, connected, connect, clear };
}
