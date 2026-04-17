import { Star, AlertTriangle, Leaf, Bug } from "lucide-react";
import type { ISpecies } from "../../interfaces/species";

interface Props {
  species: ISpecies;
}

export default function SpeciesHero({ species }: Props) {
  return (
    <section className="relative h-100 md:h-125 w-full rounded-2xl overflow-hidden mb-10 shadow-xl group">
      {species.imageUrl ? (
        <img
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt={species.commonNameEn || species.scientificName}
          src={species.imageUrl}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-teal-800 to-teal-950 flex items-center justify-center">
          {species.ecology.isEndangered
            ? <Leaf size={80} className="text-teal-600 opacity-30" />
            : <Bug size={80} className="text-teal-600 opacity-30" />
          }
        </div>
      )}
      <div className="absolute inset-0 bg-linear-to-t from-teal-950/90 via-teal-950/30 to-transparent" />

      <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 flex flex-col justify-end">
        <div className="flex flex-wrap gap-3 mb-4">
          {species.ecology.isEndemic && (
            <span className="px-4 py-1.5 rounded-full bg-amber-400 text-amber-950 text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-sm">
              <Star size={14} fill="currentColor" /> Endemic to Jordan
            </span>
          )}
          {species.ecology.isEndangered && (
            <span className="px-4 py-1.5 rounded-full bg-red-600 text-white text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-sm">
              <AlertTriangle size={14} fill="currentColor" /> Endangered
            </span>
          )}
          {species.ecology.isInvasive && (
            <span className="px-4 py-1.5 rounded-full bg-orange-500 text-white text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-sm">
              Invasive
            </span>
          )}
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-2 drop-shadow-sm">
          {species.commonNameEn || species.scientificName}
          {species.commonNameAr && (
            <span className="font-light opacity-90 text-3xl md:text-5xl"> | {species.commonNameAr}</span>
          )}
        </h1>
        {species.commonNameEn && (
          <p className="font-serif italic text-teal-100 text-xl md:text-2xl opacity-90">
            {species.scientificName}
          </p>
        )}
      </div>
    </section>
  );
}
