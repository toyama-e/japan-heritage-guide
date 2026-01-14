'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import HeaderUserInfo from './HeaderUserInfo';

export default function Header() {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;

      // 下にスクロール → 非表示
      if (currentScrollY > lastScrollY.current && currentScrollY > 20) {
        setVisible(false);
      }
      // 上にスクロール → 表示
      else {
        setVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={[
        'fixed top-0 z-50 w-full bg-white',
        'shadow-[0px_5px_10px_-2px_#c3c1c1]',
        'transition-transform duration-300 ease-in-out',
        visible ? 'translate-y-0' : '-translate-y-full',
      ].join(' ')}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <h1>
          <Link href="/">
            <Image
              src="/images/header-image.png"
              alt="ホームへ戻る"
              width={80}
              height={80}
              className="cursor-pointer"
            />
          </Link>
        </h1>
        <HeaderUserInfo />
      </div>
    </div>
  );
}
