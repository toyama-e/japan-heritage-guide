'use client';

import { useMemo, useState } from 'react';
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

// ★バケット名（SupabaseのBucket名と完全一致させる）
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

  // ✅ ここが重要：必ずコンソールに出す
  console.log('[upload] start');
  console.log('[upload] supabaseUrl=', supabaseUrl);
  console.log('[upload] bucket=', DIARY_BUCKET);
  console.log('[upload] filePath=', filePath);
  console.log('[upload] file=', {
    name: file.name,
    type: file.type,
    size: file.size,
  });

  const { data, error } = await supabase.storage
    .from(DIARY_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      // typeが空のときもあるので保険
      contentType: file.type || 'image/png',
    });

  // ✅ ここが重要：結果を必ず出す
  console.log('[upload] result data=', data);
  console.log('[upload] result error=', error);

  if (error) {
    // message が空でも見えるように JSON.stringify で全部出す
    throw new Error(`画像アップロード失敗: ${JSON.stringify(error)}`);
  }

  const { data: pub } = supabase.storage
    .from(DIARY_BUCKET)
    .getPublicUrl(filePath);

  console.log('[upload] publicUrl=', pub?.publicUrl);

  if (!pub?.publicUrl) {
    throw new Error('画像URLの取得に失敗しました');
  }

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

  // フォーム状態
  const [worldHeritageId, setWorldHeritageId] = useState<number | null>(null);
  const [visitDay, setVisitDay] = useState<string>('');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const previewUrl = useMemo(() => {
    if (!imageFile) return null;
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedHeritage = useMemo(() => {
    if (!heritages || !worldHeritageId) return null;
    return heritages.find((h) => h.id === worldHeritageId) ?? null;
  }, [heritages, worldHeritageId]);

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

      console.log('[submit] payload=', payload);

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
        console.error('[submit] diary create failed:', res.status, body);
        throw new Error(`作成に失敗しました: ${res.status}\n${body}`);
      }

      const created = (await res.json()) as DiaryCreateResponse;
      console.log('[submit] created=', created);

      router.push(`/diaries/${created.id}?created=1`);
    } catch (e) {
      console.error('[DiaryNewPage] error=', e);

      if (e instanceof Error) {
        setErrorMsg(e.message);
      } else {
        setErrorMsg(`作成に失敗しました: ${JSON.stringify(e)}`);
      }
    } finally {
      setSubmitting(false);
      console.log('[submit] end');
    }
  };

  return (
    <AuthLoginCheck>
      <div className="mx-auto max-w-md p-4 bg-white rounded-lg shadow-sm">
        <h2 className="mb-4 text-xl font-bold border border-solid">
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

        {/* 世界遺産プルダウン */}
        <label className="mb-3 block">
          <div className="mb-1 text-sm text-gray-700">どこの世界遺産？</div>
          <select
            value={worldHeritageId ?? ''}
            onChange={(e) =>
              setWorldHeritageId(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm"
            disabled={heritageLoading || !heritages}
          >
            <option value="">
              {heritageLoading ? '読み込み中...' : '選択してください'}
            </option>
            {(heritages ?? []).map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
                {h.address ? `（${h.address}）` : ''}
              </option>
            ))}
          </select>
        </label>

        {selectedHeritage && (
          <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3 text-sm">
            <div className="font-bold">{selectedHeritage.name}</div>
            <div className="text-xs text-gray-600">
              {selectedHeritage.address ?? ''}
            </div>
          </div>
        )}

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
          <div className="mb-1 text-sm text-gray-700">写真（任意）</div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm"
          />

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

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-lg bg-[#6B7B4F] py-3 text-white disabled:opacity-50"
        >
          {submitting ? '作成中…' : '作成する'}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="mt-3 w-full rounded-lg bg-gray-100 py-3 text-gray-700"
        >
          戻る
        </button>
      </div>
    </AuthLoginCheck>
  );
}
