import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();

  // クライアントから送られてきた Authorization をそのままFastAPIへ渡す
  const auth = req.headers.get('authorization') ?? '';

  const apiBase = process.env.NEXT_PUBLIC_API_URL; // サーバー専用（NEXT_PUBLICを付けない）
  if (!apiBase) {
    return NextResponse.json(
      { message: 'NEXT_PUBLIC_API_URL is not set' },
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

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
