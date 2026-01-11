'use client';

import { useEffect, useState } from 'react';
import { auth } from '../../lib/auth/firebase';
import { getIdToken } from '../../lib/auth/getidtoken';
import { TitleText } from '../ui/TitleText';

type UserRead = {
  email?: string | null;
  nickname?: string | null;
};

type VisitsMeResponse = {
  count: number;
};

export default function HeaderUserInfo() {
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

  // 未ログインでも「称号：未獲得」を出したいならこう
  if (!nickname && !loading) {
    return (
      <div className="text-right leading-tight">
        <div className="text-sm font-semibold text-gray-900">ゲスト</div>
        <div className="text-xs text-gray-600">
          称号：
          <TitleText count={0} />
        </div>
      </div>
    );
  }

  // 読み込み中は何も出さない（好みで「読み込み中…」もOK）
  if (loading || !nickname) return null;

  return (
    <div className="text-right leading-tight">
      <div className="text-sm font-semibold text-gray-900">{nickname}</div>
      <div className="text-xs text-gray-600">
        称号：
        <TitleText count={count} />
      </div>
    </div>
  );
}
