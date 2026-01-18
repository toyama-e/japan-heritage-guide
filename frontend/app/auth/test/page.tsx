'use client';

import { useState } from 'react';
import { auth } from '../../../lib/auth/firebase';
import { signOut as firebaseSignOut, updateProfile } from 'firebase/auth';
import { getIdToken } from '../../../lib/auth/getidtoken';
import { getFirebaseAuthError } from '../../../lib/auth/firebaseError';
import { FirebaseError } from 'firebase/app';

// コンポーネント
import { AuthLoginCheck } from '../../../components/auth/authLoginCheck';
import UserCard from '../../../components/auth/userCard';
import ReauthUpdateModal from '../../../components/auth/authUpdate';
import Diary from '../../../components/auth/mypage-daiarise';
import SubscriptionSection from '../../../components/stripe/SubscriptionSection';
import UserRankDisplay from '../../../components/navigation/UserRank';

// フック
import { useUserClass } from '../../../lib/auth/useUserClass';
import { useLatestSubscription } from '../../../lib/stripe/useSubscription';

export default function MyPage() {
  // 1. ユーザー情報とサブスクリプション情報の取得
  const { user, loading, mutateUser, visitCount } = useUserClass();
  const { subscription, loading: loadingSub } = useLatestSubscription(
    auth.currentUser,
  );
  const [showReauth, setShowReauth] = useState(false);

  // 2. サブスクリプション表示用のデータ整形
  const subscriptionStatus: 'active' | 'free' =
    subscription?.status === 'active' ? 'active' : 'free';
  const subscriptionId = subscription?.id ?? null;
  const premiumUntil = subscription?.current_period_end
    ? subscription.current_period_end.toDate()
    : null;

  // 3. ユーザー情報更新処理 (Firebase & DB)
  const handleUpdate = async (
    email?: string,
    password?: string,
    nickname?: string,
  ): Promise<void> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert('再ログインしてください');
      return;
    }

    // メールまたはパスワードに変更があれば、再認証モーダルを開いて中断
    const isEmailChanged = email && email !== currentUser.email;
    const isPasswordChanged = !!password;

    if (isEmailChanged || isPasswordChanged) {
      setShowReauth(true);
      return;
    }

    try {
      // ニックネームの更新 (Firebase)
      if (nickname && nickname !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName: nickname });
      }

      // ニックネームの更新 (DB)
      if (nickname) {
        const token = await getIdToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/me`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ nickname }),
          },
        );
        if (!res.ok) throw new Error('DB 更新失敗');
      }

      await mutateUser?.();
      alert('情報を更新しました');
    } catch (err: unknown) {
      if (
        err instanceof FirebaseError &&
        err.code === 'auth/requires-recent-login'
      ) {
        setShowReauth(true);
        return;
      }
      const errorMessage = getFirebaseAuthError(err);
      alert(errorMessage);
    }
  };

  // 4. ログアウト処理
  const handleLogout = () => firebaseSignOut(auth);

  // 5. ローディング表示
  if (loading || loadingSub || !user) {
    return (
      <AuthLoginCheck>
        <div className="text-center p-10 text-gray-500">読み込み中...</div>
      </AuthLoginCheck>
    );
  }

  return (
    <AuthLoginCheck>
      <div className="max-w-md mx-auto p-4 space-y-8">
        <h1 className="text-3xl font-bold mb-6 text-center tracking-wide">
          マイページ
        </h1>

        {/* ユーザー情報カード */}
        <section>
          <UserCard
            user={user}
            onUpdate={handleUpdate}
            onLogout={handleLogout}
            onShowReauth={() => setShowReauth(true)}
          />
        </section>

        {/* サブスクリプション情報 */}
        <section className="mt-8">
          <SubscriptionSection
            subscriptionStatus={subscriptionStatus}
            premiumUntil={premiumUntil}
            subscriptionId={subscriptionId}
            user={auth.currentUser}
          />
        </section>

        {/* --- ★ ランクと訪問回数の表示を追加 --- */}
        <section className="text-center p-6 bg-[#D3D6C6]  rounded-2xl shadow-sm border border-blue-100">
          <p className="text-sm text-blue-600 font-bold mb-1">現在のランク</p>
          <div className="mb-2">
            <UserRankDisplay />
          </div>
          <p className="text-gray-600 text-sm">
            累計バッジ獲得数:{' '}
            <span className="font-bold text-lg text-gray-800">
              {visitCount}
            </span>{' '}
            回
          </p>
        </section>

        {/* 日記リスト */}
        <section className="mt-8 border-t pt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            マイ日記
          </h2>
          <Diary />
        </section>

        {/* 再認証モーダル（メール・パスワード変更用） */}
        <ReauthUpdateModal
          isOpen={showReauth}
          onClose={() => setShowReauth(false)}
          onSuccess={() => {
            mutateUser?.();
            alert('ログイン情報を更新しました');
          }}
        />
      </div>
    </AuthLoginCheck>
  );
}
