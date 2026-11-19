import { getPresenceApiConfig } from "@/lib/presence-server";
import WebSocket from "ws";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
} as const;

export async function GET() {
  const config = getPresenceApiConfig();
  if (!config) {
    return new Response(
      'event: error\ndata: {"error":"not_configured"}\n\n',
      { status: 503, headers: SSE_HEADERS },
    );
  }

  const encoder = new TextEncoder();
  let socket: WebSocket | null = null;
  let keepAlive: ReturnType<typeof setInterval> | null = null;
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          closed = true;
        }
      };

      const finish = () => {
        if (closed) return;
        closed = true;
        if (keepAlive) clearInterval(keepAlive);
        try {
          socket?.close();
        } catch {
          // ignore
        }
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      send("retry: 5000\n\n");
      keepAlive = setInterval(() => send(": keepalive\n\n"), 20000);

      try {
        socket = new WebSocket(config.wsUrl, {
          headers: { "x-api-key": config.key },
        });
      } catch {
        send('event: error\ndata: {"error":"websocket_unavailable"}\n\n');
        finish();
        return;
      }

      socket.onmessage = (event) => {
        if (typeof event.data === "string") {
          send(`data: ${event.data}\n\n`);
        }
      };
      socket.onerror = () => {
        send('event: error\ndata: {"error":"upstream_error"}\n\n');
      };
      socket.onclose = finish;
    },
    cancel() {
      closed = true;
      if (keepAlive) clearInterval(keepAlive);
      try {
        socket?.close();
      } catch {
        // ignore
      }
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
