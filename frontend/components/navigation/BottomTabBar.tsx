'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'ホーム' },
  { href: '/search', label: 'さがす' },
  { href: '/diary', label: '日記' },
  { href: '/record', label: 'レコード' },
  { href: '/mypage', label: 'マイページ' },
];

export const BottomTabBar = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white h-16 w-105 mx-auto">
      <ul className="flex h-full justify-between px-2 text-xs items-center">
        {items.map((item) => (
          <li key={item.href} className="flex-1 text-center">
            <Link
              href={item.href}
              className={pathname === item.href ? 'font-bold' : 'text-gray-500'}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
