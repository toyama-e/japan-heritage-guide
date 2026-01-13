import { User } from 'firebase/auth';
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  onSnapshot,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../lib/auth/firebase';
import { Button } from '../ui/Button';

type Price = {
  id: string;
  description: string;
  unit_amount: number;
};

type Product = {
  id: string;
  active: boolean;
  name: string;
  prices: Price[];
};

type Props = {
  user: User;
};

const ProductList = ({ user }: Props) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null); // どのボタンが処理中か管理

  // --- 初回レンダリング時に商品データを取得 ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const ref = collection(db, 'products');
        const q = query(ref, where('active', '==', true));
        const snap = await getDocs(q);

        if (snap.empty) {
          console.warn('🛒 [ProductList] 有効な商品がありません');
        }

        // 商品ごとに価格情報を取得
        const products = await Promise.all(
          snap.docs.map(async (doc) => {
            const product = { ...(doc.data() as Product), id: doc.id };

            const priceRef = collection(db, doc.ref.path, 'prices');
            const priceSnap = await getDocs(priceRef);

            if (priceSnap.empty) {
              console.warn('🛒 [ProductList] 価格が1件もありません', doc.id);
            }

            product.prices = priceSnap.docs.map((p) => ({
              ...(p.data() as Price),
              id: p.id,
            }));

            return product;
          }),
        );

        setProducts(products); // 取得データをStateに保存
      } catch (error) {
        console.error('🛒 [ProductList] 商品取得中にエラーが発生', error);
      } finally {
        setLoading(false); // ローディング完了
        console.log('🛒 [ProductList] loading を false にしました');
      }
    };

    fetchProducts();
  }, []);

  // --- Firebase版 Stripe Checkout にリダイレクトする関数 ---
  const redirectToCheckout = async (priceId: string) => {
    try {
      console.log('🛒 [Checkout] 購入ボタンクリック', {
        uid: user.uid,
        priceId,
      });
      setCheckoutLoading(priceId); // このボタンだけローディング中表示

      // customers/{uid}/checkout_sessions にドキュメント作成
      const collectionRef = collection(
        db,
        `customers/${user.uid}/checkout_sessions`,
      );
      const docRef = await addDoc(collectionRef, {
        mode: 'subscription', // ← サブスクリプションモード
        billing_address_collection: 'auto',
        success_url: window.location.origin, // 決済成功後
        cancel_url: window.location.origin, // キャンセル時
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
      });
      console.log('🛒 [Checkout] Checkout Session ドキュメント作成', docRef.id);

      // URL生成されたら自動で Stripe Checkout へ遷移
      onSnapshot(docRef, (snap) => {
        const { url, error } = snap.data() as { url?: string; error?: Error };

        if (error) {
          console.error('🛒 [Checkout] エラー', error);
          alert(`🛒 エラーが発生しました: ${error.message}`);
        }

        if (url) {
          console.log('🛒 [Checkout] Checkout URL取得、リダイレクト', url);
          window.location.assign(url);
        }
      });
    } catch (err) {
      console.error('🛒 [Checkout] Checkout 作成中にエラー', err);
      alert('🛒 Checkout 作成中にエラーが発生しました');
    } finally {
      setCheckoutLoading(null); // ローディング解除
    }
  };

  // --- ローディング中表示 ---
  if (loading) {
    return <p className="text-sm text-gray-500">プランを読み込み中...</p>;
  }

  // --- 商品がない場合の表示 ---
  if (products.length === 0) {
    return <p className="text-sm text-red-500">利用可能なプランがありません</p>;
  }

  // --- 商品リスト表示 ---
  return (
    <div className="space-y-5">
      {products.map((product) => (
        <div key={product.id} className="space-y-3">
          <h3 className="text-lg font-semibold">{product.name}</h3>

          {product.prices.map((price) => (
            <div key={price.id} className="flex items-center justify-between">
              {/* 購入ボタン */}
              <Button
                className="bg-[#C5A059] hover:bg-[#B48F48] text-white mb-4 w-auto font-bold shadow-md py-1.5 text-sm rounded"
                onClick={() => redirectToCheckout(price.id)}
                disabled={checkoutLoading === price.id} //処理中はボタン無効化
              >
                {checkoutLoading === price.id
                  ? '🛒 決済準備中...'
                  : `${price.unit_amount.toLocaleString()} 円`}
              </Button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ProductList;
