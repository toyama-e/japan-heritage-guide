'use client';

import useSWR from 'swr';
import { getIdToken } from '../../lib/auth/getidtoken';
import { useRouter } from 'next/navigation';

type Diary = {
  id: number;
  worldheritage_name: string;
  visit_day: string;
  created_at: string;
  image_url: string;
  text: string;
  title: string;
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
  return data;
};

export default function DiaryList() {
  const router = useRouter();
  const { data, error, isLoading } = useSWR<Diary[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/me_diaries/`,
    fetcherWithToken,
  );

  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error.message}</div>;
  if (!data || data.length === 0) return <div>日記の登録０件</div>;

  return (
    <ul className="space-y-4">
      {data.map((diary) => (
        <li
          key={diary.id}
          onClick={() => router.push(`/diaries/${diary.id}`)}
          className="relative flex border rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer"
        >
          {/* 左側：テキスト */}
          <div className="flex-1 pr-4">
            <p className="font-semibold">{diary.worldheritage_name}</p>

            {/* 本文 */}
            {diary.text && (
              <p className="text-gray-500 text-sm">
                {diary.text.length > 25
                  ? diary.text.slice(0, 25) + '…'
                  : diary.text}
              </p>
            )}
          </div>

          {/* 右側：画像 */}
          {diary.image_url && (
            <img
              src={diary.image_url}
              alt="日記画像"
              className="w-20 h-20 object-cover rounded-md border"
            />
          )}
        </li>
      ))}
    </ul>
  );
}
