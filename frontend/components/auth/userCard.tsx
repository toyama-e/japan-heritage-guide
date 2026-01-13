'use client';

import { Button } from '../ui/Button';
import AuthForm from '../auth/authform';
import React from 'react';
import { Card } from '../ui/Card';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';

type UserCardProps = {
  user: User;
  onUpdate: (
    email?: string,
    password?: string,
    nickname?: string,
  ) => Promise<void>;
  onLogout: () => void;
  onShowReauth?: () => void;
};

export default function UserCard({
  user,
  onUpdate,
  onLogout,
  onShowReauth,
}: UserCardProps) {
  const [editable, setEditable] = React.useState(false);
  const router = useRouter();

  const handleUpdate = async (
    email?: string,
    password?: string,
    nickname?: string,
  ) => {
    try {
      await onUpdate(email, password, nickname);
      setEditable(false);
      router.refresh();
    } catch {
      if (onShowReauth) onShowReauth();
    }
  };

  return (
    <Card className="bg-[#FBE3CF] mb-6">
      <h2 className="text-xl font-semibold mb-4 text-center">ユーザー情報</h2>

      {editable ? (
        <AuthForm
          submitText="更新"
          requireNickname
          showPassword
          showEmail
          onSubmit={handleUpdate}
          initialEmail={user.email || ''}
          initialNickname={user.displayName || ''}
        />
      ) : (
        <div className="space-y-2">
          <p>
            <span className="text-sm font-semibold text-gray-700">
              ニックネーム :
            </span>{' '}
            <span className="text-sm text-gray-600">
              {user.displayName || '未設定'}
            </span>
          </p>

          <p>
            <span className="text-sm font-semibold text-gray-700">
              メール :{' '}
            </span>{' '}
            <span className="text-sm text-gray-600">{user.email}</span>
          </p>

          <p>
            <span className="text-sm font-semibold text-gray-700">
              パスワード :
            </span>{' '}
            <span className="text-sm text-gray-400">***************</span>
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
