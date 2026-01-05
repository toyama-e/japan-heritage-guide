'use client';

import { useState } from 'react';
import { getIdToken } from '../../lib/auth/getidtoken';

interface AuthFormProps {
  onSubmit: (email: string, password: string) => Promise<unknown>;
  submitText: string;
}

export default function AuthForm({ onSubmit, submitText }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);

    try {
      await onSubmit(email, password);
      const token = await getIdToken();

      if (process.env.NODE_ENV !== 'production') {
        console.log('🔥 success:', email);
        console.log('🔥 Idtoken:', token);
      }

      setMessage('登録しました！');
      setEmail('');
      setPassword('');
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
    <div className="mx-auto mt-10 w-full max-w-sm space-y-4">
      {/* メール */}
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

      {/* パスワード */}
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

      {/* 送信ボタン */}
      <button
        onClick={handleSubmit}
        disabled={loading || !email || !password}
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
    </div>
  );
}
