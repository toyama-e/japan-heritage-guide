'use client';

import { useState, useEffect } from 'react';
import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps';
import Link from 'next/link';

interface Heritage {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export default function MapPage() {
  const [heritages, setHeritages] = useState<Heritage[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    const fetchHeritages = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/heritages');
        const data = await response.json();
        setHeritages(data);
      } catch (error) {
        console.error("データの取得に失敗しました:", error);
      }
    };
    fetchHeritages();
  }, []);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-lg overflow-hidden font-sans">
      
      {/* ロゴエリア - 高さを抑えて地図のスペースを確保 */}
      <div className="p-4 flex justify-start bg-white/90 backdrop-blur-sm">
        <div className="text-gray-500 text-[10px] font-bold leading-tight tracking-widest uppercase">
          いさんぽ<br />
          <span className="text-xl text-gray-800 tracking-tighter">JAPAN</span>
        </div>
      </div>

      {/* 地図エリア - 縦幅を大きく拡張 (h-[75%]に変更) */}
      <div className="w-full h-[75%] relative">
        {apiKey && (
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={{ lat: 37.5, lng: 137.5 }} // 少し北にずらしてバランス調整
              defaultZoom={5}
              gestureHandling={'greedy'}
              disableDefaultUI={true}
              style={{ width: '100%', height: '100%' }}
            >
              {heritages.map((spot) => (
                <div key={spot.id}>
                  <Marker
                    position={{ lat: Number(spot.latitude), lng: Number(spot.longitude) }}
                    onMouseOver={() => setHoveredId(spot.id)}
                    onMouseOut={() => setHoveredId(null)}
                  />
                  {/* ×ボタンなしの吹き出し */}
                  {hoveredId === spot.id && (
                    <InfoWindow
                      position={{ lat: Number(spot.latitude), lng: Number(spot.longitude) }}
                      disableAutoPan={true}
                      headerDisabled={true} // これで×ボタンが消えます
                    >
                      <div className="px-2 py-1 text-xs font-bold text-gray-700 bg-white">
                        {spot.name}
                      </div>
                    </InfoWindow>
                  )}
                </div>
              ))}
            </Map>
          </APIProvider>
        )}
      </div>

      {/* ボタンエリア - 地図の下にスッキリ配置 */}
      <div className="flex-grow flex items-center px-8 bg-white">
        <Link href="/heritages" className="w-full">
          <button className="w-full bg-[#6B7B4F] hover:bg-[#5A6943] text-white py-4 rounded-lg shadow-sm transition-all active:scale-[0.97] text-lg font-medium tracking-wider">
            一覧からさがす
          </button>
        </Link>
      </div>

    </div>
  );
}