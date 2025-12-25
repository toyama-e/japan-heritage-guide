import type { ReactNode } from 'react';
import './globals.css';
import './globals.css';
// import { BottomTabBar } from '../components/navigation/BottomTabBar';

export const metadata = {
  title: 'いさんぽJAPAN',
  description: '世界遺産の価値が直感でわかる旅アプリ',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {/* フッター分だけ余白を確保（BottomTabBarがfixed想定） */}
        <main className="min-h-screen pb-20">{children}</main>

        {/* BottomTabBarができたら有効化 */}
        {/* <BottomTabBar /> */}
      </body>
    </html>
  );
}
