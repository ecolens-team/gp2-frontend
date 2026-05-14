import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MapGL, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapMarker {
  id: number;
  longitude: number | null;
  latitude: number | null;
}

interface Props {
  markers: MapMarker[];
  markerColor?: string;
  className?: string;
}

export default function SpeciesMapTab({
  markers,
  markerColor = 'rgb(13, 148, 136)',
  className,
}: Props) {
  const navigate = useNavigate();

  const valid = markers.filter(
    (m) => m.latitude != null && m.longitude != null,
  );

  if (valid.length === 0) {
    return (
      <div className='bg-white p-8 rounded-2xl border border-gray-100 h-96 flex flex-col items-center justify-center text-gray-400 font-medium shadow-sm gap-3'>
        <MapPin size={48} className='text-gray-200' />
        <p>No observations with location data yet.</p>
      </div>
    );
  }

  return (
    <div
      className={
        className ??
        'rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-[400px]'
      }
    >
      <MapGL
        initialViewState={{
          longitude: valid[0].longitude!,
          latitude: valid[0].latitude!,
          zoom: 7,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle='mapbox://styles/mapbox/outdoors-v12'
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      >
        <NavigationControl position='top-right' />
        {valid.map((m) => (
          <Marker
            key={m.id}
            longitude={m.longitude!}
            latitude={m.latitude!}
            anchor='bottom'
          >
            <button
              onClick={() => navigate(`/observations/${m.id}`)}
              className='w-8 h-8 rounded-full border-2 border-white shadow-md hover:opacity-80 transition-colors flex items-center justify-center'
              style={{ backgroundColor: markerColor }}
            >
              <MapPin size={14} className='text-white' />
            </button>
          </Marker>
        ))}
      </MapGL>
    </div>
  );
}
