'use client';

import { UserProvider, useUserClass } from '../../../lib/auth/useUserClass';

// テスト用コンポーネント
const TestProfilePage = () => {
  const { user, isPremium, premiumUntil, loading, subscription } =
    useUserClass();

  if (loading) return <div className="p-8">⏳ データを読み込み中...</div>;

  return (
    <div className="p-8 space-y-4 border rounded-lg m-4 shadow-sm">
      <h1 className="text-2xl font-bold border-b pb-2">
        👤 ユーザープロファイル確認
      </h1>

      <section>
        <h2 className="font-semibold text-gray-500">ログイン状態</h2>
        <p>{user ? `✅ ログイン済み (${user.email})` : '❌ 未ログイン'}</p>
      </section>

      <section>
        <h2 className="font-semibold text-gray-500">会員プラン</h2>
        <p className={isPremium ? 'text-green-600 font-bold' : 'text-gray-600'}>
          {isPremium ? '🌟 プレミアム会員' : '👤 無料会員'}
        </p>
      </section>

      <section>
        <h2 className="font-semibold text-gray-500">サブスク有効期限</h2>
        <p>{premiumUntil ? premiumUntil.toLocaleString() : 'なし'}</p>
      </section>

      <section className="bg-gray-100 p-4 rounded text-xs">
        <h2 className="font-semibold mb-2 text-gray-700">
          デバッグ用 raw データ (subscription)
        </h2>
        <pre>{JSON.stringify(subscription, null, 2) || 'データなし'}</pre>
      </section>
    </div>
  );
};

export default function PremiumPage() {
  return (
    <UserProvider>
      <TestProfilePage />
    </UserProvider>
  );
}
