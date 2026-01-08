'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/heritages', label: '一覧', icon: '/icons/list-icon.png' },
  { href: '/map', label: 'マップ', icon: '/icons/map-icon.png' },
  { href: '/diaries', label: '日記', icon: '/icons/diary-icon.png' },
  { href: '/get-badges', label: '獲得バッジ', icon: '/icons/badge-icon.png' },
  { href: '/auth/mypage', label: 'マイページ', icon: '/icons/mypage-icon.png' },
];

export const BottomTabBar = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white h-25 mx-auto shadow-[0px_-5px_10px_-2px_#c3c1c1]">
      <ul className="flex h-full justify-between px-2 text-xs font-black items-center">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <li key={item.href} className="flex-1 text-center">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-2 ${
                  isActive ? 'font-bold text-black' : 'text-gray-500'
                }`}
              >
                <div className="flex items-center justify-center h-10">
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={
                      item.label === '日記' || item.label === '獲得バッジ'
                        ? 33
                        : 40
                    }
                    height={40}
                    className={isActive ? '' : 'opacity-60'}
                  />
                </div>
                <span className="font-xl">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
