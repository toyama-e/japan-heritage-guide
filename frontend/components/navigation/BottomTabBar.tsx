'use client';

import Link from 'next/link';
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
    <nav className="fixed bottom-0 left-0 right-0 mx-auto h-25 bg-white shadow-[0px_-5px_10px_-2px_#c3c1c1]">
      <ul className="flex h-full items-center justify-between px-2 text-xs font-black">
        {items.map((item) => {
          // 詳細ページでもアクティブにしたい場合は startsWith が便利
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(item.href + '/');

          const size =
            item.label === '日記' || item.label === '獲得バッジ' ? 40 : 45;

          return (
            <li key={item.href} className="flex-1 text-center">
              <Link
                href={item.href}
                className={[
                  'flex flex-col items-center gap-2',
                  isActive ? 'text-[#5A6943] font-bold' : 'text-[#A3A988]',
                ].join(' ')}
              >
                <div className="flex h-10 items-center justify-center">
                  <span
                    className="inline-block bg-current"
                    style={{
                      width: size,
                      height: size,
                      WebkitMaskImage: `url(${item.icon})`,
                      maskImage: `url(${item.icon})`,
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskPosition: 'center',
                      WebkitMaskSize: 'contain',
                      maskSize: 'contain',
                    }}
                    aria-hidden="true"
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
