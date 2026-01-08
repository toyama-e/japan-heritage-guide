'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';

type DiaryData = {
  id: number;
  user_id: number;
  world_heritage_id: number;
  visit_id: number | null;
  visit_day: string | null; // "2025-05-28" など
  title: string;
  text: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}\n${body}`);
  }
  return res.json();
};

export default function DiaryListPage() {
  const [activeTab, setActiveTab] = useState<'mine' | 'all'>('all');

  const {
    data: list,
    error,
    isLoading,
  } = useSWR<DiaryData[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/diaries`,
    fetcher,
  );

  // 認証未実装の暫定：自分 = user_id=1 として扱う
  const CURRENT_USER_ID = 1;

  const displayDiaries = useMemo(() => {
    if (!list) return [];
    if (activeTab === 'mine') {
      return list.filter((d) => d.user_id === CURRENT_USER_ID);
    }
    return list;
  }, [list, activeTab]);

  if (error) return <div className="p-4">データ取得に失敗しました</div>;
  if (isLoading || !list) return <div className="p-4">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      <div className="relative mx-auto min-h-screen max-w-md bg-white pb-20 shadow-xl">
        {/* タブと投稿ボタンのエリア */}
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('mine')}
              className={`rounded-full px-6 py-1.5 text-xs shadow-sm transition-colors ${
                activeTab === 'mine'
                  ? 'bg-gray-400 font-bold text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              マイ日記
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`rounded-full px-6 py-1.5 text-xs shadow-sm transition-colors ${
                activeTab === 'all'
                  ? 'bg-gray-400 font-bold text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              みんなの日記
            </button>
          </div>

          {/* 投稿ボタン（リンクにするならここをLinkに変更） */}
          <button
            type="button"
            className="flex h-8 w-8 cursor-default items-center justify-center rounded-full bg-gray-300 text-lg text-gray-600 shadow-sm"
            aria-label="投稿（未実装）"
          >
            ＋
          </button>
        </div>

        {/* リストエリア */}
        <main className="space-y-4 px-4">
          {displayDiaries.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
              表示できる日記がありません
            </div>
          ) : (
            displayDiaries.map((diary) => (
              <Link
                href={`/diaries/${diary.id}`}
                key={diary.id}
                className="block transition-opacity active:opacity-70"
              >
                <div className="flex gap-4 rounded-xl bg-gray-300 p-4 shadow-sm">
                  {/* 写真表示エリア */}
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-inner">
                    {diary.image_url ? (
                      <img
                        src={diary.image_url}
                        alt={diary.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-gray-400">🖼️</span>
                      </div>
                    )}
                  </div>

                  {/* テキストエリア */}
                  <div className="flex flex-1 flex-col">
                    <div className="flex gap-2 text-[10px] text-gray-600">
                      <span>{diary.visit_day ?? '日付未設定'}</span>
                      <span>user:{diary.user_id}</span>
                    </div>
                    <h3 className="my-0.5 text-xs font-bold text-gray-800">
                      {diary.title}
                    </h3>
                    <p className="line-clamp-2 text-[10px] leading-tight text-gray-600">
                      {diary.text}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </main>
      </div>
    </div>
  );
}
