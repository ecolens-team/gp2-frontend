import { useState } from "react";
import { 
  Star, AlertTriangle, Info, MapPin, 
  CheckCircle, Target, Map 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getSpeciesById } from "../services/observationsService";


export default function SpeciesProfile() {
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "MAP" | "GALLERY">("OVERVIEW");
  const { id } = useParams<{ id: string }>();

  // --- Mock Data
//   const species: ISpecies = {
//     id: 12,
//     scientificName: "Iris persica",
//     commonNameAr: "سوسن فارسي",
//     commonNameEn: "Persian Iris",
//     imageUrl: "https://images.unsplash.com/photo-1598283401569-b57022d86161?q=80&w=1000&auto=format&fit=crop", 
//     description: {
//       text: "The Persian Iris (Iris persica) is a stunning geophytic perennial that announces the arrival of spring in the highlands of the Levant. Known for its remarkable fragrance and translucent, silver-streaked petals, this rare species is a biological jewel of the Middle East.\n\nIn Jordan, it is found clinging to the limestone-rich soils of the northern governorates. Its survival is strictly tied to undisturbed stony slopes and highland plateaus that experience specific winter moisture cycles. Due to agricultural expansion and urban development, its native habitat is rapidly vanishing.",
//       isVerified: false, 
//     },
//     ecology: {
//       isEndemic: true, 
//       isEndangered: true, 
//       isInvasive: false,
//       habitats: ["Highland plateaus", "Stony slopes", "Limestone-rich soils"],
//       primaryGovernorates: ["Ajloun | عجلون", "Jarash | جرش"],
//     },
//     community: { 
//         totalObservations: 1284, 
//         topObservers: [
//             { name: "Omar K.", obs: 242, avatar: "https://i.pravatar.cc/150?u=omar" },
//             { name: "Sarah M.", obs: 188, avatar: "https://i.pravatar.cc/150?u=sarah" },
//             { name: "Nadia T.", obs: 156, avatar: "https://i.pravatar.cc/150?u=nadia" }
//         ], 
//         topExperts: [
//             { name: "Dr. Samir Al-Haddad", title: "Lead Ethnobotanist", avatar: "https://i.pravatar.cc/150?u=samir" },
//             { name: "Layla Mansour", title: "Conservation Specialist", avatar: "https://i.pravatar.cc/150?u=layla" }
//         ],
//         activeQuests: [
//             { id: "q1", title: "Spring Bloom Hunt", rewardPts: 500, progressPercent: 65 },
//             { id: "q2", title: "Rare Iris Survey", rewardPts: 800, progressPercent: 12 }
//         ]
//     },
//     dataInsights: {
//         seasonality: [0, 0, 85, 60, 20, 0, 0, 0, 0, 0, 0, 0], // Peak in March
//         weather: [
//             { label: "Sunny", percent: 72, color: "bg-amber-400" },
//             { label: "Cloudy", percent: 18, color: "bg-gray-400" },
//             { label: "Rainy", percent: 10, color: "bg-blue-500" }
//         ]
//     }
//   };

 
  const { data : species} = useQuery({
    queryKey: ['species', id],
    queryFn: () => getSpeciesById(Number(id)),
    enabled: !!id,
  });

  if(!species) return null;
  
  const maxSeasonality = Math.max(...species.dataInsights.seasonality);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-24 font-sans text-gray-900 selection:bg-teal-100 selection:text-teal-900">
      
      <section className="relative h-100 md:h-125 w-full rounded-2xl overflow-hidden mb-10 shadow-xl group">
        <img 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            alt={species.commonNameEn} 
            src={species.imageUrl}
        />
        <div className="absolute inset-0 bg-linear-to-t from-teal-950/90 via-teal-950/30 to-transparent"></div>
        
        <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 flex flex-col justify-end">
            <div className="flex flex-wrap gap-3 mb-4">
              {species.ecology.isEndemic && (
                  <span className="px-4 py-1.5 rounded-full bg-amber-400 text-amber-950 text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-sm">
                      <Star size={14} fill="currentColor" /> Endemic to Jordan
                  </span>
              )}
              {species.ecology.isEndangered && (
                  <span className="px-4 py-1.5 rounded-full bg-red-600 text-white text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-sm">
                      <AlertTriangle size={14} fill="currentColor" /> Critically Endangered
                  </span>
              )}
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-2 drop-shadow-sm">
                {species.commonNameEn} <span className="font-light opacity-90 text-3xl md:text-5xl">| {species.commonNameAr}</span>
            </h1>
            <p className="font-serif italic text-teal-100 text-xl md:text-2xl opacity-90">
                {species.scientificName}
            </p>
        </div>
      </section>

      <nav className="sticky top-4 z-40 mb-10 flex justify-center">
        <div className="bg-white/70 backdrop-blur-md p-1.5 rounded-full flex gap-1 shadow-sm border border-gray-100">
          {["OVERVIEW", "MAP", "GALLERY"].map((tab) => (
            <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 md:px-8 py-2.5 rounded-full text-xs md:text-sm font-bold tracking-wider transition-all ${
                    activeTab === tab 
                    ? "bg-teal-600 text-white shadow-md" 
                    : "text-gray-500 hover:text-teal-600"
                }`}
            >
                {tab}
            </button>
          ))}
        </div>
      </nav>

      {activeTab === "OVERVIEW" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            <div className="lg:col-span-7 space-y-10">
                
                <section className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-8 bg-teal-600 rounded-full"></div>
                        <h2 className="text-3xl font-black tracking-tight text-gray-900">Species Profile</h2>
                    </div>

                    {!species.description.isVerified && (
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-5 md:p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex gap-3">
                                <Info className="text-amber-600 shrink-0 mt-0.5" size={20} />
                            </div>
                            <button className="whitespace-nowrap bg-amber-100 hover:bg-amber-200 text-amber-900 px-4 py-2 rounded-full text-xs font-bold transition-colors shadow-sm">
                                Suggest Edit
                            </button>
                        </div>
                    )}

                    <div className="font-serif text-lg leading-relaxed text-gray-700 space-y-4 whitespace-pre-wrap">
                        {species.description.text}
                    </div>
                </section>

                <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                        <MapPin className="text-teal-600" size={24}/> Local Ecology
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-5">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Primary Governorates</p>
                                <div className="flex flex-wrap gap-2">
                                    {species.ecology.primaryGovernorates && species.ecology.primaryGovernorates.map((gov) => (
                                        <span key={gov} className="px-4 py-2 bg-teal-50 border border-teal-100 rounded-lg text-sm font-bold text-teal-800">
                                            {gov}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">

                                </div>
                            </div>
                        </div>

                        <div className="relative group rounded-xl overflow-hidden shadow-md cursor-pointer h-40 bg-gray-200">
                            <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Map Preview" src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop" />
                            <div className="absolute inset-0 bg-teal-900/10 group-hover:bg-teal-900/30 transition-colors flex items-center justify-center">
                                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg scale-90 group-hover:scale-100 transition-transform">
                                    <Map className="text-teal-600" size={16} />
                                    <span className="text-xs font-bold text-teal-900">View Full Map</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
                    <h3 className="text-xl font-bold text-gray-900">Data Insights</h3>
                    
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">12-Month Seasonality</p>
                        <div className="flex items-end justify-between h-32 gap-1 md:gap-1.5">
                            {species.dataInsights.seasonality.map((val, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center group h-full justify-end">
                                    <div 
                                        className={`w-full rounded-t-sm transition-all relative ${val > 0 ? 'bg-teal-600 group-hover:bg-teal-500' : 'bg-gray-100'}`}
                                        style={{ height: val > 0 ? `${(val / maxSeasonality) * 100}%` : '5%' }}
                                    >
                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            {val}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2 uppercase">
                            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                                <span key={m} className={species.dataInsights.seasonality[i] === maxSeasonality ? "text-teal-600" : ""}>{m}</span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Observation Weather</p>
                        <div className="space-y-3">
                            {species.dataInsights.weather.map((w) => (
                                <div key={w.label} className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-bold text-gray-700">
                                        <span>{w.label}</span>
                                        <span>{w.percent}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${w.color}`} style={{ width: `${w.percent}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
            </div>

            <aside className="lg:col-span-5 space-y-8">
                
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
                    <div className="text-center">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Total Observations</p>
                        <div className="text-6xl font-black text-teal-600 mb-2">{species.community.totalObservations.toLocaleString()}</div>
                        <p className="text-sm text-gray-500 italic mb-2">Active observers in recorded regions</p>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-50">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Top Observers</p>
                        <div className="space-y-4">
                            {species.community.topObservers.map((obs, idx) => (
                                <div key={obs.name} className="flex items-center gap-4 group cursor-pointer">
                                    <img className="w-10 h-10 rounded-full object-cover border-2 border-teal-50 group-hover:border-teal-200 transition-colors" alt={obs.name} src={obs.avatar} />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900">{obs.name}</p>
                                        <p className="text-xs text-gray-500">{obs.obs} Observations</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-teal-50 text-teal-700'}`}>
                                        #{idx + 1}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-teal-800 p-6 md:p-8 rounded-2xl text-white shadow-xl">
                    <div className="flex items-center gap-2 mb-6">
                        <Target className="text-teal-400" size={24} />
                        <h3 className="text-xl font-bold">Active Quests</h3>
                    </div>
                    <div className="space-y-4">
                        {species.community.activeQuests.map((quest) => (
                            <div key={quest.id} className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer border border-white/10 group">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="text-sm font-bold group-hover:text-teal-300 transition-colors">{quest.title}</h4>
                                    <span className="text-[10px] font-bold bg-teal-600 px-2 py-1 rounded-md">+{quest.rewardPts} pts</span>
                                </div>
                                <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-teal-400 rounded-full" style={{ width: `${quest.progressPercent}%` }}></div>
                                </div>
                                <div className="flex justify-between mt-2 text-[10px] font-medium text-teal-200/60 uppercase tracking-wide">
                                    <span>{quest.progressPercent}% complete</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-3 border border-white/20 rounded-xl text-xs font-bold hover:bg-white hover:text-teal-900 transition-all duration-300">
                        View All Quests
                    </button>
                </div>

                <section className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900">Top Verified Experts</h3>
                    <div className=" flex flex-col gap-4">
                        {species.community.topExperts.map((expert) => (
                            <div key={expert.name} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-teal-200 transition-colors cursor-pointer">
                                <img className="w-14 h-14 rounded-full object-cover" alt={expert.name} src={expert.avatar} />
                                <div>
                                    <p className="font-bold text-gray-900 leading-tight">{expert.name}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-0.5">{expert.title}</p>
                                </div>
                                <CheckCircle className="text-teal-500 ml-auto" size={20} />
                            </div>
                        ))}
                    </div>
                </section>
 
            </aside>
        </div>
      )}

      {activeTab === "MAP" && (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 h-96 flex flex-col items-center justify-center text-gray-400 font-medium shadow-sm">
          <MapPin size={48} className="text-gray-200 mb-4"/>
          <p>Interactive Map Component</p>
        </div>
      )}

      {activeTab === "GALLERY" && (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 h-96 flex flex-col items-center justify-center text-gray-400 font-medium shadow-sm">
          <p>Photo Gallery Component</p>
        </div>
      )}
    </main>
  );
}