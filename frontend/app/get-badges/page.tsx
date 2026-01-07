'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { BadgeCard } from '../../components/ui/BadgeCard';

type VisitsMeResponse = {
  visited_heritage_ids: number[];
  count: number;
};

type Badge = {
  id: number;
  no: string;
  name: string; // 本来の名称（locked のときは表示で ??? にする）
  imageUrl: string;
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
  // まずは badge の「マスターデータ」だけを定義（unlocked は API から計算する）
  const badges: Badge[] = useMemo(
    () => [
      {
        id: 1,
        no: 'No.001',
        name: '法隆寺地域の仏教建造物',
        imageUrl: 'http://localhost:8000/static/badges/badge_1.png',
      },
      {
        id: 2,
        no: 'No.002',
        name: '姫路城',
        imageUrl: 'http://localhost:8000/static/badges/badge_2.png',
      },
      {
        id: 3,
        no: 'No.003',
        name: '屋久島',
        imageUrl: 'http://localhost:8000/static/badges/badge_3.png',
      },
      {
        id: 4,
        no: 'No.004',
        name: '白川郷・五箇山の合掌造り集落',
        imageUrl: 'http://localhost:8000/static/badges/badge_4.png',
      },
      {
        id: 5,
        no: 'No.005',
        name: '古都京都の文化財',
        imageUrl: 'http://localhost:8000/static/badges/badge_5.png',
      },
      {
        id: 6,
        no: 'No.006',
        name: '???',
        imageUrl: 'http://localhost:8000/static/badges/badge_6.png',
      },
      {
        id: 7,
        no: 'No.007',
        name: '原爆ドーム',
        imageUrl: 'http://localhost:8000/static/badges/badge_7.png',
      },
      {
        id: 8,
        no: 'No.008',
        name: '???',
        imageUrl: 'http://localhost:8000/static/badges/placeholder.png',
      },
    ],
    [],
  );

  // API から取得する state
  const [visitedIds, setVisitedIds] = useState<number[]>([]);
  const [count, setCount] = useState(0);

  // 読み込み・エラー表示
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // GET /api/v1/visits/me を読む
  useEffect(() => {
    const API_BASE =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? 'NEXT_PUBLIC_API_URL';

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/api/v1/visits/me`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          // 認証でCookieを使うなら next line を有効化
          // credentials: 'include',
        });

        if (!res.ok) {
          throw new Error(`visits/me failed: ${res.status}`);
        }

        const data: VisitsMeResponse = await res.json();
        setVisitedIds(data.visited_heritage_ids ?? []);
        setCount(data.count ?? 0);
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
  const badgesForView = useMemo(() => {
    const visitedSet = new Set(visitedIds);

    return badges.map((b) => {
      const unlocked = visitedSet.has(b.id);

      return {
        ...b,
        unlocked,
        // locked のときだけ ??? 表示にする
        name: unlocked ? b.name : '???',
      };
    });
  }, [badges, visitedIds]);

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

      <section className="mt-8 grid grid-cols-2 gap-4">
        {badgesForView.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </section>
    </div>
  );
}
