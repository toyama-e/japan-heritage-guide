import { User } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
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
                className="bg-[#D3D6C6] hover:bg-[#c6c9b8]"
                onClick={() => {
                  console.log('🛒 購入ボタンクリック', {
                    uid: user.uid,
                    priceId: price.id,
                  });
                }}
              >
                {price.unit_amount.toLocaleString()}
                <span className="text-xs font-normal ml-1">円</span>
              </Button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ProductList;
