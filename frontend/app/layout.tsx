import type { ReactNode } from 'react';
import './globals.css';
import { notoSerifJP } from './fonts';
import { BottomTabBar } from '../components/navigation/BottomTabBar';

export const metadata = {
  title: 'いさんぽJAPAN',
  description: '世界遺産の価値が直感でわかる旅アプリ',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className={notoSerifJP.className}>
        <main className="min-h-screen pb-20">{children}</main>
        <BottomTabBar />
      </body>
    </html>
  );
}
