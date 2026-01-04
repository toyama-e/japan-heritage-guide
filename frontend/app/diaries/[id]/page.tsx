'use client';

import { useParams } from 'next/navigation';

export default function DiaryDetailPage() {
  const params = useParams();
  const id = params.id; // URLからIDを取得

  // 表示確認用のダミーデータ（本来はIDを元にAPIから取得します）
  const diary = {
    date: '2025年5月28日',
    user: 'ひろ',
    location: '厳島神社',
    title: 'タイトルが入ります。タイトルが入ります。タイトルが入ります。タイトルが入ります。',
    visitDate: '2026年1月20日',
    content: `本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。本文が入ります。`,
  };

  return (
    
    <div className="bg-white min-h-screen pb-24 text-black">
      {/* 画面幅を制限するコンテナ */}
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-sm relative">
        
      {/* ヘッダー */}
      <header className="flex justify-between items-center p-4 bg-white border-b">
        <div className="border border-gray-400 px-4 py-1 text-sm bg-white font-bold">ロゴ</div>
        <button className="bg-white border border-gray-300 px-4 py-1 rounded-full text-xs">ログイン</button>
      </header>

        <main className="px-6">
          {/* 日付・ユーザー名 */}
          <div className="text-[10px] text-gray-500 flex gap-4 mb-2">
            <span>{diary.date}</span>
            <span>{diary.user}</span>
          </div>

          {/* 場所タグ */}
          <div className="mb-4">
            <span className="bg-gray-200 text-gray-700 text-[10px] px-3 py-1 rounded-full">
              {diary.location}
            </span>
          </div>

          {/* タイトル */}
          <h1 className="text-sm font-bold leading-relaxed mb-6">
            {diary.title}
          </h1>

          {/* 画像エリア */}
          <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-6 border border-gray-200">
            <span className="text-gray-400 text-3xl">🖼️</span>
          </div>

          {/* 訪問日 */}
          <div className="text-[10px] text-gray-500 mb-2">
            訪問日　{diary.visitDate}
          </div>

          {/* 本文 */}
          <p className="text-xs text-gray-700 leading-relaxed mb-10 whitespace-pre-wrap">
            {diary.content}
          </p>

          {/* アクションボタン */}
          <div className="flex justify-between gap-2 mb-10">
            <button className="flex-1 bg-gray-100 py-2 rounded-full text-xs text-gray-600 font-bold">編集</button>
            <button className="flex-1 bg-gray-100 py-2 rounded-full text-xs text-gray-600 font-bold">削除</button>
            <button className="flex-1 bg-gray-100 py-2 rounded-full text-xs text-gray-600 font-bold">登録</button>
          </div>
        </main>

      </div>
    </div>
  );
}