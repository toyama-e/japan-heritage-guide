import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const auth = req.headers.get('authorization') ?? '';

    const apiBase = process.env.API_URL;
    if (!apiBase) {
      return NextResponse.json(
        { message: 'API_URL is not set' },
        { status: 500 },
      );
    }

    const res = await fetch(`${apiBase}/api/v1/ai/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    return NextResponse.json(data ?? { message: 'Empty response' }, {
      status: res.status,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json(
      { message: 'Upstream fetch failed', detail: String(e?.message ?? e) },
      { status: 502 },
    );
  }
}
