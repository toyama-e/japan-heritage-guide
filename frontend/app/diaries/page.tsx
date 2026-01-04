'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DiaryListPage() {
  const [activeTab, setActiveTab] = useState<'mine' | 'all'>('all');

  // ダミーデータに image プロパティを追加
  const allDiaries = [
    { 
      id: 1, 
      date: '2026年5月28日', 
      user: 'ひろ', 
      title: 'ハイキングにもってこい', 
      text: '初挑戦の弥山登山。紅葉谷駅までロープウェーで行き、そこから山頂へはなかなか登りがいのある50分の登山コースでした。程よい汗をかいた後に山頂から眺める瀬戸内海は最高です！',
      image: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Itsukushima_Gate.jpg'
    },
    { 
      id: 2, 
      date: '2025年8月20日', 
      user: 'aya', 
      title: '歴史ロマン', 
      text: '荘厳ながら優美な社殿！当時の平家の繁栄ぶりが感じられました。夏は緑と赤い社殿のコントラストが美しいけれど、紅葉の季節にも訪れてみたいなあ。',
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/66/%E5%B9%B3%E6%B8%85%E7%9B%9B%E5%83%8F%EF%BC%88%E5%8E%B3%E5%B3%B6%E7%A5%9E%E7%A4%BE%EF%BC%89.jpg'
    },
    { 
      id: 3, 
      date: '2025年11月5日', 
      user: 'えりぴ', 
      title: 'お土産もたくさん', 
      text: '有名な杓子のほかにも、宮島土鈴や張り子などならではのお土産もたくさんありました。島内には野生の鹿がいたるところに。奈良の鹿と違って少し気性が荒め？',
      image: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Itsukushima2001-02.JPG'
    },
  ];

  const myDiaries = [
    { 
      id: 1, 
      date: '2026年5月28日', 
      user: 'ひろ', 
      title: 'ハイキングにもってこい', 
      text: '初挑戦の弥山登山。紅葉谷駅まではロープウェーで行けるけれど、そこから山頂はなかなか登りがいのある50分の登山コースでした。山頂からの瀬戸内海は絶景でした。',
      image: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Itsukushima_Gate.jpg'
    },
  ];

  const displayDiaries = activeTab === 'mine' ? myDiaries : allDiaries;

  return (
    <div className="bg-gray-100 min-h-screen text-black">
      <div className="max-w-md mx-auto bg-white min-h-screen relative pb-20 shadow-xl">
        
        {/* ヘッダー */}
        <header className="flex justify-between items-center p-4 bg-white border-b sticky top-0 z-10">
          <div className="border border-gray-400 px-4 py-1 text-sm bg-white font-bold">ロゴ</div>
          <button className="bg-white border border-gray-300 px-4 py-1 rounded-full text-xs">ログイン</button>
        </header>

        {/* タブと投稿ボタンのエリア */}
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('mine')}
              className={`px-6 py-1.5 rounded-full text-xs shadow-sm transition-colors ${
                activeTab === 'mine' ? 'bg-gray-400 text-white font-bold' : 'bg-gray-200 text-gray-600'
              }`}
            >
              マイ日記
            </button>
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-6 py-1.5 rounded-full text-xs shadow-sm transition-colors ${
                activeTab === 'all' ? 'bg-gray-400 text-white font-bold' : 'bg-gray-200 text-gray-600'
              }`}
            >
              みんなの日記
            </button>
          </div>

          <button className="bg-gray-300 w-8 h-8 rounded-full shadow-sm flex items-center justify-center text-gray-600 text-lg cursor-default">
            ＋
          </button>
        </div>

        {/* リストエリア */}
        <main className="px-4 space-y-4">
          {displayDiaries.map((diary) => (
            <Link href={`/diaries/${diary.id}`} key={diary.id} className="block active:opacity-70 transition-opacity">
              <div className="bg-gray-300 rounded-xl p-4 flex gap-4 shadow-sm">
                {/* 修正ポイント：写真表示エリア */}
                <div className="w-16 h-16 bg-white rounded-lg flex-shrink-0 overflow-hidden border border-gray-200 shadow-inner">
                  {diary.image ? (
                    <img 
                      src={diary.image} 
                      alt={diary.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400">🖼️</span>
                    </div>
                  )}
                </div>

                {/* テキストエリア */}
                <div className="flex flex-col flex-1">
                  <div className="text-[10px] text-gray-600 flex gap-2">
                    <span>{diary.date}</span>
                    <span>{diary.user}</span>
                  </div>
                  <h3 className="text-xs font-bold my-0.5 text-gray-800">{diary.title}</h3>
                  <p className="text-[10px] text-gray-600 line-clamp-2 leading-tight">{diary.text}</p>
                </div>
              </div>
            </Link>
          ))}
        </main>
      </div>
    </div>
  );
}