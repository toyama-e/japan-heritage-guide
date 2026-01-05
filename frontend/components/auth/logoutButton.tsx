'use client';

import { signOut } from '../../lib/auth/signout';

export default function LogoutButton() {
  return (
    <button
      onClick={signOut}
      className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
    >
      ログアウト
    </button>
  );
}
