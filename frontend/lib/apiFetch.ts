// frontend/lib/apiFetch.ts
import { getIdToken } from '../lib/auth/getidtoken';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const DEV_USER_ID = process.env.NEXT_PUBLIC_DEV_USER_ID || '1';

type ApiFetchOptions<TBody = unknown> = Omit<
  RequestInit,
  'body' | 'headers'
> & {
  body?: TBody; // ★ JSONオブジェクトを渡せるようにする
  headers?: Record<string, string>;
};

function buildHeaders(extra?: HeadersInit): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...(extra ?? {}),
  };
}

async function attachAuth(headers: HeadersInit): Promise<HeadersInit> {
  const h = new Headers(headers);

  const token = await getIdToken();
  if (token) {
    h.set('Authorization', `Bearer ${token}`);
  }

  // ★ いつでも送る（バックエンドが dev auth 前提のため）
  h.set('X-User-Id', DEV_USER_ID);

  // ★デバッグ（原因が分かったら消す）
  console.log('[apiFetch] auth headers:', {
    authorization: h.get('Authorization'),
    xUserId: h.get('X-User-Id'),
  });

  return h;
}

/**
 * ★ status を見たい時用（201/409など）
 * Response をそのまま返す
 */

export async function apiFetchResponse<TBody = unknown>(
  path: string,
  options: ApiFetchOptions<TBody> = {},
): Promise<Response> {
  const { body, headers, ...rest } = options;

  const baseHeaders = buildHeaders(headers);
  const authedHeaders = await attachAuth(baseHeaders);

  return fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: authedHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/**
 * ★ 今まで通り「JSONを返す」版（既存コードを壊さない）
 * res.ok 以外は throw
 */

export async function apiFetch<TResponse, TBody = unknown>(
  path: string,
  options: ApiFetchOptions<TBody> = {},
): Promise<TResponse> {
  const res = await apiFetchResponse(path, options);

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${path} failed: ${res.status} ${text}`);
  }

  return (await res.json()) as TResponse;
}

// 画像URLなどで使いたい時用
export function apiBaseUrl(): string {
  return API_BASE;
}
