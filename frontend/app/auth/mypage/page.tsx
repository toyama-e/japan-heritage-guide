'use client';

import useSWR from 'swr';
import { getIdToken } from '../../../lib/auth/getidtoken';
import { useEffect, useState } from 'react';
import { auth } from '../../../lib/auth/firebase';
import { updateProfile, updateEmail } from 'firebase/auth';
import { Button } from '../../../components/ui/Button';
import AuthForm from '../../../components/auth/authform';
import { AuthLoginCheck } from '../../../components/auth/authLoginCheck';

type UserData = {
  email?: string | null;
  nickname?: string | null;
};

const fetcherWithToken = async (url: string) => {
  const token = await getIdToken();

  const res = await fetch(url, {
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  });

  if (!res.ok) throw new Error(`API取得失敗: ${res.status}`);
  return res.json() as Promise<UserData>;
};

export default function MyPage() {
  const [tokenReady, setTokenReady] = useState(false);
  const [editable, setEditable] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setTokenReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const { data: user, mutate } = useSWR<UserData>(
    tokenReady ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/me` : null,
    fetcherWithToken,
  );

  //Firebase Auth の ログアウト
  const handleLogout = async () => {
    await auth.signOut();
  };

  //handleUpdate submitハンドラー Firebase と DB に同期
  const handleUpdate = async (
    email: string,
    _password?: string,
    nickname?: string,
  ) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert('再ログインしてください');
      return;
    }

    //Firebase Auth 側を更新
    if (nickname && nickname !== currentUser.displayName) {
      await updateProfile(currentUser, { displayName: nickname });
    }

    if (email && email !== currentUser.email) {
      await updateEmail(currentUser, email);
    }

    //DB 側にも PATCH で更新
    const token = await getIdToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nickname, email }),
    });

    if (!res.ok) throw new Error(`更新失敗: ${res.status}`);
    const updated = await res.json();
    mutate(updated);
    alert('更新成功');
    setEditable(false);
  };

  if (!user) {
    return (
      <AuthLoginCheck>
        <div className="max-w-md mx-auto p-4">読み込み中...</div>
      </AuthLoginCheck>
    );
  }

  return (
    <AuthLoginCheck>
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-xl font-bold mb-4">マイページ</h1>

        {editable ? (
          // 編集モード
          <AuthForm
            submitText="更新"
            requireNickname={true} // ニックネーム欄を表示
            onSubmit={handleUpdate} // 更新処理を渡す
            showPassword={false} // パスワード欄は非表示（マイページ用）
            initialEmail={user.email || ''} // 初期値に現在のメールをセット
            initialNickname={user.nickname || ''} // 初期値に現在のニックネームをセット
          />
        ) : (
          // 表示モード
          <>
            <p className="mb-4">ニックネーム : {user.nickname}</p>
            <p className="mb-4">メール : {user.email}</p>
            <p className="mb-4">パスワード : ※※※※※※※※</p>
          </>
        )}

        {/* ボタン類 */}
        <div className="flex gap-2 mt-4">
          <Button onClick={() => setEditable(!editable)}>
            {editable ? 'キャンセル' : '変更'}
          </Button>
          <Button onClick={handleLogout}>ログアウト</Button>
        </div>
      </div>
    </AuthLoginCheck>
  );
}
