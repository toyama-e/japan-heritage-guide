'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import Image from 'next/image';
import { getIdToken } from '../../lib/auth/getidtoken';
import { AuthLoginCheck } from '../../components/auth/authLoginCheck';

type DiaryData = {
  id: number;
  user_id: number;
  world_heritage_id: number;
  visit_id: number | null;
  visit_day: string | null;
  title: string;
  text: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user_nickname: string | null;
  world_heritage_name: string | null;
};

const fetcherWithToken = async (url: string) => {
  const token = await getIdToken();
  // 未ログインなら AuthLoginCheck がリダイレクトする想定なので、ここはエラーでOK
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}\n${body}`);
  }
  return res.json() as Promise<DiaryData[]>;
};

export default function DiaryListPage() {
  const [activeTab, setActiveTab] = useState<'mine' | 'all'>('all');
  const scope = activeTab === 'mine' ? 'mine' : 'all';

  const {
    data: list,
    error,
    isLoading,
  } = useSWR<DiaryData[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/diaries?scope=${scope}`,
    fetcherWithToken,
  );

  return (
    <AuthLoginCheck>
      {error ? (
        <div className="p-4">データ取得に失敗しました</div>
      ) : isLoading || !list ? (
        <div className="p-4">読み込み中...</div>
      ) : (
        <div className="relative">
          {/* タブ */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('mine')}
                className={`rounded-full px-6 py-1.5 text-xs shadow-sm transition-colors ${
                  activeTab === 'mine'
                    ? 'bg-[#F2A96D] font-bold text-white'
                    : 'bg-[#FBE3CF] text-gray-600'
                }`}
              >
                マイ日記
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`rounded-full px-6 py-1.5 text-xs shadow-sm transition-colors ${
                  activeTab === 'all'
                    ? 'bg-[#F2A96D] font-bold text-white'
                    : 'bg-[#FBE3CF] text-gray-600'
                }`}
              >
                みんなの日記
              </button>
            </div>

            <Link
              href="/diaries/new"
              className="flex h-8 w-8 cursor-default items-center justify-center rounded-full bg-[#D3D6C6] text-lg text-gray-600 shadow-sm"
            >
              ＋
            </Link>
          </div>

          {/* 一覧 */}
          <div className="main">
            {list.length === 0 ? (
              <div className="rounded-lg bg-gray-50 p-4 text-sm">
                表示できる日記がありません
              </div>
            ) : (
              list.map((diary) => (
                <Link
                  href={`/diaries/${diary.id}`}
                  key={diary.id}
                  className="mb-5 block transition-opacity active:opacity-70"
                >
                  <div className="flex gap-4 rounded-xl bg-white p-4 shadow-sm">
                    <div className="h-25 w-25 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-inner">
                      {diary.image_url ? (
                        <img
                          src={diary.image_url}
                          alt={diary.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Image
                            src="/images/header-image.png"
                            alt="日記画像"
                            width={80}
                            height={80}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col">
                      <p className="w-fit mb-2 rounded-full bg-[#D3D6C6] px-3 py-0.5 text-[10px]">
                        {diary.world_heritage_name ?? ''}
                      </p>
                      <div className="mb-1 flex items-center gap-2 text-[10px] text-gray-600">
                        <span>
                          {diary.created_at
                            ? new Date(diary.created_at).toLocaleDateString(
                                'ja-JP',
                                {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                },
                              )
                            : '日付未設定'}
                        </span>
                        <span>{diary.user_nickname ?? '名無し'}</span>
                      </div>
                      <h3 className="mb-2 my-0.5 text-xs font-bold text-gray-800">
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
          </div>
        </div>
      )}
    </AuthLoginCheck>
  );
}
