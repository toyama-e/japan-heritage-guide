'use client';

import useSWR from 'swr';
import { getIdToken } from '../../lib/auth/getidtoken';
import { TitleText } from '../ui/TitleText';

// あなたが提示した fetcher ロジック
const fetcherWithToken = async (url: string) => {
  const token = await getIdToken();
  const res = await fetch(url, {
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  });
  if (!res.ok) throw new Error(`API取得失敗: ${res.status}`);
  return res.json();
};

export default function UserRankDisplay() {
  // SWR で訪問件数を取得
  const { data, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/visits/me`,
    fetcherWithToken,
  );

  if (isLoading)
    return <span className="animate-pulse opacity-50">確認中...</span>;
  if (error) return <TitleText count={0} />; // エラー時は「未獲得」にする

  // data.count を TitleText に渡す
  return <TitleText count={data?.count ?? 0} />;
}
