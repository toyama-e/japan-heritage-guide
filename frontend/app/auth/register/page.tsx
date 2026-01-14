'use client';

import AuthForm from '../../../components/auth/authform';
import { signUp } from '../../../lib/auth/signup';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
// import { getIdToken } from '../../../lib/auth/getidtoken';

export default function SignupPage() {
  const router = useRouter();
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (
    email: string,
    password: string,
    nickname: string,
  ) => {
    try {
      setLoading(true);

      // 1. Firebase Auth 作成 + displayName 設定
      const user = await signUp(email, password, nickname);

      // 2. IDトークン取得
      const token = await user.getIdToken();

      // 3. PATCH /me で DB に同期
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nickname }),
      });

      // 4. 登録完了表示
      setCompleted(true);

      // 5. 少し待って TOP に遷移
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('サインアップ中にエラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {completed ? (
        <>
          <p>登録完了しました</p>
          <p>TOP画面へ移動します...</p>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold">ユーザー登録</h2>
          <AuthForm
            onSubmit={handleSignup}
            submitText={loading ? '登録中…' : '登録'}
            requireNickname={true}
          />
        </>
      )}
    </div>
  );
}
