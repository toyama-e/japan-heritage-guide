'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { createClient } from '@supabase/supabase-js';
import { AuthLoginCheck } from '../../../components/auth/authLoginCheck';
import { getIdToken } from '../../../lib/auth/getidtoken';

// --------------------
// Supabase client
// --------------------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// バケット名
const DIARY_BUCKET = 'diary-images';

// --------------------
// Types
// --------------------
type Heritage = {
  id: number;
  name: string;
  address: string | null;
  type: string;
  year: number | null;
  image_url: string | null;
};

type DiaryCreatePayload = {
  world_heritage_id: number;
  visit_id: number | null;
  visit_day: string | null; // "YYYY-MM-DD"
  title: string;
  text: string;
  image_url: string | null;
};

type DiaryCreateResponse = {
  id: number;
  is_owner: boolean;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Fetch failed: ${res.status}\n${body}`);
  }
  return res.json();
};

// --------------------
// 画像アップロード → public URL
// --------------------
async function uploadDiaryImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const filePath = `diaries/${crypto.randomUUID()}.${ext}`;

  console.log('[upload] start');
  console.log('[upload] supabaseUrl=', supabaseUrl);
  console.log('[upload] bucket=', DIARY_BUCKET);
  console.log('[upload] filePath=', filePath);

  const { data, error } = await supabase.storage
    .from(DIARY_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/png',
    });

  console.log('[upload] result data=', data);
  console.log('[upload] result error=', error);

  if (error) {
    throw new Error(`画像アップロード失敗: ${JSON.stringify(error)}`);
  }

  const { data: pub } = supabase.storage
    .from(DIARY_BUCKET)
    .getPublicUrl(filePath);

  console.log('[upload] publicUrl=', pub?.publicUrl);

  if (!pub?.publicUrl) throw new Error('画像URLの取得に失敗しました');

  return pub.publicUrl;
}

export default function DiaryNewPage() {
  const router = useRouter();

  const {
    data: heritages,
    error: heritageError,
    isLoading: heritageLoading,
  } = useSWR<Heritage[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/heritages`,
    fetcher,
  );

  // --------------------
  // select風プルダウン用 state
  // --------------------
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // フォーム状態
  const [worldHeritageId, setWorldHeritageId] = useState<number | null>(null);
  const [visitDay, setVisitDay] = useState<string>('');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const selectedHeritageName = useMemo(() => {
    if (!heritages || worldHeritageId === null) return '';
    return heritages.find((h) => h.id === worldHeritageId)?.name ?? '';
  }, [heritages, worldHeritageId]);

  // 外側クリックで閉じる（任意だけどあると快適）
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const previewUrl = useMemo(() => {
    if (!imageFile) return null;
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMsg(null);

    if (!worldHeritageId) return setErrorMsg('世界遺産を選択してください');
    if (!title.trim()) return setErrorMsg('タイトルを入力してください');
    if (!text.trim()) return setErrorMsg('本文を入力してください');

    setSubmitting(true);
    try {
      console.log('[submit] start');

      // 1) 画像アップロード（任意）
      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadDiaryImage(imageFile);
        console.log('[submit] imageUrl=', imageUrl);
      }

      // 2) token付きでPOST
      const token = await getIdToken();
      if (!token)
        throw new Error('認証情報が取得できません。再ログインしてください。');

      const payload: DiaryCreatePayload = {
        world_heritage_id: worldHeritageId,
        visit_id: null,
        visit_day: visitDay ? visitDay : null,
        title: title.trim(),
        text: text.trim(),
        image_url: imageUrl,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/diaries`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`作成に失敗しました: ${res.status}\n${body}`);
      }

      const created = (await res.json()) as DiaryCreateResponse;
      router.push(`/diaries/${created.id}?created=1`);
    } catch (e) {
      if (e instanceof Error) setErrorMsg(e.message);
      else setErrorMsg(`作成に失敗しました: ${JSON.stringify(e)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLoginCheck>
      <div className="mx-auto max-w-md rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-6 border-b border-[#927D5C] pb-2 text-2xl font-bold">
          日記を作成
        </h2>

        {errorMsg && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {heritageError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            世界遺産一覧の取得に失敗しました
          </div>
        )}

        {/* 世界遺産プルダウン（select風） */}
        <div className="relative mb-3" ref={wrapperRef}>
          <div className="mb-1 text-sm text-gray-700">どこの世界遺産？</div>

          <button
            type="button"
            className="w-full text-left"
            onClick={() => setIsOpen((v) => !v)}
            disabled={heritageLoading || submitting}
          >
            <input
              value={selectedHeritageName}
              readOnly
              placeholder={heritageLoading ? '読み込み中...' : '世界遺産を選択'}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm"
            />
          </button>

          {isOpen && !!heritages?.length && (
            <div className="absolute z-10 mt-2 max-h-48 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow">
              {heritages.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  className={
                    worldHeritageId === h.id
                      ? 'block w-full bg-gray-100 px-3 py-2 text-left text-sm font-medium'
                      : 'block w-full px-3 py-2 text-left text-sm hover:bg-gray-100'
                  }
                  onClick={() => {
                    setWorldHeritageId(h.id);
                    setIsOpen(false); // ✅ 選択したら閉じる
                  }}
                >
                  {h.id}: {h.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 訪問日 */}
        <label className="mb-3 block">
          <div className="mb-1 text-sm text-gray-700">訪問日</div>
          <input
            type="date"
            value={visitDay}
            onChange={(e) => setVisitDay(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 text-sm"
          />
        </label>

        {/* タイトル */}
        <label className="mb-3 block">
          <div className="mb-1 text-sm text-gray-700">タイトル</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 text-sm"
            placeholder="例：ハイキングにもってこい"
          />
        </label>

        {/* 本文 */}
        <label className="mb-3 block">
          <div className="mb-1 text-sm text-gray-700">本文</div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="h-40 w-full rounded-lg border border-gray-300 p-2 text-sm"
            placeholder="本文を書いてください"
          />
        </label>

        {/* 画像 */}
        <label className="mb-4 block">
          <div className="mb-1 text-sm font-medium text-gray-700">
            写真（任意）
          </div>

          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                  📷
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    画像をアップロード
                  </p>
                  <p className="text-xs text-gray-500">JPG / PNG など（1枚）</p>
                </div>
              </div>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="mt-3 block w-full text-sm
                file:mr-3 file:rounded-full file:border-0
                file:bg-[#6B7B4F] file:px-4 file:py-2
                file:text-white file:font-bold
                hover:file:opacity-90"
            />

            <p className="mt-2 text-[11px] text-gray-500">
              ※スマホの場合は写真アプリ/カメラが選べます
            </p>
          </div>

          {previewUrl && (
            <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
              <img
                src={previewUrl}
                alt="preview"
                className="h-48 w-full object-cover"
              />
            </div>
          )}
        </label>
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-4 w-full rounded-lg bg-[#6B7B4F] py-3 text-white disabled:opacity-50 shadow-sm"
      >
        {submitting ? '作成中…' : '作成する'}
      </button>

      <button
        type="button"
        onClick={() => router.back()}
        className="mt-3 w-full rounded-lg bg-gray-100 py-3 text-gray-700 shadow-sm"
      >
        戻る
      </button>
    </AuthLoginCheck>
  );
}
