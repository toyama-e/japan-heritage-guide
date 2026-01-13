'use client';

import Link from 'next/link';
import Image from 'next/image';
import HeaderUserInfo from './HeaderUserInfo';

export default function Header() {
  return (
    <div className="z-2 header fixed w-full py-4 pr-6 pl-6 bg-white shadow-[0px_5px_10px_-2px_#c3c1c1]">
      <div className="flex items-center justify-between">
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
