'use client';
// import Link from 'next/link';
import useSWR from 'swr';

type HeritageData = {
  id: number;
  name: string;
  type: string;
  address: string;
  year: number;
  latitude: number;
  longitude: number;
  summary: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Heritages() {
  const { data: list, error } = useSWR<HeritageData[]>(
    'http://localhost:8000/api/v1/heritages',
    fetcher,
  );

  if (error) return <div className="p-4">データ取得に失敗しました</div>;
  if (!list) return <div className="p-4">読み込み中...</div>;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-[#FCE4CF] text-gray-700">
            <th className="px-2 py-3 font-normal text-left border border-gray-200">
              No.
            </th>
            <th className="px-2 py-3 font-normal text-left border border-gray-200">
              世界遺産名
            </th>
            <th className="px-2 py-3 font-normal text-left border border-gray-200">
              所在地
            </th>
            <th className="px-2 py-3 font-normal text-left border border-gray-200">
              区分
            </th>
          </tr>
        </thead>

        <tbody>
          {list.map((item) => (
            <tr key={item.id} className="h-12">
              <td className="px-2 text-center border border-gray-200">
                {item.id}
              </td>
              <td className="px-2 border border-gray-200">{item.name}</td>
              <td className="px-2 border border-gray-200 whitespace-nowrap">
                {item.address}
              </td>
              <td className="px-2 text-center border border-gray-200 whitespace-nowrap">
                {item.type}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
