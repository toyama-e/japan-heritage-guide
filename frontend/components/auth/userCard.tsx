'use client';

import { Button } from '../ui/Button';
import AuthForm from '../auth/authform';
import React from 'react';

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

  return (
    <div className="mb-6 bg-[#FBE3CF] p-4 rounded-xl shadow-md">
      {editable ? (
        <AuthForm
          submitText="更新"
          requireNickname
          onSubmit={onUpdate}
          showPassword={false}
          initialEmail={user.email || ''}
          initialNickname={user.nickname || ''}
        />
      ) : (
        <div className="space-y-1 text-base">
          <p className="text-lg font-semibold">ニックネーム: {user.nickname}</p>
          <p className="text-lg font-semibold">メール: {user.email}</p>
          <p className="text-lg font-semibold">パスワード: ※※※※※※※※</p>
        </div>
      )}

      <div className="flex gap-3 mt-5">
        <Button
          className="flex-1 bg-[#E6DAD0] hover:bg-[#dfcfc3] shadow-sm text-sm py-2"
          onClick={() => setEditable(!editable)}
        >
          {editable ? 'キャンセル' : 'ユーザー情報変更'}
        </Button>
        <Button
          className="flex-1 bg-white hover:bg-gray-100 shadow-sm text-sm py-2"
          onClick={onLogout}
        >
          ログアウト
        </Button>
      </div>
    </div>
  );
}
