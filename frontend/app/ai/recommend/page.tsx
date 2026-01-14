'use client';

import { useState } from 'react';
import { getIdToken } from '../../../lib/auth/getidtoken';

type Recommendation = {
  name: string;
  reason: string;
  access: string;
  stay_area: string;
  nearby: string[];
};

type RecommendOut = {
  recommendations: Recommendation[];
  note: string;
};

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

// 超ゆるい型ガード（最低限の形だけ確認）
function isRecommendOut(v: unknown): v is RecommendOut {
  if (!v || typeof v !== 'object') return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj = v as any;
  return Array.isArray(obj.recommendations) && typeof obj.note === 'string';
}

export default function AiRecommendPage() {
  const [season, setSeason] = useState<'春' | '夏' | '秋' | '冬'>('春');
  const [preferences, setPreferences] = useState('');
  const [result, setResult] = useState<RecommendOut | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const token = await getIdToken();
    if (!token) {
      alert('ログインしてください');
      return;
    }

    const payload = { season, preferences };

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      const data = text ? safeJsonParse(text) : null;

      if (!res.ok) {
        console.error('API error:', res.status, data);
        alert(`API error: ${res.status}`);
        return;
      }

      if (!isRecommendOut(data)) {
        console.error('Unexpected response shape:', data);
        alert('返却形式が想定と違います（コンソールを確認してください）');
        return;
      }

      setResult(data);
    } catch (e) {
      console.error(e);
      alert(
        '通信に失敗しました（API_URL設定やバックエンド稼働を確認してください）',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[420px] px-4 pb-24 pt-5">
      <header className="mb-4">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          AIおすすめ
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          季節と好みから、世界遺産を3つ提案します
        </p>
      </header>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-800">
            季節
          </label>
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
            value={season}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e) => setSeason(e.target.value as any)}
          >
            <option value="春">春</option>
            <option value="夏">夏</option>
            <option value="秋">秋</option>
            <option value="冬">冬</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-800">
            好み（例：温泉が好き、自然、混雑が苦手 など）
          </label>
          <textarea
            className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="あなたの好み・やりたいことを書いてください"
          />
        </div>

        <button
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          onClick={onSubmit}
          disabled={loading || !preferences.trim()}
        >
          {loading ? '生成中…' : 'おすすめを生成'}
        </button>
      </div>

      {result && (
        <div className="mt-4 space-y-4">
          {result.recommendations.map((r, idx) => (
            <div
              key={`${r.name}-${idx}`}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 p-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                    {idx + 1}
                  </span>
                  <h2 className="text-base font-semibold text-slate-900">
                    {r.name}
                  </h2>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {r.reason}
                </p>
              </div>

              <div className="space-y-3 p-4 text-sm text-slate-700">
                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    アクセス
                  </p>
                  <p className="mt-1">{r.access}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    宿泊エリア
                  </p>
                  <p className="mt-1">{r.stay_area}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    周辺スポット
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {r.nearby.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <p className="text-xs font-semibold text-slate-500">メモ</p>
            <p className="mt-2 whitespace-pre-wrap">{result.note}</p>
          </div>
        </div>
      )}
    </div>
  );
}
