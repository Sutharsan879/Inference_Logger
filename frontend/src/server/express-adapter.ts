import { NextResponse } from 'next/server';
import type { Request, Response } from 'express';

/** Run an Express-style handler and return a NextResponse. */
export async function runHandler(
  handler: (req: Request, res: Response) => Promise<void>,
  init: { method: string; url: string; body?: unknown; params?: Record<string, string> }
): Promise<NextResponse> {
  try {
    let statusCode = 200;
    let body: unknown = null;
    let sent = false;

    const req = {
      method: init.method,
      originalUrl: init.url,
      query: Object.fromEntries(new URL(init.url, 'http://localhost').searchParams),
      params: init.params ?? {},
      body: init.body,
    } as Request;

    const res = {
      status(code: number) {
        statusCode = code;
        return res;
      },
      json(data: unknown) {
        body = data;
        sent = true;
        return res;
      },
      send(data?: unknown) {
        body = data;
        sent = true;
        return res;
      },
      end() {
        sent = true;
        return res;
      },
    } as Response;

    await handler(req, res);

    if (statusCode === 204) return new NextResponse(null, { status: 204 });
    if (!sent && body === null) return NextResponse.json({ ok: true }, { status: statusCode });
    return NextResponse.json(body, { status: statusCode });
  } catch (err) {
    console.error('[api handler]', err);
    const message = err instanceof Error ? err.message : 'Request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
