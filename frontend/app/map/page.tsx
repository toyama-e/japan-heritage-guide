'use client';

import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

export default function MapPage() {
  // ダミー（中心点）：宮島付近
  const position = { lat: 34.2959, lng: 132.3198 };

  // mapAPIキーをenvから読み込む
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <APIProvider apiKey={apiKey}>
        <Map
          style={{ width: '100vw', height: '100vh' }}
          defaultCenter={position}
          defaultZoom={15}
          gestureHandling={'greedy'}
        >
          {/* Marker（ピン）を配置 */}
          <Marker position={position} />
          
          {/* ＜実験＞別の場所に立てる時 */}
          <Marker position={{ lat: 34.3000, lng: 132.3250 }} />
        </Map>
      </APIProvider>
    </div>
  );
}