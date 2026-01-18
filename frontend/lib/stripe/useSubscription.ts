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

    // Firestore のサブスクコレクション参照
    const ref = collection(db, `customers/${user.uid}/subscriptions`);
    const q = query(
      ref,
      where('status', 'in', ['active', 'trialing']),
      // インデックス必須: status in + orderBy
      orderBy('current_period_end', 'desc'),
      limit(1),
    );

    if (process.env.NODE_ENV === 'development') {
      console.log('📱 FirestoreDB: サブスク取得開始', user.uid);
    }

    // Snapshot: Firestore 更新をリアルタイム反映
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const doc = snapshot.docs[0];
        if (!doc) {
          setSubscription(null);
          if (process.env.NODE_ENV === 'development') {
            console.log('サブスクリプションなし');
          }
        } else {
          const data = doc.data();
          const sub: Subscription = {
            id: doc.id,
            status: data.status,
            current_period_end: data.current_period_end,
          };
          setSubscription(sub);
          if (process.env.NODE_ENV === 'development') {
            console.log('取得サブスク:', sub);
          }
        }
        setLoading(false);
      },
      (error) => {
        console.error('Firestoreサブスクエラー:', error);
        setLoading(false);
      },
    );

    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 FirestoreDB: サブスク取得終了');
      }
      unsubscribe();
    };
  }, [user]);

  return { subscription, loading };
};
