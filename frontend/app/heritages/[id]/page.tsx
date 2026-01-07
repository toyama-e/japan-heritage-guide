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
  spot1_title: string;
  spot1_detail: string;
  spot2_title: string;
  spot2_detail: string;
  spot3_title: string;
  spot3_detail: string;
  sites: string;
  image_url: string;
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
        <h2 className="text-3xl font-bold text-gray-900">{data.name}</h2>

        <p className="text-sm text-gray-500">（区分：{data.type}）</p>

        <img
          src={data.image_url}
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
                  {data.spot1_title}
                </h4>
              </div>
              <p className="text-sm text-gray-600 pl-10">{data.spot1_detail}</p>
            </li>

            <li className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#E6DAD0] text-white text-sm font-bold">
                  2
                </span>
                <h4 className="font-semibold text-gray-900">
                  {data.spot2_title}
                </h4>
              </div>
              <p className="text-sm text-gray-600 pl-10">{data.spot2_detail}</p>
            </li>

            <li className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#E6DAD0] text-white text-sm font-bold">
                  3
                </span>
                <h4 className="font-semibold text-gray-900">
                  {data.spot3_title}
                </h4>
              </div>
              <p className="text-sm text-gray-600 pl-10">{data.spot3_detail}</p>
            </li>
          </ol>
        </section>

        {/* 世界遺産になるまで */}
        <section className="space-y-2">
          <h3 className="bg-[#D3D6C6] font-semibold px-3 py-2 rounded">
            世界遺産になるまで
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {data.summary}
          </p>
        </section>

        {/* 世界遺産群 */}
        <section className="space-y-2">
          <h3 className="font-semibold border-b border-gray-300 pb-1">
            世界遺産群
          </h3>
          <p className="text-sm text-gray-700">{data.sites}</p>
        </section>
      </div>
    </div>
  );
}
