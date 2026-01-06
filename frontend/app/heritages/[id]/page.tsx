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
    <div className="App p-10 h-dvh bg-sky-50">
      <div className="p-10 shadow shadow-gray-300 bg-white">
        <h2 className="mb-7 text-4xl font-black">詳細ページ</h2>

        <div>
          <p className="mb-5">世界遺産名：{data.name}</p>
          <p className="mb-5">区分：{data.type}</p>
          <p className="mb-5">所在地：{data.address}</p>
        </div>
      </div>
    </div>
  );
}
