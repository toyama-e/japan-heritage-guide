'use client';

import { createContext, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { useLatestSubscription, Subscription } from '../stripe/useSubscription';
import { useRequireAuth } from './useRequireAuth';

export type UserContextType = {
  user: User | null;
  isPremium: boolean;
  subscription: Subscription | null;
  premiumUntil: Date | null;
  loading: boolean;
  mutateUser?: (user?: User) => void;
};

// --- Context 作成 ---
const UserContext = createContext<UserContextType | undefined>(undefined);

// --- Provider ---
export const UserProvider = ({ children }: { children: ReactNode }) => {
  // useRequireAuth でログインチェック・リダイレクト済み
  const { checking, user } = useRequireAuth();

  // 最新サブスク取得
  const { subscription, loading: loadingSubscription } =
    useLatestSubscription(user);

  const isPremium = subscription?.status === 'active';
  const premiumUntil = subscription?.current_period_end?.toDate() ?? null;

  if (process.env.NODE_ENV === 'development') {
    console.log('--- 🔓 useUserClass ---');
    console.log('subscription:', subscription);
    console.log('isPremium:', isPremium);
    console.log('premiumUntil:', premiumUntil);
  }

  return (
    <UserContext.Provider
      value={{
        user,
        isPremium: !!isPremium,
        subscription,
        premiumUntil,
        loading: checking || loadingSubscription,
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
