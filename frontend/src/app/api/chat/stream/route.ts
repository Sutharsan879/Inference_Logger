import { NextResponse } from 'next/server';
import { ensureServer } from '@/server/init';
import { runStreamChat, type StreamChatInput } from '@backend/services/stream-chat.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: Request) {
  let body: StreamChatInput;
  try {
    body = (await request.json()) as StreamChatInput;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    await ensureServer();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server not ready';
    console.error('[api/chat/stream] ensureServer', err);
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const write = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      try {
        await runStreamChat(body, (event) => write(event));
      } catch (err) {
        write({ error: err instanceof Error ? err.message : 'Stream failed' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
