import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MapGL, { Marker, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { IObservation } from "../../interfaces/observations";

interface Props {
  observations: IObservation[];
}

export default function SpeciesMapTab({ observations }: Props) {
  const navigate = useNavigate();

  if (observations.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-100 h-96 flex flex-col items-center justify-center text-gray-400 font-medium shadow-sm gap-3">
        <MapPin size={48} className="text-gray-200" />
        <p>No observations with location data yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-[600px]">
      <MapGL
        initialViewState={{
          longitude: observations[0].longitude!,
          latitude: observations[0].latitude!,
          zoom: 7,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      >
        <NavigationControl position="top-right" />
        {observations.map((obs) => (
          <Marker key={obs.id} longitude={obs.longitude!} latitude={obs.latitude!} anchor="bottom">
            <button
              onClick={() => navigate(`/observations/${obs.id}`)}
              className="w-8 h-8 bg-teal-600 rounded-full border-2 border-white shadow-md hover:bg-teal-500 transition-colors flex items-center justify-center"
            >
              <MapPin size={14} className="text-white" />
            </button>
          </Marker>
        ))}
      </MapGL>
    </div>
  );
}
