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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleClickDelete = () => {
    setDeleteError(null);
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setDeleteError(null);
    setShowDeleteConfirm(false);
  };

  const handleConfirmDelete = async () => {
    if (!diaryId) return;

    setDeleteError(null);
    setIsDeleting(true);

    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/diaries/${diaryId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(
          `Delete failed: ${res.status} ${res.statusText}\n${body}`,
        );
      }

      // 成功
      setShowDeleteConfirm(false);
      setDeleted(true);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : '削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AuthLoginCheck>
      {error ? (
        <div className="p-10 text-center">日記の取得に失敗しました。</div>
      ) : isLoading || !diary ? (
        <div className="p-10 text-center">読み込み中...</div>
      ) : deleted ? (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-lg font-bold">削除されました</p>

          <button
            type="button"
            className="mt-6 w-full rounded-lg bg-[#6B7B4F] py-4 text-lg font-medium tracking-wider text-white shadow-sm transition-all active:scale-[0.97] hover:bg-[#5A6943]"
            onClick={() => router.push('/diaries')}
          >
            一覧に戻る
          </button>
        </div>
      ) : (
        <div>
          {/* ✅ ここが「通常テキスト表示」 */}
          {notice && (
            <p className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700 border border-green-400">
              {notice}
            </p>
          )}

          <div className="relative rounded-lg bg-white shadow-sm p-6 mb-10">
            <h2 className="mb-2 text-xl font-bold leading-relaxed border-b border-yellow-600 pb-2">
              {diary.title}
            </h2>

            <div className="mb-6 flex items-center justify-end gap-3 text-[12px] text-gray-500">
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

            <p className="mb-3 w-fit rounded-full bg-[#D3D6C6] px-3 py-0.5 text-[12px]">
              {diary.world_heritage_name ?? '世界遺産未設定'}
            </p>

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
                    className="flex-1 rounded-full bg-blue-100 py-2 text-xs font-bold active:bg-gray-200"
                  >
                    編集
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-full bg-gray-100 py-2 text-xs font-bold active:bg-gray-200"
                    onClick={handleClickDelete}
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

          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow">
                <p className="text-base font-semibold">本当に削除しますか？</p>
                <p className="mt-2 text-sm text-gray-600">
                  この操作は取り消せません。
                </p>

                {deleteError && (
                  <p className="mt-3 text-xs text-red-600 whitespace-pre-wrap">
                    {deleteError}
                  </p>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    className="w-1/2 rounded-md border border-gray-300 bg-white px-4 py-2"
                    onClick={handleCancelDelete}
                    disabled={isDeleting}
                  >
                    いいえ
                  </button>

                  <button
                    type="button"
                    className="w-1/2 rounded-md bg-red-600 px-4 py-2 text-white disabled:opacity-60"
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? '削除中...' : 'はい'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AuthLoginCheck>
  );
}
