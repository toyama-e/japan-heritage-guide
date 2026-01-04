import Link from 'next/link';
import useSWR, { mutate } from 'swr';

type HeritageData = {
  id: number;
  name: string;
  type: string;
  year: string;
  latitude: number;
  longitude: string;
  summary: string;
};

// fetcher関数（SWRに渡す「データ取得専用の関数」）を用意
// fetch(url) ：ブラウザ標準のAPIで、指定したURLからデータを取得
// .then(res => res.json()) ：取得したレスポンスを JSON形式に変換
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function heritages() {
  // useSWR（データ取得用のReactフック）でデータ取得
  const { data: list, error } = useSWR<HeritageData[]>(
    'http://localhost:4000/money',
    fetcher,
  );

  // エラーがあった場合表示
  if (error) return <div>データ取得に失敗しました</div>;

  // データが読み込み中または、存在しない時表示
  if (!list) return <div>読み込み中...</div>;

  return (
    <div className="list">
      <table className="w-full border-2 border-gray-300 border-collapse">
        <thead>
          <tr className="text-left bg-emerald-200">
            <th className="p-2">日付</th>
            <th className="p-2">収入/支出</th>
            <th className="p-2">カテゴリー</th>
            <th className="p-2">金額</th>
            <th className="p-2">memo</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {/* 取得したデータ配列から一つずつデータを取り出す */}
          {list.map((item: MoneyData) => (
            <tr key={item.id} className="border-1 border-gray-300">
              <td className="p-2">
                {new Date(item.date).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </td>
              <td>{item.type}</td>
              <td>{item.category}</td>
              <td className="font-black">
                {item.type === '支出'
                  ? `-${item.money.toLocaleString()}`
                  : item.money.toLocaleString()}
                円
              </td>
              <td>{item.memo}</td>
              <td className="text-sky-700 font-black">
                <Link href={`/detail/${item.id}`}>詳細へ</Link>
              </td>
              <td className="text-sky-700 font-black">
                <button onClick={() => handleDelete(item.id)}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
