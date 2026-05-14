import { Map as MapboxMap, Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useQuery } from '@tanstack/react-query';
import { getObservationLocations } from '../services/observationsService';
import { MapPin, Loader2 } from 'lucide-react';

export default function Map() {
  const { data, isLoading } = useQuery({
    queryKey: ['observations-map'],
    queryFn: getObservationLocations,
  });

  if (isLoading)
    return (
      <div className='flex items-center justify-center h-full bg-gray-50'>
        <Loader2 size={32} className='animate-spin text-teal-400' />
      </div>
    );

  return (
    <div className='flex items-center justify-center h-full bg-gray-50'>
      <MapboxMap
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        initialViewState={{
          longitude: 35.9,
          latitude: 31.8,
          zoom: 10,
        }}
        mapStyle='mapbox://styles/mapbox/streets-v9'
      >
        {data?.map((obs) => (
          <Marker
            key={obs.id}
            latitude={Number(obs.latitude)}
            longitude={Number(obs.longitude)}
            anchor='bottom'
          >
            <div className='text-teal-600 drop-shadow-md hover:scale-110 transition-transform'>
              <MapPin size={40} fill='teal' className='text-white' />
            </div>
          </Marker>
        ))}
      </MapboxMap>
    </div>
  );
}
