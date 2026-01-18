'use client';

import { useEffect, useState } from 'react';
import { auth } from '../../../lib/auth/firebase';
import { User } from 'firebase/auth';
import ProductList from '../../../components/stripe/ProductList';

export default function StripeDebugPage() {
  const [user, setUser] = useState<User | null>(null);

  console.log('[StripeDebugPage] render', { user });

  useEffect(() => {
    console.log('[StripeDebugPage] useEffect auth start');

    const unsubscribe = auth.onAuthStateChanged((u) => {
      console.log('[StripeDebugPage] onAuthStateChanged', u);
      setUser(u);
    });

    return () => {
      console.log('[StripeDebugPage] unsubscribe auth');
      unsubscribe();
    };
  }, []);

  if (!user) {
    console.log('[StripeDebugPage] user is null');
    return <p className="p-4">ログインしてください</p>;
  }

  console.log('[StripeDebugPage] user ready', {
    uid: user.uid,
    email: user.email,
  });

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Stripe 商品テスト（DEBUG）</h1>

      <ProductList user={user} />
    </div>
  );
}
