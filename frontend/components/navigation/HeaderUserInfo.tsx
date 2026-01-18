'use client';

import { useEffect, useState } from 'react';
import { auth } from '../../lib/auth/firebase';
import { getIdToken } from '../../lib/auth/getidtoken';
import { TitleText } from '../ui/TitleText';
import Image from 'next/image';
import { useUserClass } from '../../lib/auth/useUserClass';

type UserRead = {
  email?: string | null;
  nickname?: string | null;
};

type VisitsMeResponse = {
  count: number;
};

export default function HeaderUserInfo() {
  const { nickname: syncNickname } = useUserClass();
  const [nickname, setNickname] = useState<string | null>(null);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ログイン状態が変わったら必ず走る
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      // まず表示をリセット（別ユーザー切替に強い）
      setNickname(null);
      setCount(0);

      if (!user) {
        // 未ログイン
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // サインアップ直後のバックエンド処理完了を待つためのバッファ（0.5秒）
        await new Promise((resolve) => setTimeout(resolve, 500));
        // トークン取得（この時点では user がいるので取りやすい）
        const token = await getIdToken();
        if (!token) {
          setLoading(false);
          return;
        }

        // ① nickname (/api/v1/me)
        const meRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (meRes.ok) {
          const me: UserRead = await meRes.json();
          setNickname(me.nickname ?? null);
        }

        // ② count (/api/v1/visits/me)
        const visitsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/visits/me`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (visitsRes.ok) {
          const visits: VisitsMeResponse = await visitsRes.json();
          setCount(visits.count ?? 0);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const displayNickname = syncNickname || nickname;

  // 未ログインでも「称号：未獲得」を出したいならこう
  if (!displayNickname && !loading) {
    return (
      <div className="flex flex-col items-end text-right leading-tight">
        <div className="text-sm mb-2 w-fit transition-colors font-bold">
          ゲスト
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
          <TitleText count={0} />
        </div>
      </div>
    );
  }

  // 読み込み中は何も出さない（好みで「読み込み中…」もOK）
  if (loading || !displayNickname) return null;

  return (
    <div className="flex flex-col items-end text-right leading-tight">
      <div className="text-sm mb-2 w-fit rounded-full px-3 py-1 transition-colors bg-[#FBE3CF] font-bold">
        {displayNickname}
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
        <TitleText count={count} />
      </div>
    </div>
  );
}
