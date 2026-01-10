'use client';

import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import Image from 'next/image';
import { getIdToken } from '../../../lib/auth/getidtoken';
import { AuthLoginCheck } from '../../../components/auth/authLoginCheck';

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
  is_owner: boolean; // ★APIが返す
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

  // Next.jsのuseParamsは string | string[] になり得るので安全に取り出す
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
        <div className="relative rounded-lg bg-white shadow-sm">
          <div className="px-6 pb-10 pt-4">
            <div className="mb-2 flex gap-4 text-[10px] text-gray-500">
              {/* 一覧に合わせて visit_day を表示（なければ未設定） */}
              <span>{diary.visit_day ?? '日付未設定'}</span>
              <span>{diary.user_nickname ?? '名無し'}</span>
            </div>

            <div className="mb-4">
              <span className="rounded-full bg-gray-200 px-3 py-1 text-[10px] text-gray-700">
                {diary.world_heritage_name ?? '世界遺産未設定'}
              </span>
            </div>

            <h1 className="mb-6 text-sm font-bold leading-relaxed">
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

            <div className="mb-2 text-[10px] text-gray-500">
              訪問日{diary.visit_day ?? '未設定'}
            </div>

            <p className="mb-10 whitespace-pre-wrap text-xs leading-relaxed text-gray-700">
              {diary.text}
            </p>

            {/* ★ボタン出し分け：
                - 他人の日記: 表示のみ（編集/削除は出さない）
                - 自分の日記: 編集/削除ボタンを表示（機能はまだ付けない）
            */}
            <div className="mb-10 flex justify-between gap-2">
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

            <button
              type="button"
              onClick={() => router.back()}
              className="w-full rounded-lg bg-[#6B7B4F] py-4 text-lg font-medium tracking-wider text-white shadow-sm transition-all active:scale-[0.97] hover:bg-[#5A6943]"
            >
              一覧にもどる
            </button>
          </div>
        </div>
      )}
    </AuthLoginCheck>
  );
}
