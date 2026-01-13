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
      <p className="text-sm text-gray-600 mb-5 leading-relaxed">
        ・解説レベルを「やさしい／まなび／くわしい」の3段階で切替
        <br />
        ・世界中の世界遺産データを網羅
        <br />
        ・AIによる旅行プラン提案
      </p>

      {isPremium ? (
        <div className="rounded-lg bg-gray-800 p-4 text-[#C5A059] text-sm space-y-3">
          <div>
            <p className="font-semibold mb-1 text-[#D4AF37]">
              🎉 プレミアム会員です
            </p>
            <p>すべての有料機能が利用できます。</p>
            {premiumUntil && (
              <p className="mt-2 text-xs text-[#C5A059]">
                有効期限：{premiumUntil.toLocaleDateString('ja-JP')}
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          <ProductList user={user} />
        </>
      )}
    </Card>
  );
}
