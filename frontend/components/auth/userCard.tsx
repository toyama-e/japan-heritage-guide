'use client';

import { Button } from '../ui/Button';
import AuthForm from '../auth/authform';
import React from 'react';
import { Card } from '../ui/Card';
import { useRouter } from 'next/navigation';

type UserCardProps = {
  user: { email?: string | null; nickname?: string | null };

  onUpdate: (
    email: string,
    _password?: string,
    nickname?: string,
  ) => Promise<void>;
  onLogout: () => void;
};

export default function UserCard({ user, onUpdate, onLogout }: UserCardProps) {
  const [editable, setEditable] = React.useState(false);
  const router = useRouter();

  // 更新時にフォーム閉じて再描画
  const handleUpdate = async (
    email: string,
    _password?: string,
    nickname?: string,
  ) => {
    await onUpdate(email, _password, nickname);
    setEditable(false);
    router.refresh(); // ページ再描画
  };

  return (
    <Card className="bg-[#FBE3CF] mb-6">
      <h2 className="text-xl font-semibold mb-4 text-center">ユーザー情報</h2>
      {editable ? (
        <AuthForm
          submitText="更新"
          requireNickname
          onSubmit={handleUpdate}
          showPassword={false}
          initialEmail={user.email || ''}
          initialNickname={user.nickname || ''}
        />
      ) : (
        <div className="space-y-2">
          <p>
            <span className="text-lg font-semibold">ニックネーム:</span>{' '}
            {user.nickname}
          </p>
          <p>
            <span className="text-lg font-semibold">メール:</span> {user.email}
          </p>
          <p>
            <span className="text-lg font-semibold">パスワード:</span> ※※※※※※※※
          </p>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <Button
          className="flex-1 bg-[#E6DAD0] hover:bg-[#dfcfc3] shadow-sm text-sm py-2"
          onClick={() => setEditable(!editable)}
        >
          {editable ? 'キャンセル' : 'ユーザー情報変更'}
        </Button>
        <Button
          className="flex-1 bg-white hover:bg-gray-100 text-sm py-2"
          onClick={onLogout}
        >
          ログアウト
        </Button>
      </div>
    </Card>
  );
}
