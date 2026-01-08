// frontend/lib/apiFetch.ts
import { getIdToken } from '../lib/auth/getidtoken';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const DEV_USER_ID = process.env.NEXT_PUBLIC_DEV_USER_ID ?? '1';

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  // 1) 共通ヘッダー
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers ?? {}),
  };

  // 2) 認証ヘッダー（本番: Bearer / 開発: X-User-Id）
  const token = await getIdToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['X-User-Id'] = DEV_USER_ID;
  }

  // 3) fetch
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  // 4) エラーハンドリング統一
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${path} failed: ${res.status} ${text}`);
  }

  // 5) JSONで返す
  return (await res.json()) as T;
}

// 画像URLなどで使いたい時用
export function apiBaseUrl(): string {
  return API_BASE;
}
