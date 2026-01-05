'use client';

import { useState, useEffect } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import Link from 'next/link'; // 1. Linkをインポート

interface Heritage {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export default function MapPage() {
  const [heritages, setHeritages] = useState<Heritage[]>([]);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const defaultCenter = { lat: 36.0, lng: 138.0 };

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
    <div className="flex flex-col h-screen w-full relative"> {/* relativeを追加 */}
      
      {/* 2. 一覧へ遷移するフローティングボタン */}
      <div className="absolute top-4 right-4 z-20">
        <Link href="/heritages">
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-full shadow-lg transition-all flex items-center gap-2">
            <span>📋 一覧から探す</span>
          </button>
        </Link>
      </div>

      <div className="flex-grow w-full h-full relative">
        {apiKey && (
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={defaultCenter}
              defaultZoom={5}
              gestureHandling={'greedy'}
              style={{ width: '100%', height: '100%' }}
            >
              {heritages.map((spot) => (
                <Marker
                  key={spot.id}
                  position={{ 
                    lat: Number(spot.latitude), 
                    lng: Number(spot.longitude) 
                  }}
                  title={spot.name}
                  onClick={() => alert(`名称: ${spot.name}`)}
                />
              ))}
            </Map>
          </APIProvider>
        )}
      </div>
    </div>
  );
}