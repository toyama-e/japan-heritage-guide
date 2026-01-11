'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import Image from 'next/image';
import Link from 'next/link';
import { getIdToken } from '../../../../lib/auth/getidtoken';
import { AuthLoginCheck } from '../../../../components/auth/authLoginCheck';

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

type DiaryUpdatePayload = {
  title?: string;
  text?: string;
  visit_day?: string | null;
  image_url?: string | null;
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

async function patchDiary(diaryId: string, payload: DiaryUpdatePayload) {
  const token = await getIdToken();
  if (!token) throw new Error('Not authenticated');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const res = await fetch(`${apiUrl}/api/v1/diaries/${diaryId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Update failed: ${res.status} ${res.statusText}\n${body}`);
  }

  return (await res.json()) as DiaryDetail;
}

// async function overwriteDiaryCoverImage(params: {
//   file: File;
//   userId: number;
//   diaryId: number;
// }) {
//   const { file, userId, diaryId } = params;

//   const path = `diaries/${userId}/${diaryId}/cover.jpg`;

//   // ① まず update（既存がある前提の差し替え）
//   let errMsg: string | null = null;

//   const { error: updateError } = await supabase.storage
//     .from(DIARY_BUCKET)
//     .update(path, file, {
//       contentType: file.type || 'image/jpeg',
//       cacheControl: '3600',
//       upsert: true, // supabase-jsのバージョン差異対策で付けとく
//     });

//   if (updateError) {
//     errMsg = updateError.message;

//     // ② update がダメなら upload で上書き（upsert）
//     const { error: uploadError } = await supabase.storage
//       .from(DIARY_BUCKET)
//       .upload(path, file, {
//         upsert: true,
//         contentType: file.type || 'image/jpeg',
//         cacheControl: '3600',
//       });

//     if (uploadError) {
//       // ✅ ここでエラー詳細が見えるようにする（原因特定が一番早い）
//       console.error('Storage updateError:', updateError);
//       console.error('Storage uploadError:', uploadError);
//       throw new Error(
//         `画像アップロードに失敗しました: ${uploadError.message} (update: ${errMsg})`,
//       );
//     }
//   }

//   // ③ 公開URL取得（差し替え後のキャッシュ対策で ?v= を付ける）
//   const { data } = supabase.storage.from(DIARY_BUCKET).getPublicUrl(path);
//   if (!data?.publicUrl) throw new Error('画像URLの取得に失敗しました');

//   return `${data.publicUrl}?v=${Date.now()}`;
// }

async function patchDiaryImage(diaryId: string, file: File) {
  const token = await getIdToken();
  if (!token) throw new Error('Not authenticated');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const form = new FormData();
  form.append('image', file);

  const res = await fetch(`${apiUrl}/api/v1/diaries/${diaryId}/image`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Image update failed: ${res.status}\n${body}`);
  }

  return res.json(); // バックエンドが DiaryDetail を返してるなら DiaryDetail が返る
}

export default function DiaryEditPage() {
  const params = useParams();
  const router = useRouter();

  const idRaw = params?.id;
  const diaryId = useMemo(() => {
    const v = Array.isArray(idRaw) ? idRaw[0] : idRaw;
    return v ?? '';
  }, [idRaw]);

  const swrKey = diaryId
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/diaries/${diaryId}`
    : null;

  const {
    data: diary,
    error,
    isLoading,
  } = useSWR<DiaryDetail>(swrKey, fetcherWithToken, {
    revalidateOnFocus: false,
  });

  // フォーム状態
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [visitDay, setVisitDay] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // プレビュー用URL
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!diary) return;
    setTitle(diary.title ?? '');
    setText(diary.text ?? '');
    setVisitDay(diary.visit_day ?? '');
  }, [diary]);

  // ファイルプレビュー
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const canEdit = diary?.is_owner === true;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diaryId || !diary) return;

    if (!canEdit) {
      alert('編集できるのは自分の日記のみです');
      router.push(`/diaries/${diaryId}`);
      return;
    }

    setSaveError(null);
    setSaving(true);

    try {
      // ✅ 画像を選んでいる場合：まず画像差し替え（バックエンド経由）
      if (selectedFile) {
        setUploading(true);
        await patchDiaryImage(diaryId, selectedFile); // ← ここが正しい呼び方
        setUploading(false);
      }

      // ✅ 本文などを更新（image_url は送らない）
      const payload: DiaryUpdatePayload = {
        title: title.trim(),
        text,
        visit_day: visitDay ? visitDay : null,
      };

      await patchDiary(diaryId, payload);

      router.push(`/diaries/${diaryId}?updated=1`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '更新に失敗しました');
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  return (
    <AuthLoginCheck>
      {error ? (
        <div className="p-10 text-center">日記の取得に失敗しました。</div>
      ) : isLoading || !diary ? (
        <div className="p-10 text-center">読み込み中...</div>
      ) : !canEdit ? (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-base font-bold">この日記は編集できません</p>
          <p className="mt-2 text-sm text-gray-600">
            編集できるのは自分の日記のみです。
          </p>
          <button
            type="button"
            className="mt-6 w-full rounded-lg bg-[#6B7B4F] py-4 text-lg font-medium tracking-wider text-white shadow-sm transition-all hover:bg-[#5A6943] active:scale-[0.97]"
            onClick={() => router.push(`/diaries/${diary.id}`)}
          >
            詳細に戻る
          </button>
        </div>
      ) : (
        <div className="mx-auto max-w-lg">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">日記を編集</h2>
            <Link
              href={`/diaries/${diary.id}`}
              className="text-sm text-gray-600 underline"
            >
              詳細へ戻る
            </Link>
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-lg bg-white p-6 shadow-sm"
          >
            {saveError && (
              <p className="mb-4 whitespace-pre-wrap rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-xs text-red-700">
                {saveError}
              </p>
            )}

            {/* タイトル */}
            <label className="mb-2 block text-sm font-bold text-gray-700">
              タイトル
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#6B7B4F]"
              placeholder="タイトルを入力"
              maxLength={200}
              required
            />

            {/* 訪問日 */}
            <label className="mb-2 block text-sm font-bold text-gray-700">
              訪問日
            </label>
            <input
              type="date"
              value={visitDay}
              onChange={(e) => setVisitDay(e.target.value)}
              className="mb-5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#6B7B4F]"
            />
            <p className="-mt-4 mb-5 text-[11px] text-gray-500">
              未設定にしたい場合は空にしてください
            </p>

            {/* 画像ファイル */}
            <label className="mb-2 block text-sm font-bold text-gray-700">
              画像（差し替え）
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="mb-3 block w-full text-sm"
            />
            <p className="mb-4 text-[11px] text-gray-500">
              画像を選んで保存すると、Supabase Storage上の画像が差し替わります。
            </p>

            {/* プレビュー */}
            <div className="mb-6 aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="新しい画像プレビュー"
                  className="h-full w-full object-cover"
                />
              ) : diary.image_url ? (
                <img
                  src={diary.image_url}
                  alt="現在の画像"
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

            {/* 本文 */}
            <label className="mb-2 block text-sm font-bold text-gray-700">
              本文
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="mb-6 h-40 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#6B7B4F]"
              placeholder="本文を入力"
              maxLength={10000}
              required
            />

            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full rounded-lg bg-[#6B7B4F] py-4 text-lg font-medium tracking-wider text-white shadow-sm transition-all hover:bg-[#5A6943] active:scale-[0.97] disabled:opacity-60"
            >
              {uploading
                ? '画像アップロード中...'
                : saving
                  ? '保存中...'
                  : '保存する'}
            </button>
          </form>
        </div>
      )}
    </AuthLoginCheck>
  );
}
