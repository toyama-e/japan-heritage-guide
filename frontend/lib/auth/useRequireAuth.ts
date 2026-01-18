'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from './firebase';
import { User } from 'firebase/auth';

export function useRequireAuth() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [unauthenticated, setUnauthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (!u) {
        setUnauthenticated(true);
        setChecking(false);
        setUser(null);

        // 少し待ってログインページへ
        setTimeout(() => {
          router.replace('/auth/login');
        }, 1500);
      } else {
        setChecking(false);
        setUser(u);
      }
    });

    return () => unsubscribe();
  }, [router]);

  return { checking, unauthenticated, user };
}
