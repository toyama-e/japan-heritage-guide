'use client';

import { useState, FormEvent } from 'react';
import { getIdToken } from '../../lib/auth/getidtoken';

interface AuthFormProps {
  onSubmit: (
    email?: string,
    password?: string,
    nickname?: string,
  ) => Promise<unknown>;
  submitText: string;
  requireNickname?: boolean;
  showPassword?: boolean;
  showEmail?: boolean;
  initialEmail?: string;
  initialNickname?: string;
}

export default function AuthForm({
  onSubmit,
  submitText,
  requireNickname = false,
  showPassword = true,
  showEmail = true, // デフォルトは true（新規登録・ログイン用）
  initialEmail = '',
  initialNickname = '',
}: AuthFormProps) {
  // 入力状態の管理
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState(initialNickname);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // フォーム送信処理
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await onSubmit(
        email,
        showPassword ? password : undefined,
        nickname || undefined,
      );

      const token = await getIdToken();
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔥 ニックネーム:', nickname);
        console.log('🔥 メールアドレス:', email);
        console.log('🔥 Idトークン:', token);
      }

      setMessage('登録しました！');

      if (showPassword) setPassword('');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(`登録失敗: ${error.message}`);
      } else {
        setMessage('登録失敗: 不明なエラー');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-10 w-full max-w-sm space-y-4"
    >
      {/* ニックネーム */}
      {requireNickname && (
        <input
          type="text"
          placeholder="ニックネーム"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="
          w-full rounded-lg border border-gray-300
          px-4 py-3 text-sm
          focus:border-black focus:outline-none
        "
        />
      )}

      {/* メール */}
      {showEmail && (
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="
          w-full rounded-lg border border-gray-300
          px-4 py-3 text-sm
          focus:border-black focus:outline-none
        "
        />
      )}
      {/* パスワード */}
      {showPassword && (
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="
          w-full rounded-lg border border-gray-300
          px-4 py-3 text-sm
          focus:border-black focus:outline-none
        "
        />
      )}

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={
          loading ||
          ((!showEmail || !email) &&
            (!showPassword || !password) &&
            (!requireNickname || !nickname))
        }
        className="
          w-full rounded-lg bg-black py-3
          text-sm font-medium text-white
          transition
          hover:bg-gray-800
          disabled:cursor-not-allowed
          disabled:bg-gray-400
        "
      >
        {loading ? '処理中…' : submitText}
      </button>

      {/* メッセージ */}
      {message && (
        <p className="pt-2 text-center text-sm text-gray-600">{message}</p>
      )}
    </form>
  );
}
