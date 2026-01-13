'use client';

import { useMemo, useState } from 'react';
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
  like_count: number;
};

type LikeResponse = { diary_id: number; like_count: number };

async function postLike(diaryId: number): Promise<LikeResponse> {
  const token = await getIdToken();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const res = await fetch(`${apiUrl}/api/v1/diaries/${diaryId}/like`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Failed to like: ${res.status}\n${body}`);
  }

  return res.json();
}

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
  const [q, setQ] = useState(''); // ✅ 追加：検索文字
  const scope = activeTab === 'mine' ? 'mine' : 'all';

  const {
    data: list,
    error,
    isLoading,
    mutate,
  } = useSWR<DiaryData[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/diaries?scope=${scope}`,
    fetcherWithToken,
  );

  // ✅ 追加：検索フィルタ（世界遺産一覧と同じやり方）
  const filtered = useMemo(() => {
    if (!list) return [];

    const query = q.trim().toLowerCase();
    if (!query) return list;

    return list.filter((d) => {
      const title = (d.title ?? '').toLowerCase();
      const text = (d.text ?? '').toLowerCase();
      const wh = (d.world_heritage_name ?? '').toLowerCase();
      const nick = (d.user_nickname ?? '').toLowerCase();

      return (
        title.includes(query) ||
        text.includes(query) ||
        wh.includes(query) ||
        nick.includes(query)
      );
    });
  }, [list, q]);

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

          {/* 検索欄 */}
          <div className="relative mb-5">
            <label className="sr-only" htmlFor="q">
              検索
            </label>

            {/* 虫眼鏡アイコン */}
            <Image
              src="/icons/glass-icon.png"
              alt="検索"
              width={18}
              height={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 opacity-50"
            />

            <input
              id="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="タイトル・本文・世界遺産名・ユーザー名で検索"
              className="
      w-full rounded-xl border border-gray-200 bg-white
      py-3 pl-11 pr-4 text-sm
      outline-none placeholder:text-gray-400
      focus:border-gray-300 focus:ring-2 focus:ring-gray-200
    "
            />
          </div>

          {/* 一覧 */}
          <div className="main">
            {filtered.length === 0 ? (
              <div className="rounded-lg bg-gray-50 p-4 text-sm">
                表示できる日記がありません
              </div>
            ) : (
              filtered.map((diary) => (
                <div key={diary.id} className="relative mb-5">
                  <div className="flex gap-4 rounded-xl bg-white p-4 shadow-sm">
                    {/* ✅ ここだけLinkにする（ボタンはLink外） */}
                    <Link
                      href={`/diaries/${diary.id}`}
                      className="flex flex-1 gap-4 transition-opacity active:opacity-70"
                    >
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
                        <p className="mb-2 w-fit max-w-45 rounded-full bg-[#D3D6C6] px-3 py-0.5 text-[10px]">
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
                        <h3 className="my-0.5 mb-2 text-xs font-bold text-gray-800">
                          {diary.title}
                        </h3>
                        <p className="line-clamp-2 text-[10px] leading-tight text-gray-600">
                          {diary.text}
                        </p>
                      </div>
                    </Link>

                    {/* ✅ いいねボタン（Link外なので押しても遷移しない） */}
                    <div className="absolute right-4 top-3 flex flex-col items-end justify-end">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-full text-[11px] active:scale-95"
                        aria-label="いいね"
                        onClick={async () => {
                          // オプティミスティックに一覧の該当アイテムだけ +1
                          const prev = list;
                          if (!prev) return;

                          await mutate(
                            prev.map((d) =>
                              d.id === diary.id
                                ? { ...d, like_count: (d.like_count ?? 0) + 1 }
                                : d,
                            ),
                            false,
                          );

                          try {
                            const res = await postLike(diary.id);
                            await mutate(
                              (cur) =>
                                (cur ?? []).map((d) =>
                                  d.id === diary.id
                                    ? { ...d, like_count: res.like_count }
                                    : d,
                                ),
                              false,
                            );
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          } catch (error) {
                            // 失敗したら元に戻す
                            await mutate(prev, false);
                            alert('いいねに失敗しました');
                          }
                        }}
                      >
                        <Image
                          src="/icons/good-before_icon.png"
                          alt="いいね"
                          width={25}
                          height={25}
                        />
                        <span className="tabular-nums">
                          {diary.like_count ?? 0}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </AuthLoginCheck>
  );
}
