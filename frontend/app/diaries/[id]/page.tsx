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
  like_count: number;
};

type LikeResponse = {
  diary_id: number;
  like_count: number;
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

export default function DiaryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showUpdated, setShowUpdated] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const created = searchParams.get('created');
    if (created === '1') {
      setNotice('日記が登録できました。');

      const t = setTimeout(() => setNotice(null), 2500);
      router.replace(window.location.pathname);

      return () => clearTimeout(t);
    }
  }, [searchParams, router]);

  const idRaw = params?.id;
  const diaryId = Array.isArray(idRaw) ? idRaw[0] : idRaw;

  useEffect(() => {
    const updated = searchParams.get('updated');
    if (updated === '1') {
      setShowUpdated(true);

      // ✅ URLから updated を消す（履歴は増やさない）
      router.replace(`/diaries/${diaryId}`);

      // ✅ 2秒後に非表示（任意）
      const t = setTimeout(() => setShowUpdated(false), 2000);
      return () => clearTimeout(t);
    }
  }, [searchParams, router, diaryId]);

  const swrKey = diaryId
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/diaries/${diaryId}`
    : null;

  const {
    data: diary,
    error,
    isLoading,
    mutate,
  } = useSWR<DiaryDetail>(swrKey, fetcherWithToken, {
    revalidateOnFocus: false,
  });

  const [liking, setLiking] = useState(false);

  const onClickLike = async () => {
    if (!diary || liking) return;
    setLiking(true);

    const prev = diary;

    // ① 先にUIだけ +1
    await mutate({ ...diary, like_count: (diary.like_count ?? 0) + 1 }, false);

    try {
      // ② APIで確定値をもらう
      const result = await postLike(diary.id);

      // ③ サーバー確定値で上書き
      await mutate({ ...prev, like_count: result.like_count }, false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      await mutate(prev, false);
      alert('いいねに失敗しました');
    } finally {
      setLiking(false);
    }
  };

  // --- 削除系 ---
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
            className="mt-6 w-full rounded-lg bg-[#6B7B4F] py-4 text-lg font-medium tracking-wider text-white shadow-sm transition-all hover:bg-[#5A6943] active:scale-[0.97]"
            onClick={() => router.push('/diaries')}
          >
            一覧に戻る
          </button>
        </div>
      ) : (
        <div>
          {notice && (
            <p className="mb-4 rounded-lg border border-green-400 bg-green-50 px-4 py-2 text-sm text-green-700">
              {notice}
            </p>
          )}
          {showUpdated && (
            <p className="mb-4 rounded-lg border border-green-400 bg-green-50 px-4 py-2 text-sm text-green-700">
              更新しました。
            </p>
          )}

          <div className="relative mb-10 rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h2 className="mb-2 flex-1 border-b border-yellow-600 pb-2 text-xl font-bold leading-relaxed">
                {diary.title}
              </h2>
            </div>

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

              <button
                onClick={onClickLike}
                disabled={liking}
                className="right-4 inline-flex items-center gap-1 rounded-full text-sm"
              >
                <Image
                  src="/icons/good-before_icon.png"
                  alt="いいね"
                  width={25}
                  height={25}
                  className={liking ? 'animate-pulse' : ''}
                />
                <span className="tabular-nums">{diary.like_count}</span>
              </button>
            </div>

            <div className="mb-6 aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
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
                    onClick={() => router.push(`/diaries/${diary.id}/edit`)}
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
            className="block w-full rounded-lg bg-[#6B7B4F] py-4 text-center text-lg font-medium tracking-wider text-white shadow-sm transition-all hover:bg-[#5A6943] active:scale-[0.97]"
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
                  <p className="mt-3 whitespace-pre-wrap text-xs text-red-600">
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
