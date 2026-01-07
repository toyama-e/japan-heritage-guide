'use client';

import { useParams, useRouter } from 'next/navigation';

const allDiaries = [
  { 
    id: 1, 
    date: '2026年5月28日', 
    user: 'ひろ', 
    location: '弥山（宮島）',
    title: 'ハイキングにもってこい', 
    content: '初挑戦の弥山登山。紅葉谷駅までロープウェーで行き、そこから山頂へはなかなか登りがいのある50分の登山コースでした。程よい汗をかいた後に山頂から眺める瀬戸内海は最高です！',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Itsukushima_Gate.jpg',
    visitDate: '2026年5月28日'
  },
  { 
    id: 2, 
    date: '2025年8月20日', 
    user: 'aya', 
    location: '厳島神社',
    title: '歴史ロマン', 
    content: '荘厳ながら優美な社殿！当時の平家の繁栄ぶりが感じられました。夏は緑と赤い社殿のコントラストが美しいけれど、紅葉の季節にも訪れてみたいなあ。',
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/66/%E5%B9%B3%E6%B8%85%E7%9B%9B%E5%83%8F%EF%BC%88%E5%8E%B3%E5%B3%B6%E7%A5%9E%E7%A4%BE%EF%BC%89.jpg',
    visitDate: '2025年8月15日'
  },
  { 
    id: 3, 
    date: '2025年11月5日', 
    user: 'えりぴ', 
    location: '宮島 商店街',
    title: 'お土産もたくさん', 
    content: '有名な杓子のほかにも、宮島土鈴や張り子などならではのお土産もたくさんありました。島内には野生の鹿がいたるところに。奈良の鹿と違って少し気性が荒め？',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Itsukushima2001-02.JPG',
    visitDate: '2025年11月3日'
  },
  { 
    id: 4, 
    date: '2025年11月10日', 
    user: 'かみむー', 
    location: '紅葉谷公園',
    title: 'そろそろ紅葉がピーク', 
    text: '私が行った頃には、ちょうど色づきが進んで見頃の直前でした。今はきっとピークを迎えているはず！宮島の紅葉谷は歩いているだけで心が洗われるような美しさです。ぜひカメラを片手に散策に訪れてみてください。',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/%E5%AE%AE%E5%B3%B6%E7%B4%85%E8%91%89%E8%B0%B7_-_panoramio.jpg',
    visitDate: '2025年11月10日'
  },
  { 
    id: 5, 
    date: '2025年11月29日', 
    user: 'ごま', 
    location: '宮島一周',
    title: '島中真っ赤でした', 
    content: '紅葉に誘われて島を一周。有名なスポットも良いですが、少し奥へ歩くと自分だけの絶景が見つかります。色づいた木々の隙間から見える瀬戸内海の青さが最高でした。歩きやすい靴で、ぜひ隅々まで歩いてみてほしいです！',
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Autumn_colours_on_Miyajima_Island_Japan.jpg',
    visitDate: '2025年11月25日'
  },
];

export default function DiaryDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // URLのID（文字列）を数値に変換して、該当するデータを検索
  const diary = allDiaries.find(d => d.id === Number(params.id));

  if (!diary) {
    return <div className="p-10 text-center">日記が見つかりませんでした。</div>;
  }

  return (
    <div className="bg-white min-h-screen pb-24 text-black">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-sm relative">
        
        {/* ヘッダー */}
        <header className="flex justify-between items-center p-4 bg-white border-b sticky top-0 z-10">
          <div 
            className="border border-gray-400 px-4 py-1 text-sm bg-white font-bold cursor-pointer"
            onClick={() => router.push('/diaries')}
          >
            ロゴ
          </div>
          <button className="bg-white border border-gray-300 px-4 py-1 rounded-full text-xs">ログイン</button>
        </header>

        <main className="px-6 pt-4">
          <div className="text-[10px] text-gray-500 flex gap-4 mb-2">
            <span>{diary.date}</span>
            <span>{diary.user}</span>
          </div>

          <div className="mb-4">
            <span className="bg-gray-200 text-gray-700 text-[10px] px-3 py-1 rounded-full">
              {diary.location}
            </span>
          </div>

          <h1 className="text-sm font-bold leading-relaxed mb-6">
            {diary.title}
          </h1>

          <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6 border border-gray-200">
            {diary.image && (
              <img 
                src={diary.image} 
                alt={diary.title} 
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="text-[10px] text-gray-500 mb-2">
            訪問日　{diary.visitDate}
          </div>

          <p className="text-xs text-gray-700 leading-relaxed mb-10 whitespace-pre-wrap">
            {/* contentが無い場合はtextを表示する */}
            {diary.content || (diary as any).text}
          </p>

          <div className="flex justify-between gap-2 mb-10">
            <button className="flex-1 bg-gray-100 py-2 rounded-full text-xs text-gray-600 font-bold active:bg-gray-200">編集</button>
            <button className="flex-1 bg-gray-100 py-2 rounded-full text-xs text-gray-600 font-bold active:bg-gray-200">削除</button>
            <button className="flex-1 bg-gray-100 py-2 rounded-full text-xs text-gray-600 font-bold active:bg-gray-200">登録</button>
          </div>
          
          <button 
            onClick={() => router.back()}
            className="w-full bg-[#6B7B4F] hover:bg-[#5A6943] text-white py-4 rounded-lg shadow-sm transition-all active:scale-[0.97] text-lg font-medium tracking-wider"
          >
            一覧にもどる
          </button>
        </main>
      </div>
    </div>
  );
}