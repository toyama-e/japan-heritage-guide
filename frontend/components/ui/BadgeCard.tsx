'use client';

import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

type BadgeData = {
  id: number;
  no: string;
  name: string;
  unlocked: boolean;
  imageUrl: string;
};

type Props = {
  badge: BadgeData;
};

export const BadgeCard = ({ badge }: Props) => {
  return (
    <Card className="p-0 overflow-hidden">
      {/* No. */}
      <div className="px-2 py-1">
        <Badge className="bg-gray-200 text-gray-800">{badge.no}</Badge>
      </div>

      {/* 画像 */}
      <div className="relative h-24 w-full">
        <img
          src={badge.imageUrl}
          alt={badge.name}
          className={
            badge.unlocked
              ? 'h-full w-full object-cover'
              : 'h-full w-full object-cover grayscale brightness-50'
          }
        />

        {!badge.unlocked && (
          <>
            <div className="absolute inset-0" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Badge className="bg-gray-800/90 text-white text-base px-4 py-1">
                ???
              </Badge>
            </div>
          </>
        )}
      </div>

      {/* 名前 */}
      <div className="px-2 py-2">
        <p className="text-sm font-medium">
          {badge.unlocked ? badge.name : '???'}
        </p>
      </div>
    </Card>
  );
};
