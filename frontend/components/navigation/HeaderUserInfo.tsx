'use client';

import Image from 'next/image';
import { TitleText } from '../ui/TitleText';
import { useUserClass } from '../../lib/auth/useUserClass';

export default function HeaderUserInfo() {
  const { nickname, visitCount, loading } = useUserClass();

  if (loading) return null;

  return (
    <div className="flex flex-col items-end text-right leading-tight">
      <div className="text-sm mb-2 w-fit rounded-full px-3 py-1 bg-[#FBE3CF] font-bold">
        {nickname}
        <span className="text-xs"> さん</span>
      </div>

      <div className="flex items-center text-sm text-gray-600">
        <Image
          className="mr-2"
          src="/icons/badge-icon.png"
          alt="一覧から探す"
          width={20}
          height={20}
        />
        <TitleText count={visitCount} />
      </div>
    </div>
  );
}
