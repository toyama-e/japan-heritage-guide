'use client';

import useSWR from 'swr';
import { getIdToken } from '../../../lib/auth/getidtoken';
import { useEffect, useState } from 'react';
import { auth } from '../../../lib/auth/firebase';
import {
  updateProfile,
  updateEmail,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { AuthLoginCheck } from '../../../components/auth/authLoginCheck';
import Diary from '../../../components/auth/mypage-daiarise';
import UserCard from '../../../components/auth/userCard';

type UserData = {
  email?: string | null;
  nickname?: string | null;
};

const fetcherWithToken = async (url: string) => {
  const token = await getIdToken();

  const res = await fetch(url, {
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  });

  if (!res.ok) throw new Error(`API取得失敗: ${res.status}`);
  return res.json() as Promise<UserData>;
};

export default function MyPage() {
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setTokenReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const { data: user, mutate } = useSWR<UserData>(
    tokenReady ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/me` : null,
    fetcherWithToken,
  );

  //handleUpdate submitハンドラー Firebase と DB に同期
  const handleUpdate = async (
    email: string,
    _password?: string,
    nickname?: string,
  ) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert('再ログインしてください');
      return;
    }

    //Firebase Auth 側を更新
    if (nickname && nickname !== currentUser.displayName) {
      await updateProfile(currentUser, { displayName: nickname });
    }

    if (email && email !== currentUser.email) {
      await updateEmail(currentUser, email);
    }

    //DB 側にも PATCH で更新
    const token = await getIdToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nickname, email }),
    });

    if (!res.ok) throw new Error(`更新失敗: ${res.status}`);
    const updated = await res.json();
    mutate(updated);
    alert('更新成功');
  };

  //signOut を引数なしで呼ぶラッパー関数
  const handleLogout = () => {
    firebaseSignOut(auth); // auth 引数を渡す
  };

  if (!user) {
    return (
      <AuthLoginCheck>
        <div className="max-w-md mx-auto p-4">読み込み中...</div>
      </AuthLoginCheck>
    );
  }

  return (
    <AuthLoginCheck>
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center tracking-wide">
          マイページ
        </h1>

        {/* ユーザー情報カード */}
        <UserCard user={user} onUpdate={handleUpdate} onLogout={handleLogout} />

        {/* 日記リスト */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">マイ日記</h2>
          <Diary />
        </div>
      </div>
    </AuthLoginCheck>
  );
}
