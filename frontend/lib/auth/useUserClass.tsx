'use client';

import { createContext, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { useLatestSubscription, Subscription } from '../stripe/useSubscription';
import { useRequireAuth } from './useRequireAuth';
import useSWR from 'swr';
import { apiFetch } from '../apiFetch';

export type UserContextType = {
  user: User | null;
  nickname: string | null;
  isPremium: boolean;
  subscription: Subscription | null;
  premiumUntil: Date | null;
  visitCount: number;
  loading: boolean;
  mutateUser: () => Promise<void>;
  mutateVisitCount: () => void;
};

// --- Context 作成 ---
const UserContext = createContext<UserContextType | undefined>(undefined);

// --- Provider ---
export const UserProvider = ({ children }: { children: ReactNode }) => {
  // useRequireAuth でログインチェック・リダイレクト済み
  const { checking, user } = useRequireAuth();

  const { data: dbData, mutate: mutateDbUser } = useSWR(
    user ? '/api/v1/me' : null,
    (url) => apiFetch<{ nickname: string }>(url),
  );

  // 最新サブスク取得
  const { subscription, loading: loadingSubscription } =
    useLatestSubscription(user);

  // --- SWR で訪問件数を管理 (リアルタイム更新対応) ---
  const {
    data: visitData,
    isLoading: loadingVisit,
    mutate: mutateVisitCount, // これを呼ぶとデータを再取得する
  } = useSWR(
    user ? '/api/v1/visits/me' : null,
    (url) => apiFetch<{ count: number }>(url),
    {
      revalidateOnFocus: true, // タブがアクティブになったら再取得
      refreshInterval: 0, // 必要なら自動ポーリング（ミリ秒）を設定可能
    },
  );

  const isPremium = subscription?.status === 'active';
  const premiumUntil = subscription?.current_period_end?.toDate() ?? null;
  const visitCount = visitData?.count ?? 0;
  const nickname = user?.displayName || dbData?.nickname || 'ゲスト';
  const mutateUser = async () => {
    // SWRのmutateを呼ぶことで、APIから最新データを再取得します
    await Promise.all([
      mutateDbUser(), // DB側のニックネームを再取得
      mutateVisitCount(), // 訪問カウントも最新に更新
    ]);

    if (process.env.NODE_ENV === 'development') {
      console.log('--- 🔄 User Data Mutated ---');
    }
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('--- 🔓 useUserClass ---');
    console.log('subscription:', subscription);
    console.log('isPremium:', isPremium);
    console.log('premiumUntil:', premiumUntil);
    console.log('visitCount:', visitCount);
    console.log('nickname:', nickname);
  }

  return (
    <UserContext.Provider
      value={{
        user,
        nickname,
        isPremium: !!isPremium,
        subscription,
        premiumUntil,
        visitCount,
        mutateVisitCount,
        mutateUser,
        loading: checking || loadingSubscription || loadingVisit,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// --- Context を取得するフック ---
export const useUserClass = () => {
  const context = useContext(UserContext);
  if (!context)
    throw new Error('useUserClass は UserProvider 内で使ってください');
  return context;
};
