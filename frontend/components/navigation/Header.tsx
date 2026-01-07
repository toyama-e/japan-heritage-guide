'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <div className="header w-105 mx-auto p-5 bg-[#FAFAF7]">
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
    </div>
  );
}
