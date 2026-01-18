'use client';

import { Button } from '../../components/ui/Button';
import Link from 'next/link';

const RANKS = [
  {
    count: '0',
    title: '未獲得',
    color: 'bg-gray-200',
    size: 'h-3 w-3',
    text: 'text-sm font-medium',
    spacing: 'ml-0',
  },
  {
    count: '1〜',
    title: '世界遺産の一歩目',
    color: 'bg-[#D3D6C6]',
    size: 'h-3 w-3',
    text: 'text-sm font-medium',
    spacing: 'ml-4',
  },
  {
    count: '6〜',
    title: '世界遺産の旅人',
    color: 'bg-[#FBE3CF]',
    size: 'h-4 w-4',
    text: 'text-base font-semibold',
    spacing: 'ml-8',
  },
  {
    count: '11〜',
    title: '世界遺産の案内人',
    color: 'bg-[#FBE3CF]',
    size: 'h-4 w-4',
    text: 'text-base font-semibold',
    spacing: 'ml-12',
  },
  {
    count: '16〜',
    title: '世界遺産の語り部',
    color: 'bg-[#E6DAD0]',
    size: 'h-5 w-5',
    text: 'text-lg font-bold',
    spacing: 'ml-16',
  },
  {
    count: '21〜',
    title: '世界遺産の守護者',
    color: 'bg-[#E6DAD0]',
    size: 'h-5 w-5',
    text: 'text-lg font-bold',
    spacing: 'ml-20',
  },
  {
    count: '26〜',
    title: '世界遺産の継承者',
    color: 'bg-[#C5A059]',
    size: 'h-6 w-6',
    text: 'text-xl font-black',
    spacing: 'ml-24',
  },
];

export default function RankListPage() {
  // 配列を下から上へ積み上げる（flex-col-reverse）
  return (
    <div className="mx-auto max-w-sm px-6 py-12">
      {/* 見出し */}
      <div className="mb-16 text-center">
        <h1 className="text-2xl font-bold tracking-widest text-gray-800">
          称号の階段
        </h1>
        <p className="mt-2 text-xs text-gray-400">巡った数だけ、高みへ。</p>
      </div>

      {/* 階段リスト (下から上に並ぶ) */}
      <div className="flex flex-col-reverse space-y-8 space-y-reverse">
        {RANKS.map((rank, index) => (
          <div
            key={index}
            className={`flex items-center transition-all hover:translate-x-1 ${rank.spacing}`}
          >
            {/* ステップのドット */}
            <div className="relative flex items-center justify-center">
              <div
                className={`${rank.size} ${rank.color} rounded-full shadow-sm`}
              />
              {/* 最上位の特別演出 */}
              {rank.count === '26〜' && (
                <div className="absolute h-10 w-10 animate-pulse rounded-full bg-[#C5A059] opacity-20" />
              )}
            </div>

            {/* テキスト情報 */}
            <div className="ml-4 flex flex-col border-l-2 border-gray-100 pl-4">
              <span className="font-mono text-[10px] tracking-tighter text-gray-400">
                {rank.count} sites
              </span>
              <span className={`${rank.text} text-gray-700`}>{rank.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 戻る導線 */}
      <div className="mt-20 border-t border-gray-100 pt-8 text-center">
        <Link href="/get-badges">
          <Button className="w-full bg-white text-gray-400 border border-gray-100 hover:bg-gray-50 shadow-none">
            戻る
          </Button>
        </Link>
      </div>
    </div>
  );
}
