import { ensureServer } from '@/server/init';
import { runStreamChat, type StreamChatInput } from '@backend/services/stream-chat.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: Request) {
  await ensureServer();
  const body = (await request.json()) as StreamChatInput;

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
