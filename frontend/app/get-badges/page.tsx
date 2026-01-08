'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { BadgeCard } from '../../components/ui/BadgeCard';
import { apiFetch } from '../../lib/apiFetch';
import Link from 'next/link';
import { Button } from '../../components/ui/Button';

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
  // API から取得する state
  const [visitedIds, setVisitedIds] = useState<number[]>([]);
  const [count, setCount] = useState(0);
  const [heritages, setHeritages] = useState<Heritage[]>([]);

  // 読み込み・エラー表示
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // GET /api/v1/visits/me を読む
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

  // unlocked を visitedIds から計算して BadgeCard に渡す
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

  return (
    <div className="mx-auto max-w-sm px-6 pt-10">
      <Card className="text-center">
        <p className="text-sm text-gray-500">称号</p>

        <p className="mt-2 text-xl font-bold">
          {loading ? '読み込み中...' : title}
        </p>

        <p className="mt-2 text-sm text-gray-500">訪問件数：{count}件</p>

        {error && (
          <p className="mt-2 text-xs text-red-500">
            取得に失敗しました（{error}）
          </p>
        )}
      </Card>

      {/* 使い方ガイド（Cardの下） */}
      <div className="mt-4 rounded-lg bg-gray-50 p-4">
        <p className="text-sm font-semibold text-gray-900">
          訪問を登録するとバッジが解放されます
        </p>
        <p className="mt-1 text-xs text-gray-600">
          訪問件数が増えるほど称号がアップ！
        </p>

        <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-gray-700">
          <div className="flex-1 rounded-full bg-white px-3 py-2 text-center shadow-sm">
            ① 訪問登録
          </div>
          <div className="text-gray-400">→</div>
          <div className="flex-1 rounded-full bg-white px-3 py-2 text-center shadow-sm">
            ② バッジ解放
          </div>
          <div className="text-gray-400">→</div>
          <div className="flex-1 rounded-full bg-white px-3 py-2 text-center shadow-sm">
            ③ 称号UP
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <Link href="/new-record" className="w-full max-w-sm">
          <Button className="w-full">訪問登録へ</Button>
        </Link>
      </div>

      <section className="mt-8 grid grid-cols-2 gap-4">
        {badgesForView.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </section>
    </div>
  );
}
