'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { useMemo, useState } from 'react';
import Image from 'next/image';

type HeritageData = {
  id: number;
  name: string;
  type: string;
  address: string;
  year: number;
  latitude: number;
  longitude: number;
  summary: string;
  image_url?: string;
  badge_image_url?: string;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};

function TypeBadge({ type }: { type: string }) {
  const cls = type.includes('自然')
    ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
    : type.includes('文化')
      ? 'bg-amber-50 text-amber-900 ring-amber-200'
      : 'bg-slate-50 text-slate-800 ring-slate-200';

  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1',
        cls,
      ].join(' ')}
    >
      {type}
    </span>
  );
}

export default function HeritagesPage() {
  // ✅ Hookは必ず最上部で固定（returnの前に全部置く）
  const [q, setQ] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const swrKey = apiUrl ? `${apiUrl}/api/v1/heritages` : null;

  const {
    data: list,
    error,
    isLoading,
  } = useSWR<HeritageData[]>(swrKey, fetcher, {
    revalidateOnFocus: false,
  });

  const items = useMemo(() => {
    if (!list) return [];
    const sorted = [...list].sort((a, b) => a.id - b.id);

    const query = q.trim().toLowerCase();
    if (!query) return sorted;

    return sorted.filter((it) => {
      return (
        it.name.toLowerCase().includes(query) ||
        it.address.toLowerCase().includes(query) ||
        it.type.toLowerCase().includes(query)
      );
    });
  }, [list, q]);

  // ✅ ここから下は早期return OK（Hookはもう全部呼び終えてる）
  if (!apiUrl) return <div className="p-4">API URLが設定されていません</div>;
  if (error) return <div className="p-4">データ取得に失敗しました</div>;
  if (isLoading || !list) return <div className="p-4">読み込み中...</div>;

  return (
    <div className="mx-auto w-full pb-24 pt-5">
      <header className="mb-4">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-slate-900">
          日本の世界遺産
        </h2>
        <p className="mt-1 text-sm text-slate-600">カードをタップして詳細へ</p>

        <div className="mt-3 relative">
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
            placeholder="名称・所在地・区分で検索"
            className="
            w-full rounded-xl border border-gray-200 bg-white
            py-3 pl-11 pr-4 text-sm
            outline-none placeholder:text-gray-400
          focus:border-gray-300 focus:ring-2 focus:ring-gray-200
    "
          />
        </div>
      </header>

      <div className="space-y-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/heritages/${item.id}`}
            aria-label={`${item.name} の詳細へ`}
            className={[
              'group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm',
              'active:scale-[0.99] active:bg-slate-50',
              'focus:outline-none focus:ring-2 focus:ring-slate-300',
            ].join(' ')}
          >
            {/* 画像（16:9） */}
            <div className="relative w-full bg-slate-100">
              <div className="aspect-[16/9] w-full overflow-hidden">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    loading={item.id <= 3 ? 'eager' : 'lazy'}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
                    No image
                  </div>
                )}
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent" />

              <div className="absolute left-3 top-3 flex items-center gap-2">
                <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-slate-700">
                  No.{item.id}
                </span>
                <TypeBadge type={item.type} />
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <h2 className="line-clamp-2 text-base font-semibold leading-snug text-white drop-shadow">
                  {item.name}
                </h2>
              </div>
            </div>

            <div className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <div className="text-slate-700">
                  <span className="text-slate-500">所在地：</span>
                  <span className="font-medium">{item.address}</span>
                </div>
                <div className="text-slate-700">
                  <span className="text-slate-500">登録年：</span>
                  <span className="font-medium">{item.year}</span>
                </div>
              </div>

              {item.summary ? (
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
                  {item.summary}
                </p>
              ) : null}

              <div className="mt-3 flex items-center justify-end text-xs font-medium text-slate-600">
                詳細を見る →
              </div>
            </div>
          </Link>
        ))}
      </div>

      {items.length === 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          該当する世界遺産がありません。
        </div>
      )}
    </div>
  );
}
