'use client';

import { useEffect, useMemo, useState } from 'react';
import { BadgeCard } from '../../components/ui/BadgeCard';
import { apiFetch } from '../../lib/apiFetch';
import Link from 'next/link';
import { Button } from '../../components/ui/Button';
import { AuthLoginCheck } from '../../components/auth/authLoginCheck';

type VisitsMeResponse = {
  visited_heritage_ids: number[];
  count: number;
};

type Heritage = {
  id: number;
  name: string;
  badge_image_url: string | null;
};

type Badge = {
  id: number;
  no: string;
  name: string;
  imageUrl: string;
  unlocked: boolean;
};

function getTitleByCount(count: number) {
  if (count === 26) return '世界遺産の継承者';
  if (count >= 21) return '世界遺産の守護者';
  if (count >= 16) return '世界遺産の語り部';
  if (count >= 11) return '世界遺産の案内人';
  if (count >= 6) return '世界遺産の旅人';
  if (count >= 1) return '世界遺産の一歩目';
  return '未獲得';
}

export default function GetBadgesPage() {
  const [visitedIds, setVisitedIds] = useState<number[]>([]);
  const [count, setCount] = useState(0);
  const [heritages, setHeritages] = useState<Heritage[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [visits, hs] = await Promise.all([
          apiFetch<VisitsMeResponse>('/api/v1/visits/me'),
          apiFetch<Heritage[]>('/api/v1/heritages'),
        ]);

        setVisitedIds(visits.visited_heritage_ids ?? []);
        setCount(visits.count ?? 0);

        setHeritages(
          hs.map((h) => ({
            id: h.id,
            name: h.name,
            badge_image_url: h.badge_image_url ?? null,
          })),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : 'unknown error');
        setVisitedIds([]);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const badgesForView: Badge[] = useMemo(() => {
    const visitedSet = new Set(visitedIds);

    return heritages
      .slice()
      .sort((a, b) => a.id - b.id)
      .map((h) => {
        const unlocked = visitedSet.has(h.id);

        return {
          id: h.id,
          no: `No.${String(h.id).padStart(3, '0')}`,
          name: unlocked ? h.name : '???',
          imageUrl:
            h.badge_image_url ??
            'http://localhost:8000/static/badges/placeholder.png',
          unlocked,
        };
      });
  }, [heritages, visitedIds]);

  const title = getTitleByCount(count);
  const progressPct = Math.min(rememberSafePct((count / 26) * 100), 100);

  return (
    <AuthLoginCheck>
      {/* 背景：生成り＋ほんのり金 */}
      <div className="mx-auto max-w-sm text-[15px]">
        {/* ヘッダー */}
        <header className="mb-4">
          <h2 className="mt-2 text-2xl font-semibold text-[#1f1e1a]">
            獲得バッジ
          </h2>
          <p className="mt-1 text-base leading-relaxed text-[#2b2a26]">
            歩いた軌跡が、称号となる
          </p>
        </header>

        {/* 称号カード：墨×金 */}
        <div className="relative overflow-hidden rounded-2xl border border-[#e6dcc7] bg-white/70 p-5 shadow-[0_12px_30px_rgba(24,20,12,0.10)] backdrop-blur">
          {/* 金の薄い差し色（装飾） */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,rgba(196,154,79,0.28),rgba(196,154,79,0)_65%)]" />
          <div className="pointer-events-none absolute -bottom-28 -left-24 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(31,30,26,0.10),rgba(31,30,26,0)_65%)]" />

          <div className="relative">
            <p className="text-sm text-[#4a4944]">称号</p>
            <p className="mt-2 text-[22px] font-semibold tracking-wide text-[#1f1e1a]">
              {loading ? '読み込み中...' : title}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-base text-[#2b2a26]">訪問件数</p>
              <p className="text-sm font-medium text-[#1f1e1a]">{count} / 26</p>
            </div>

            {/* 進捗バー：金 */}
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#efe6d3]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#c49a4f] to-[#e2c07a]"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {error && (
              <p className="mt-3 text-sm font-medium text-red-700">
                取得に失敗しました（{error}）
              </p>
            )}
          </div>
        </div>

        {/* 使い方ガイド：折り返し防止 */}
        <div className="mt-4 rounded-2xl border border-[#eadfc9] bg-white/60 p-4 backdrop-blur">
          <p className="text-sm font-semibold text-[#1f1e1a]">
            訪問を登録するとバッジが解放されます
          </p>
          <p className="mt-2 text-sm text-[#2b2a26]">
            訪問件数が増えるほど称号がアップ！
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-sm font-medium text-[#1f1e1a]">
            <div className="h-9 whitespace-nowrap rounded-full border border-[#eadfc9] bg-white px-3 flex items-center justify-center shadow-sm">
              ① 訪問登録
            </div>
            <div className="h-9 whitespace-nowrap rounded-full border border-[#eadfc9] bg-white px-3 flex items-center justify-center shadow-sm">
              ② バッジ解放
            </div>
            <div className="h-9 whitespace-nowrap rounded-full border border-[#eadfc9] bg-white px-3 flex items-center justify-center shadow-sm">
              ③ 称号UP
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-4">
          <Link href="/new-record" className="block">
            <Button className="w-full rounded-xl bg-[#5A6943] text-white font-bold hover:opacity-95">
              訪問登録へ
            </Button>
          </Link>
        </div>

        {/* バッジ一覧：棚っぽく */}
        <section className="mt-7">
          <div className="mb-3 flex items-end justify-between">
            <p className="text-sm font-semibold text-[#1f1e1a]">
              未獲得のバッジは「???」として表示されます
            </p>
            <p className="text-sm text-[#4a4944]">
              {loading
                ? '...'
                : `${badgesForView.filter((b) => b.unlocked).length} / 26`}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {badgesForView.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </section>
      </div>
    </AuthLoginCheck>
  );
}

// 小数やNaN対策（安全に%を作る）
function rememberSafePct(v: number) {
  if (!Number.isFinite(v)) return 0;
  if (v < 0) return 0;
  return Math.round(v);
}
