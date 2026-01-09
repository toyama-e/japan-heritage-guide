'use client';

import useSWR from 'swr';
import { getIdToken } from '../lib/auth/getidtoken';

type Diary = {
  worldheritage_name: string;
  visit_date: string;
};

const fetcherWithToken = async (url: string) => {
  const token = await getIdToken();
  console.log('Fetching URL:', url, 'Token:', token); // ←リクエスト前
  const res = await fetch(url, {
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  });
  const data = await res.json();
  console.log('Response:', data); // ←レスポンス確認用
  if (!res.ok) throw new Error(`API取得失敗: ${res.status}`);
  return res.json() as Promise<Diary[]>;
};

export default function DiaryList() {
  const { data, error, isLoading } = useSWR<Diary[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/diaries`,
    fetcherWithToken,
  );

  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error.message}</div>;
  if (!data || data.length === 0) return <div>訪問日記がありません</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">訪問日記</h2>
      <ul className="space-y-4">
        {data.map((diary, index) => (
          <li
            key={index}
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >
            <p className="font-semibold">{diary.worldheritage_name}</p>
            <p className="text-gray-600">{diary.visit_date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
