'use client';

import useSWR from 'swr';
import { useParams } from 'next/navigation';

type HeritageData = {
  id: number;
  name: string;
  type: string;
  address: string;
  year: number;
  summary: string;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    // 404 の場合は null を返して「存在しない」状態をフロントで処理
    if (res.status === 404) {
      const errorData = await res.json(); // { message: "データが存在しません。" }
      console.warn(errorData.message);
      return null;
    }
    // その他のエラーは例外として投げる
    throw new Error('データ取得に失敗しました');
  }

  return res.json();
};

export default function DetailHeritages() {
  // URLのidを取得
  const { id } = useParams();
  console.log('id：' + id);

  // URLからidを取得し、そのIDのデータをJSONサーバーから読み込む。
  const { data, error } = useSWR<HeritageData>(
    id ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/heritages/${id}` : null,
    fetcher,
  );

  if (error) return <p>データ取得に失敗しました。</p>;
  if (data === null)
    return (
      <p className="m-7 text-4xl font-black text-orange-500">
        指定したIDのデータは存在しません。
      </p>
    );
  if (!data) return <p>読み込み中...</p>;

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* ヘッダー */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">{data.name}</h2>

        <p className="text-sm text-gray-500">（区分：{data.type}）</p>

        <img
          src="https://firebasestorage.googleapis.com/v0/b/final-project-f4891.firebasestorage.app/o/world_heritage%2F1.Horyuji.jpg?alt=media"
          alt="世界遺産画像"
          className="w-full h-auto rounded-lg object-cover"
        />
      </div>

      {/* メイン */}
      <div className="space-y-6">
        {/* 見どころTOP3 */}
        <section className="space-y-4">
          <h3 className="bg-[#FBE3CF]  font-semibold px-3 py-2 rounded">
            推しスポット3選
          </h3>

          <ol className="space-y-4">
            <li className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#E6DAD0] text-white text-sm font-bold">
                  1
                </span>
                <h4 className="font-semibold text-gray-900">
                  五重塔（ごじゅうのとう）の木組み構造
                </h4>
              </div>
              <p className="text-sm text-gray-600 pl-10">
                釘を使わずに木を組み合わせた、高度な大工技術を見ることができます。
              </p>
            </li>

            <li className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#E6DAD0] text-white text-sm font-bold">
                  2
                </span>
                <h4 className="font-semibold text-gray-900">
                  金堂（こんどう）の仏像配置
                </h4>
              </div>
              <p className="text-sm text-gray-600 pl-10">
                仏像の並び方から、当時の仏教の考え方が伝わってきます。
              </p>
            </li>

            <li className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#E6DAD0] text-white text-sm font-bold">
                  3
                </span>
                <h4 className="font-semibold text-gray-900">
                  回廊（かいろう）の柱と屋根
                </h4>
              </div>
              <p className="text-sm text-gray-600 pl-10">
                長い年月を経ても残る造りから、建物の丈夫さがわかります。
              </p>
            </li>
          </ol>
        </section>

        {/* 世界遺産になるまで */}
        <section className="space-y-2">
          <h3 className="bg-[#D3D6C6] font-semibold px-3 py-2 rounded">
            世界遺産になるまで
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            法隆寺は、日本に仏教が広まった初期の姿を今に伝える寺院です。現存する木造建築としては世界でもとても古く、当時の建築技術や仏教文化を知る貴重な資料として評価され、世界遺産に登録されました。
          </p>
        </section>

        {/* 世界遺産群 */}
        <section className="space-y-2">
          <h3 className="font-semibold border-b border-gray-300 pb-1">
            世界遺産群
          </h3>
          <p className="text-sm text-gray-700">法隆寺, 法起寺</p>
        </section>
      </div>
    </div>
  );
}
