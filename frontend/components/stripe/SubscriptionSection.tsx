import { User } from 'firebase/auth';
import ProductList from './ProductList';
import { Card } from '../ui/Card';

type Props = {
  subscriptionStatus?: 'free' | 'active' | 'canceled';
  premiumUntil?: Date | null;
  subscriptionId?: string | null;
  user: User;
};

export default function SubscriptionSection({
  subscriptionStatus,
  premiumUntil,
  user,
}: Props) {
  const isPremium = subscriptionStatus === 'active';

  return (
    <Card className="bg-white">
      <h2 className="text-xl font-semibold mb-4 text-center">
        いさんぽPremium
      </h2>

      {isPremium ? (
        <div className="rounded-lg bg-green-50 p-4 text-green-800 text-sm space-y-3">
          <div>
            <p className="font-semibold mb-1">🎉 プレミアム会員です</p>
            <p>すべての有料機能が利用できます。</p>
            {premiumUntil && (
              <p className="mt-2 text-xs text-green-700">
                有効期限：{premiumUntil.toLocaleDateString('ja-JP')}
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-5 leading-relaxed">
            ・解説レベルを「やさしい／まなび／くわしい」の3段階で切替
            <br />
            ・世界中の世界遺産データを網羅
            <br />
            ・AIによる旅行プラン提案
          </p>

          <ProductList user={user} />
        </>
      )}
    </Card>
  );
}
