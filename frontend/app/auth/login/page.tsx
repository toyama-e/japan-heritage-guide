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
      <h1>ログイン</h1>
      <AuthForm onSubmit={handleSignIn} submitText="ログイン" />
      <br />
      <button onClick={() => router.push('/auth/register')}>
        新規登録はこちら
      </button>
    </div>
  );
}
