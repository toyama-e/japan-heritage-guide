'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import Image from 'next/image';
import { getIdToken } from '../../../lib/auth/getidtoken';
import { AuthLoginCheck } from '../../../components/auth/authLoginCheck';
import Link from 'next/link';

type DiaryDetail = {
  id: number;
  user_id: number;
  user_nickname: string | null;
  world_heritage_id: number;
  world_heritage_name: string | null;
  visit_id: number | null;
  visit_day: string | null;
  title: string;
  text: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_owner: boolean;
};

const fetcherWithToken = async (url: string) => {
  const token = await getIdToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}\n${body}`);
  }
  return res.json() as Promise<DiaryDetail>;
};

export default function DiaryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ 通常テキスト用（トーストじゃない）
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const created = searchParams.get('created');
    if (created === '1') {
      setNotice('日記が登録できました。');

      const t = setTimeout(() => setNotice(null), 2500);

      // クエリを消して再読み込みでも出ないようにする
      router.replace(window.location.pathname);

      return () => clearTimeout(t);
    }
  }, [searchParams, router]);

  const idRaw = params?.id;
  const diaryId = Array.isArray(idRaw) ? idRaw[0] : idRaw;

  const {
    data: diary,
    error,
    isLoading,
  } = useSWR<DiaryDetail>(
    diaryId
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/diaries/${diaryId}`
      : null,
    fetcherWithToken,
  );

  return (
    <AuthLoginCheck>
      {error ? (
        <div className="p-10 text-center">日記の取得に失敗しました。</div>
      ) : isLoading || !diary ? (
        <div className="p-10 text-center">読み込み中...</div>
      ) : (
        <div>
          {/* ✅ ここが「通常テキスト表示」 */}
          {notice && (
            <p className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
              {notice}
            </p>
          )}

          <div className="relative rounded-lg bg-white shadow-sm p-6 mb-10">
            <p className="mb-3 w-fit rounded-full bg-[#D3D6C6] px-3 py-0.5 text-[12px]">
              {diary.world_heritage_name ?? '世界遺産未設定'}
            </p>

            <div className="mb-6 flex items-center gap-4 text-[12px] text-gray-500">
              <span>
                {diary.created_at
                  ? new Date(diary.created_at).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '日付未設定'}
              </span>
              <span>{diary.user_nickname ?? '名無し'}</span>
            </div>

            <h1 className="mb-6 text-lg font-bold leading-relaxed">
              {diary.title}
            </h1>

            <div className="mb-6 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100 aspect-video">
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
                    width={180}
                    height={120}
                  />
                </div>
              )}
            </div>

            <div className="mb-2 text-[12px] font-bold text-gray-500">
              訪問日：
              {diary.visit_day
                ? new Date(diary.visit_day).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '日付未設定'}
            </div>

            <p className="mb-7 whitespace-pre-wrap text-xs leading-relaxed text-gray-700">
              {diary.text}
            </p>

            <div className="flex justify-between gap-2">
              {diary.is_owner && (
                <>
                  <button
                    type="button"
                    className="flex-1 rounded-full bg-gray-100 py-2 text-xs font-bold text-gray-600 active:bg-gray-200"
                  >
                    編集
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-full bg-gray-100 py-2 text-xs font-bold text-gray-600 active:bg-gray-200"
                  >
                    削除
                  </button>
                </>
              )}
            </div>
          </div>

          <Link
            href="/diaries"
            className="block text-center w-full rounded-lg bg-[#6B7B4F] py-4 text-lg font-medium tracking-wider text-white shadow-sm transition-all active:scale-[0.97] hover:bg-[#5A6943]"
          >
            一覧にもどる
          </Link>
        </div>
      )}
    </AuthLoginCheck>
  );
}
