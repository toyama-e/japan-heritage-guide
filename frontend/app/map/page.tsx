'use client';

import { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

//カードを追加（スマホで見やすいように。サマリーと画像を追加）
interface Heritage {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  summary?: string; 
  image_url?: string;
}

export default function MapPage() {
  const [heritages, setHeritages] = useState<Heritage[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<Heritage | null>(null);
  const router = useRouter();
  
  //googe maps APIキーと、API URLはenvへ。
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const mapId = '41d078aca33e110ef21a23f5';

  useEffect(() => {
    if (!apiUrl) {
      console.warn("APIのURLが設定されていません。");
      return;
    }

    const fetchHeritages = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/v1/heritages`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setHeritages(data);
      } catch (error) {
        console.error("データの取得に失敗しました:", error);
      }
    };
    fetchHeritages();
  }, [apiUrl]);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-lg overflow-hidden font-sans relative">
      
      {/* 1. 地図エリア */}
      <div className="w-full h-full relative">
        {apiKey && (
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={{ lat: 37.5, lng: 137.5 }} 
              defaultZoom={5}
              gestureHandling={'greedy'}
              disableDefaultUI={true}
              mapId={mapId}
              style={{ width: '100%', height: '100%' }}
              onClick={() => setSelectedSpot(null)}
            >
              {heritages.map((spot) => (
                <AdvancedMarker
                  key={spot.id}
                  position={{ lat: Number(spot.latitude), lng: Number(spot.longitude) }}
                  clickable={true} 
                  onClick={() => setSelectedSpot(spot)}
                >
                  <Pin background={'#6B7B4F'} glyphColor={'#FFF'} borderColor={'#FFF'} />
                </AdvancedMarker>
              ))}
            </Map>
          </APIProvider>
        )}
      </div>

      {/* 2. ボトムシート（詳細パネル） */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out transform ${
          selectedSpot ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxWidth: '28rem', margin: '0 auto' }} 
      >
        {/* つまみ（閉じる） */}
        <div className="flex justify-center p-3 cursor-pointer" onClick={() => setSelectedSpot(null)}>
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>

        {selectedSpot && (
          <div className="px-6 pb-10 pt-2">
            
            {/* 遺産の写真表示エリア */}
            {selectedSpot.image_url && (
              <div className="mb-4 -mx-6 overflow-hidden border-b border-gray-100">
                <img
                  src={selectedSpot.image_url}
                  alt={selectedSpot.name}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 pr-4">
                <h2 className="text-xl font-bold text-gray-800 leading-tight">
                  {selectedSpot.name}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedSpot(null)} 
                className="text-gray-300 hover:text-gray-500 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* 概要テキスト（APIのsummary） */}
            <p className="text-sm text-gray-600 mb-6 leading-relaxed line-clamp-3">
              {selectedSpot.summary || "日本の歴史を象徴する、貴重な文化遺産です。"}
            </p>

            <button 
              onClick={() => router.push(`/heritages/${selectedSpot.id}`)}
              className="w-full bg-[#6B7B4F] hover:bg-[#5A6943] text-white py-4 rounded-xl font-bold shadow-md active:scale-95 transition-all text-center"
            >
              この場所を詳しく知る
            </button>
          </div>
        )}
      </div>

      {/* 3. 「一覧からさがす」ボタン（ピン未選択時のみ表示） */}
      {!selectedSpot && (
        <div className="absolute bottom-10 left-0 right-0 px-8 pointer-events-none">
          <Link href="/heritages" className="pointer-events-auto">
            <button className="w-full bg-[#6B7B4F] hover:bg-[#5A6943] text-white py-4 rounded-lg shadow-xl text-lg font-medium tracking-wider active:scale-95 transition-all">
              一覧からさがす
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}