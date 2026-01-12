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
    <Card
      className={[
        'overflow-hidden p-0 rounded-2xl border',
        'bg-gradient-to-b from-white/80 to-[#fbf7ef]',
        badge.unlocked
          ? 'border-[#e6dcc7] shadow-[0_10px_24px_rgba(24,20,12,0.10)]'
          : 'border-[#eadfc9] shadow-[0_8px_18px_rgba(24,20,12,0.06)]',
      ].join(' ')}
    >
      {/* No. 札 */}
      <div className="flex items-center justify-between px-3 pt-3">
        <Badge
          className={[
            'rounded-full border px-2.5 py-1 text-[11px] tracking-wide',
            badge.unlocked
              ? 'border-[#e2c07a] bg-[#fbf7ef] text-[#1f1e1a]'
              : 'border-[#eadfc9] bg-white/70 text-[#6a655a]',
          ].join(' ')}
        >
          {badge.no}
        </Badge>
      </div>

      {/* 画像 */}
      <div className="relative mt-2 h-28 w-full">
        <img
          src={badge.imageUrl}
          alt={badge.name}
          className={[
            'h-full w-full object-cover',
            badge.unlocked
              ? 'ring-1 ring-[#e2c07a]/40'
              : 'grayscale contrast-75 brightness-[0.55] saturate-0',
          ].join(' ')}
        />

        {/* locked の墨ベール */}
        {!badge.unlocked && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#1f1e1a]/35 to-[#1f1e1a]/60" />
        )}

        {/* locked の「???」札 */}
        {!badge.unlocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-sm border border-[#e2c07a]/40 bg-[#1f1e1a]/85 px-5 py-2 shadow-sm backdrop-blur">
              <span className="text-sm font-semibold tracking-[0.25em] text-[#fbf7ef]">
                ???
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 名前 */}
      <div className="px-3 pb-3 pt-3">
        <p
          className={[
            'text-sm font-medium leading-snug',
            badge.unlocked ? 'text-[#1f1e1a]' : 'text-[#6a655a]',
          ].join(' ')}
        >
          {badge.unlocked ? badge.name : '???'}
        </p>

        {/* 下の細い金ライン */}
        <div className="mt-2 h-px w-full bg-gradient-to-r from-transparent via-[#e2c07a]/70 to-transparent" />
      </div>
    </Card>
  );
};
