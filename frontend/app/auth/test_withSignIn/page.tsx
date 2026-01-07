'use client';

import useSWR from 'swr';
import { getIdToken } from '../../../lib/auth/getidtoken';
import { useEffect, useState } from 'react';
import { auth } from '../../../lib/auth/firebase';
import LogoutButton from '../../../components/auth/logoutButton';

type UserData = {
  id: number;
  firebase_uid: string;
  email?: string | null;
};

const fetcherWithToken = async (url: string) => {
  const token = await getIdToken();
  if (!token) throw new Error('未サインインです');

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`API取得失敗: ${res.status}`);
  return res.json() as Promise<UserData>;
};

export default function Home() {
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      setTokenReady(!!auth.currentUser);
    });
    return () => unsubscribe();
  }, []);

  const {
    data: user,
    error,
    isLoading,
  } = useSWR<UserData>(
    tokenReady ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/me` : null,
    fetcherWithToken,
  );

  if (isLoading) return <div>確認中...</div>;
  if (error) return <div>エラー:{error.message}</div>;

  return (
    <div>
      {user ? (
        <>
          <p>サインイン中</p>
          <p>UserID: {user.id}</p>
          <p>Email: {user.email}</p>
          <LogoutButton />
        </>
      ) : (
        <p>未サインイン</p>
      )}
    </div>
  );
}
