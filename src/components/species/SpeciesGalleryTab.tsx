import { Images } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { IObservation } from "../../interfaces/observations";

interface Props {
  observations: IObservation[];
}

export default function SpeciesGalleryTab({ observations }: Props) {
  const navigate = useNavigate();

  if (observations.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-100 h-96 flex flex-col items-center justify-center text-gray-400 font-medium shadow-sm gap-3">
        <Images size={48} className="text-gray-200" />
        <p>No photos yet for this species.</p>
      </div>
    );
  }

  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {observations.map((obs) => (
        <div
          key={obs.id}
          onClick={() => navigate(`/observations/${obs.id}`)}
          className="break-inside-avoid rounded-xl overflow-hidden cursor-pointer group relative shadow-sm"
        >
          <img
            src={obs.image!}
            alt={obs.speciesName}
            className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
            <div>
              <p className="text-white text-xs font-bold">{obs.user}</p>
              <p className="text-white/70 text-[10px]">{obs.location}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
