'use client';

import { useState } from 'react';
import { getIdToken } from '../../../lib/auth/getidtoken';

export default function AiRecommendPage() {
  const [season, setSeason] = useState('春');
  const [preferences, setPreferences] = useState('');
  const [result, setResult] = useState<any>(null);

  const onSubmit = async () => {
    const token = await getIdToken();

    const res = await fetch('/api/ai/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ season, preferences, days: 2 }),
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="mb-4 text-xl font-bold">AIおすすめ</h1>

      <label className="mb-1 block text-sm font-bold">季節</label>
      <input
        className="mb-3 w-full rounded border p-2"
        value={season}
        onChange={(e) => setSeason(e.target.value)}
      />

      <label className="mb-1 block text-sm font-bold">好み</label>
      <textarea
        className="mb-3 w-full rounded border p-2"
        value={preferences}
        onChange={(e) => setPreferences(e.target.value)}
      />

      <button
        className="w-full rounded bg-black px-4 py-2 text-white"
        onClick={onSubmit}
      >
        おすすめを生成
      </button>

      {result && (
        <pre className="mt-4 whitespace-pre-wrap rounded bg-gray-100 p-3 text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
