import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  query,
  Timestamp,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../auth/firebase';

// --- サブスクリプション型 ---
export type Subscription = {
  id: string;
  status: 'active' | 'canceled' | 'trialing' | 'incomplete';
  current_period_end: Timestamp;
};

// --- カスタムフック: 直近1件だけ取得 ---
export const useLatestSubscription = (user: User | null) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const ref = collection(db, `customers/${user.uid}/subscriptions`);
    const q = query(
      ref,
      where('status', 'in', ['active', 'trialing']),
      //where('status', 'in', [...]) + orderBy はインデックス必須FireBase
      orderBy('current_period_end', 'desc'),
      limit(1),
    );

    if (process.env.NODE_ENV === 'development') {
      console.log('📱FirestoreDB サブスクstart');
      console.log('照会UID :', user.uid);
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const doc = snapshot.docs[0];
        if (!doc) {
          if (process.env.NODE_ENV === 'development') {
            console.log(' サブスクリプションはありません');
          }
          setSubscription(null);
        } else {
          const data = doc.data();
          const sub: Subscription = {
            id: doc.id,
            status: data.status,
            current_period_end: data.current_period_end,
          };
          if (process.env.NODE_ENV === 'development') {
            console.log('取得サブスク :', sub);
          }
          setSubscription(sub);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Firestoreエラー', error);
        setLoading(false);
      },
    );

    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('FirestoreDB サブスクend📱');
      }
      unsubscribe();
    };
  }, [user]);

  return { subscription, loading };
};
