'use client';

import AuthForm from '../../../components/auth/authform';
import { signIn } from '../../../lib/auth/signin';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleSignIn = async (email: string, password: string) => {
    await signIn(email, password);
    router.replace('/auth/mypage');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">ログイン</h2>
      <p className="text-sm mb-7">
        ログインをすると日記とバッジ獲得機能を利用できます。
        <br />
        ユーザーは無料で作成できます。
        <br />
        初めての方は新規登録から行ってください。
      </p>
      <AuthForm onSubmit={handleSignIn} submitText="ログイン" />
      <br />
      <button onClick={() => router.push('/auth/register')}>
        新規登録はこちら
      </button>
    </div>
  );
}
