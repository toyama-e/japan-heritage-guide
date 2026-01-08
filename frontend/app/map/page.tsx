'use client';

import { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Heritage {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  image_url?: string;
}

export default function MapPage() {
  const [heritages, setHeritages] = useState<Heritage[]>([]);
 
  const [selectedSpot, setSelectedSpot] = useState<Heritage | null>(null);
  
  const router = useRouter();
  
  // 環境変数からAPIキーとURLを取得
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const mapId = '41d078aca33e110ef21a23f5';

  useEffect(() => {
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
              // 最初は日本地図全体を映す
              defaultCenter={{ lat: 37.5, lng: 137.5 }} 
              defaultZoom={5}
              gestureHandling={'greedy'}
              disableDefaultUI={true}
              mapId={mapId}
              style={{ width: '100%', height: '100%' }}
              // 地図の余白をタップしたらボトムシートが閉じる
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

      {/* 2. スマホ用ボトムシート（詳細パネル） */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out transform ${
          selectedSpot ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxWidth: '28rem', margin: '0 auto' }} 
      >
        {/* つまみ部分（デザイン用） */}
        <div className="flex justify-center p-3 cursor-pointer" onClick={() => setSelectedSpot(null)}>
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>

        {selectedSpot && (
          <div className="px-6 pb-10 pt-2">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 leading-tight">{selectedSpot.name}</h2>
              </div>
              <button onClick={() => setSelectedSpot(null)} className="text-gray-300 hover:text-gray-500 text-2xl">✕</button>
            </div>

            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              {selectedSpot.description || "この遺産についての詳細な情報を確認しましょう。"}
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