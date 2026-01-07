import { getIdToken } from '../auth/getidtoken';

// 手動フェッチ用
export const fetchMe = async () => {
  const token = await getIdToken();
  if (!token) throw new Error('User not signed in');

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch /me: ${res.status} ${text}`);
  }

  return res.json();
};

// useSWR用 fetcher
export const fetcherWithToken = async (url: string) => {
  const token = await getIdToken();
  if (!token) throw new Error('User not signed in');

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fetch error ${res.status}: ${text}`);
  }

  return res.json();
};
