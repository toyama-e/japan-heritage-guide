'use client';

import { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, Pin } from '@vis.gl/react-google-maps';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Heritage {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export default function MapPage() {
  const [heritages, setHeritages] = useState<Heritage[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const router = useRouter();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';//frontend/.envから
  const mapId = '41d078aca33e110ef21a23f5';//Advanced Markerにアップグレードするため取得。MAP IDは公開OK

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
      
      {/* 地図エリア */}
      <div className="w-full h-[75%] relative">
        {apiKey && (
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={{ lat: 37.5, lng: 137.5 }}
              defaultZoom={5}
              gestureHandling={'greedy'}
              disableDefaultUI={true}
              mapId={mapId}
              style={{ width: '100%', height: '100%' }}
            >
              {heritages.map((spot) => (
                <div key={spot.id}>
                  <AdvancedMarker
                    position={{ lat: Number(spot.latitude), lng: Number(spot.longitude) }}
                    clickable={true} 
                    onMouseEnter={() => setHoveredId(spot.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => router.push(`/heritages/${spot.id}`)}
                  >
                    <Pin background={'#6B7B4F'} glyphColor={'#FFF'} borderColor={'#FFF'} />
                  </AdvancedMarker>
                  
                  {hoveredId === spot.id && (
                    <InfoWindow
                      position={{ lat: Number(spot.latitude), lng: Number(spot.longitude) }}
                      disableAutoPan={true}
                      headerDisabled={true}
                      pixelOffset={[0, -40]}//InfoWindowとマップピンが重なってチカチカするので少し移動
                    >
                      <div 
                        className="px-2 py-1 text-xs font-bold text-gray-700 bg-white shadow-sm cursor-pointer hover:text-[#6B7B4F]"
                        onClick={() => router.push(`/heritages/${spot.id}`)}
                      >
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

      {/* 一覧からさがすボタンエリア */}
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