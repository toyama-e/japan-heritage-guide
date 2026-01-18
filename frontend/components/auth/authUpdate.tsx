'use client';

import { useState, useEffect } from 'react';
import { auth } from '../../lib/auth/firebase';
import { getFirebaseAuthError } from '../../lib/auth/firebaseError';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
} from 'firebase/auth';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function ReauthUpdateModal({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // モーダルが開くたびにフォームをリセット
  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewEmail('');
      setNewPassword('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --------------------------
  // ボタン制御
  // --------------------------
  const isSubmitDisabled =
    loading || !currentPassword || (!newEmail && !newPassword);

  const handleSubmit = async (): Promise<void> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert('再ログインしてください');
      return;
    }

    if (!currentUser.email) {
      alert('メールアドレスが取得できません');
      return;
    }

    setLoading(true);
    try {
      // 1. 再認証
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword,
      );
      await reauthenticateWithCredential(currentUser, credential);

      // 2. Firebase Auth の更新
      if (newEmail && newEmail !== currentUser.email) {
        await updateEmail(currentUser, newEmail);
      }
      if (newPassword) {
        await updatePassword(currentUser, newPassword);
      }

      alert('ログイン情報を更新しました。');
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const message = getFirebaseAuthError(err);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // backdrop クリックで閉じる
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* モーダル本体 */}
      <div
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-2 text-gray-800 tracking-wide">
          ログイン情報の更新
        </h2>

        {/* 説明文 */}
        <span className="font-semibold text-gray-700">現在</span>

        <div className="space-y-4">
          {/* 現在のパスワード */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              パスワード（必須）
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="
                w-full p-3 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-blue-500 outline-none
                placeholder:text-gray-300
              "
            />
          </div>

          <hr className="my-4 border-gray-100" />
          <span className="font-semibold text-gray-700">変更後</span>

          {/* 新しいメールアドレス */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              新しいメールアドレス（任意）
            </label>
            <input
              type="email"
              placeholder="example@mail.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="
                w-full p-3 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-blue-500 outline-none
                placeholder:text-gray-300
              "
            />
          </div>

          {/* 新しいパスワード */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              新しいパスワード（任意）
            </label>
            <input
              type="password"
              placeholder="6文字以上"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="
                w-full p-3 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-blue-500 outline-none
                placeholder:text-gray-300
              "
            />
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`flex-1 font-bold py-3 rounded-lg transition ${
              isSubmitDisabled
                ? 'opacity-50 cursor-not-allowed'
                : 'bg-[#E6DAD0] text-gray-800 hover:bg-[#dfcfc3]'
            }`}
          >
            {loading ? '更新中...' : '確定'}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
