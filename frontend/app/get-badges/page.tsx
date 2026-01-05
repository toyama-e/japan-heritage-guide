'use client';

import { Card } from '../../components/ui/Card';
import { BadgeCard } from '../../components/ui/BadgeCard';

export default function GetBadgesPage() {
  const badges = [
    {
      id: 1,
      no: 'No.001',
      name: '法隆寺地域の仏教建造物',
      unlocked: true,
      imageUrl: 'http://localhost:8000/static/badges/badge_1.png',
    },
    {
      id: 2,
      no: 'No.002',
      name: '???',
      unlocked: false,
      imageUrl: 'http://localhost:8000/static/badges/badge_2.png',
    },
    {
      id: 3,
      no: 'No.003',
      name: '屋久島',
      unlocked: true,
      imageUrl: 'http://localhost:8000/static/badges/badge_3.png',
    },
    {
      id: 4,
      no: 'No.004',
      name: '???',
      unlocked: false,
      imageUrl: 'http://localhost:8000/static/badges/badge_4.png',
    },
    {
      id: 5,
      no: 'No.005',
      name: '古都京都の文化財',
      unlocked: true,
      imageUrl: 'http://localhost:8000/static/badges/badge_5.png',
    },
    {
      id: 6,
      no: 'No.006',
      name: '???',
      unlocked: false,
      imageUrl: 'http://localhost:8000/static/badges/badge_6.png',
    },
    {
      id: 7,
      no: 'No.007',
      name: '原爆ドーム',
      unlocked: true,
      imageUrl: 'http://localhost:8000/static/badges/badge_7.png',
    },
    {
      id: 8,
      no: 'No.008',
      name: '???',
      unlocked: false,
      imageUrl: 'http://localhost:8000/static/badges/placeholder.png',
    },
  ];

  return (
    <div className="mx-auto max-w-sm px-6 pt-10">
      <Card className="text-center">
        <p className="text-sm text-gray-500">称号</p>
        <p className="mt-2 text-xl font-bold">世界遺産の一歩目</p>
      </Card>

      <section className="mt-8 grid grid-cols-2 gap-4">
        {badges.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </section>
    </div>
  );
}
