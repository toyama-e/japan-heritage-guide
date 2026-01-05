'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../../lib/auth/firebase';
import LogoutButton from '../../../components/auth/logoutButton';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>確認中...</div>;

  return (
    <div>
      {user ? (
        <>
          <p>サインイン中</p>
          <p>Email: {user.email}</p>
          <LogoutButton />
        </>
      ) : (
        <p>未サインイン</p>
      )}
    </div>
  );
}
