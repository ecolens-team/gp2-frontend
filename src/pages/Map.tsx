import { useState } from 'react';
import { Map as MapboxMap, Marker, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useQuery } from '@tanstack/react-query';
import { getObservationLocations } from '../services/observationsService';
import type { IObservation } from '../interfaces/observations';
import { MapPin, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Map() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState<IObservation | null>(null);

  const governorate = searchParams.get('governorate') ?? '';
  const minConfidence = Number(searchParams.get('min_confidence') ?? 0);
  const species = searchParams.get('species') ?? '';
  const filters = {
    ...(governorate ? { governorate } : {}),
    ...(minConfidence > 0 ? { min_confidence: minConfidence } : {}),
    ...(species ? { species } : {}),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['observations-map', filters],
    queryFn: () => getObservationLocations(filters),
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
        initialViewState={{ longitude: 35.9, latitude: 31.8, zoom: 10 }}
        mapStyle='mapbox://styles/mapbox/streets-v9'
        onClick={() => setSelected(null)}
      >
        {data?.map((obs) => (
          <Marker
            key={obs.id}
            latitude={Number(obs.latitude)}
            longitude={Number(obs.longitude)}
            anchor='bottom'
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelected(obs);
            }}
          >
            <div className='text-teal-600 drop-shadow-md hover:scale-110 transition-transform cursor-pointer'>
              <MapPin size={40} fill='teal' className='text-white' />
            </div>
          </Marker>
        ))}

        {selected &&
          selected.latitude != null &&
          selected.longitude != null && (
            <Popup
              latitude={Number(selected.latitude)}
              longitude={Number(selected.longitude)}
              anchor='bottom'
              offset={48}
              closeButton={false}
              onClose={() => setSelected(null)}
            >
              <div className='min-w-[180px] max-w-[220px] '>
                {selected.image?.thumbnail && (
                  <img
                    src={selected.image.thumbnail}
                    alt={selected.speciesName}
                    className='w-full h-28 object-cover rounded-lg  mb-2 mt-0.'
                    style={{ width: 'calc(100% + 16px)' }}
                  />
                )}
                <p className='font-bold text-sm text-gray-900 italic leading-tight'>
                  {selected.speciesName}
                </p>
                <p className='text-xs text-gray-500 mt-0.5'>
                  by {selected.user}
                </p>
                {selected.governorate && (
                  <p className='text-xs text-gray-400 mt-0.5'>
                    {selected.governorate}
                  </p>
                )}
                {selected.verified && (
                  <span className='inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 mt-1'>
                    <CheckCircle size={11} /> Verified
                  </span>
                )}
                <button
                  onClick={() => navigate(`/observations/${selected.id}`)}
                  className='mt-2 w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-1.5 rounded-lg transition-colors'
                >
                  View Observation
                </button>
              </div>
            </Popup>
          )}
      </MapboxMap>
    </div>
  );
}
