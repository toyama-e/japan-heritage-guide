'use client';

import AuthForm from '../../../components/auth/authform';
import { signUp } from '../../../lib/auth/signup';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const handleSignup = async (
    email: string,
    password: string,
    nickname: string,
  ) => {
    await signUp(email, password, nickname);
    router.push('/auth/login');
  };

  return (
    <div>
      <h1>ユーザー登録</h1>
      <AuthForm
        onSubmit={handleSignup}
        submitText="登録"
        requireNickname={true}
      />
    </div>
  );
}
