'use client';

import useSWR from 'swr';
import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import AuthForm from '../../components/auth/authform';
import { signIn } from '../../lib/auth/signin';

type UserData = {
  id: number;
  firebase_uid: string;
  email?: string | null;
};

const fetcherWithToken = async (url: string, token: string) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('API取得失敗');
  return res.json();
};

export default function Me() {
  const [token, setToken] = useState<string | null>(null);

  // Firebase トークン取得
  useEffect(() => {
    const auth = getAuth();
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        setToken(idToken);
      } else {
        setToken(null);
      }
    });
  }, []);

  // SWR で /me API 呼び出し
  const { data: user, error } = useSWR<UserData>(
    token ? [`${process.env.NEXT_PUBLIC_API_URL}/api/v1/me`, token] : null,
    (url, t) => fetcherWithToken(url, t),
  );

  const handleSignIn = async (email: string, password: string) => {
    await signIn(email, password);
    // 成功したら Firebase の onAuthStateChanged がトリガーされて token がセットされる
  };

  if (!token) {
    // トークンがない場合はログインフォームを表示
    return <AuthForm onSubmit={handleSignIn} submitText="ログイン" />;
  }
  if (error) return <div>エラー: {error.message}</div>;
  if (!user) return <div>読み込み中...</div>;

  return (
    <div className="p-4 bg-white border rounded shadow">
      <h2 className="font-bold text-lg mb-2">ユーザー情報</h2>
      <p>ID: {user.id}</p>
      <p>Firebase UID: {user.firebase_uid}</p>
      <p>Email: {user.email ?? '未登録'}</p>
    </div>
  );
}
