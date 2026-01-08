'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from './firebase';

export function useRequireAuth() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [unauthenticated, setUnauthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        setUnauthenticated(true);
        setChecking(false);

        // 少し待ってログインページへ
        setTimeout(() => {
          router.replace('/auth/login');
        }, 1500);
      } else {
        setChecking(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  return { checking, unauthenticated };
}
