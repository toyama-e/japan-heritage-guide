'use client';

import Link from 'next/link';
import Image from 'next/image';
import HeaderUserInfo from './HeaderUserInfo';

export default function Header() {
  return (
    <div className="header w-105 mx-auto pt-5 pr-5 pb-0 pl-5 bg-[#FAFAF7]">
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
