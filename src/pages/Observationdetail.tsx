import { useState } from "react";
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getObservationById } from '../services/observationsService'; 
import { Marker, Map, FullscreenControl, NavigationControl } from "react-map-gl/mapbox";
import { MapPin } from "lucide-react";

const comments = [
  {
    id: 1,
    user: "researcher_02",
    time: "2 days ago",
    text: "woow",
    initials: "r",
  },
  {
    id: 2,
    user: "user2",
    time: "1 days ago",
    text: "beautiful",
    initials: "u",
  },
 
];

export default function ObservationDetail() {
  const [newComment, setNewComment] = useState("");
  const [verified, setVerified] = useState(false);
  const { id } = useParams<{ id: string }>();

  const { data: observation, isLoading } = useQuery({
    queryKey: ['observation', id],
    queryFn: () => getObservationById(Number(id)!),
    enabled: !!id,
  });

  if (isLoading) return <div>Loading details...</div>;
  if (!observation) return <div>Observation not found</div>;

  const confidenceLabel =
  observation.confidenceLevel == null
    ? "N/A"
    : `${(observation.confidenceLevel * 100).toFixed(0)}%`;


  return (
    <div className="min-h-screen bg-slate-50 flex justify-center">
      <div className="w-full max-w-4xl  min-h-screen overflow-y-auto">

        <div className="w-full h-80 bg-linear-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
          <img src={observation.image || ''} className="object-cover h-80 w-full"/>
        </div>

        <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-4 m-4">
          <div className="flex justify-between items-center mb-3 gap-2">
            <div className="text-xl font-bold text-slate-800 leading-tight flex-1">{observation.speciesName}</div>
            <div className="bg-teal-50 text-teal-600 font-bold text-sm px-3 py-1 rounded-full border border-teal-300 whitespace-nowrap">{confidenceLabel}</div>
          </div>

        <div className="px-4 mb-4 ">
          <div className="h-64 overflow-hidden rounded-2xl">
            <Map
              mapStyle="mapbox://styles/mapbox/streets-v11"
              mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
              initialViewState={{
                latitude: Number(observation.latitude),
                longitude: Number(observation.longitude),
                zoom: 16
              }}
            >
              <FullscreenControl />
              <NavigationControl position="top-right" />
              {observation.location && (
                <Marker
                  latitude={Number(observation.latitude)}
                  longitude={Number(observation.longitude)}
                  anchor="bottom"
                >
                  <div className="text-teal-600 drop-shadow-md hover:scale-110 transition-transform">
                    <MapPin size={40} fill="teal" className="text-white" />
                  </div>
                </Marker>
              )}
            </Map>
          </div>
        </div>

          <div className="bg-slate-50 rounded-lg p-3 border border-teal-100 text-sm text-slate-500 italic leading-normal">
            {observation.description}
          </div>
        </div>

        <div className="mx-4 mb-4 rounded-2xl p-4 bg-teal-50 border border-teal-100">
          <div className="text-xs font-bold text-teal-600 tracking-widest uppercase mb-3 flex items-center gap-1">ℹ RESEARCHER TOOLS</div>

          <div className="bg-white rounded-xl p-4 border border-teal-100 mb-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 border-b border-teal-100 pb-2">[ VALIDATION BOX ]</div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-slate-600 font-medium">Current Status:</span>
              <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full border border-slate-200 tracking-wide">PENDING REVIEW</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-slate-400 font-medium mb-0.5">Submitted By:</div>
                <div className="text-sm text-slate-800 font-semibold">user_name_01</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium mb-0.5">Date Submitted:</div>
                <div className="text-sm text-slate-800 font-semibold">Dec 19, 2025</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium mb-0.5">Verifications:</div>
                <div className="text-sm text-slate-800 font-semibold">3 / 5 required</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium mb-0.5">Location Type:</div>
                <div className="text-sm text-slate-800 font-semibold">Wild</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              className={`rounded-xl px-3 py-3 text-sm font-bold flex items-center justify-center gap-1 text-white transition-transform duration-150 hover:-translate-y-px hover:shadow-md active:translate-y-0 ${verified ? "bg-green-500" : "bg-teal-600 hover:bg-teal-700"}`}
              onClick={() => setVerified(true)}
            >
              ✓ {verified ? "Verified!" : "Verify as Correct"}
            </button>
            <button className="rounded-xl px-3 py-3 text-sm font-bold flex items-center justify-center gap-1 text-white transition-transform duration-150 hover:-translate-y-px hover:shadow-md active:translate-y-0 bg-teal-500 hover:bg-teal-600">
               Suggest Change
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-4 mx-4 mb-6">
          <div className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
            Comments
            <span className="bg-teal-50 text-teal-600 text-xs font-bold px-2 py-0.5 rounded-full">{comments.length}</span>
          </div>

          {comments.map((c, index) => (
            <div key={c.id} 
            className={`flex gap-2 ${index === comments.length - 1 ? "mb-3" : "mb-3 pb-3 border-b border-teal-100"}`}>
              <div className="w-8 h-8 rounded-full bg-teal-50 border-2 border-teal-100 flex items-center justify-center text-sm text-teal-600 font-bold shrink-0">{c.initials}</div>
              <div className="flex-1">
                <div className="flex items-baseline gap-1 mb-0.5">
                  <span className="text-sm font-bold text-slate-800">{c.user}</span>
                  <span className="text-xs text-slate-400">{c.time}</span>
                </div>
                <div className="text-sm text-slate-600 leading-normal">{c.text}</div>
              </div>
            </div>
          ))}

          <input
            className="w-full border border-teal-100 rounded-lg px-3 py-2.5 text-sm text-slate-600 bg-slate-50 outline-none box-border focus:border-teal-500"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </div>

      </div>
    </div>
  );
} 