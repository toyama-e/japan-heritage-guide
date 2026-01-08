'use client';

import { ReactNode } from 'react';
import { useRequireAuth } from '../../lib/auth/useRequireAuth';

type Props = {
  children: ReactNode;
};

export function AuthLoginCheck({ children }: Props) {
  const { checking, unauthenticated } = useRequireAuth();

  if (checking) {
    return <p>確認中...</p>;
  }

  if (unauthenticated) {
    return (
      <div>
        <p>ログインしてください</p>
        <p>ログイン画面へ移動します...</p>
      </div>
    );
  }

  return <>{children}</>;
}
