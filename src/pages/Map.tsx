import{ Map as MapboxMap }from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function Map() {
  return (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <MapboxMap
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        initialViewState={{
          longitude: 35.9,
          latitude: 31.8,
          zoom: 10
        }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
      />
    </div>
  );
}
