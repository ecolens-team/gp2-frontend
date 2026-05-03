import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext/AuthContext";
import { logoutUser } from "../services/authService";
import { Search, LogOut, Plus, SlidersHorizontal, X, MessageCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { IObservation } from "../interfaces/observations";
//import ChatWidget from "../components/ChatWidget";
export default function Header() {
    const { authUser } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [minConfidence, setMinConfidence] = useState(0);
    const [locationFilter, setLocationFilter] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setShowResults(false);
                setShowFilters(false);
                setIsSearchFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const { data: results = [] } = useQuery<IObservation[]>({
        queryKey: ["search", search, minConfidence],
        queryFn: async () => {
            if (!search) return [];
            const params = new URLSearchParams();
            params.append("species", search);
            if (minConfidence > 0)
                params.append("min_confidence", String(minConfidence));
            const { api } = await import("../lib/axiosConfig");
            const { mapObservation } = await import("../services/observationsService");
            const res = await api.get(`/observations/?${params.toString()}`);
            return (res.data.results || res.data).map(mapObservation);
        },
        enabled: search.length > 1,
    });

    return (
        <div className="bg-white border-b border-teal-100 p-3 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 md:gap-4">
                <h1
                    className={`text-teal-700 font-black text-2xl tracking-tight cursor-pointer ${isSearchFocused ? 'hidden md:block' : 'block'}`}
                    onClick={() => navigate('/')}
                >
                    EcoLens
                </h1>

                <div className="hidden md:flex items-center gap-6 flex-1 ml-8">
                    <nav className="flex gap-6 text-base font-semibold">
                        <NavLink to="/" className={({ isActive }) => isActive ? "text-teal-600" : "text-gray-500 hover:text-teal-500 transition-colors"}>Explore</NavLink>
                        <NavLink to="/map" className={({ isActive }) => isActive ? "text-teal-600" : "text-gray-500 hover:text-teal-500 transition-colors"}>Map</NavLink>
                        <NavLink to="/quests" className={({ isActive }) => isActive ? "text-teal-600" : "text-gray-500 hover:text-teal-500 transition-colors"}>Quests</NavLink>
                    </nav>
                </div>

                <div className={`relative flex-1 transition-all duration-300 md:ml-4 min-w-0 ${isSearchFocused ? 'max-w-none md:max-w-md' : 'max-w-[150px] sm:max-w-[200px] md:max-w-md'}`} ref={ref}>
                    <div className="flex items-center border border-gray-200 rounded-full bg-gray-50 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500 focus-within:bg-white transition-all">
                        <div className="pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400 shrink-0" />
                        </div>
                        <input
                            type="text"
                            className="flex-1 w-full pl-2 pr-2 py-2 bg-transparent outline-none text-sm placeholder-gray-400 min-w-0"
                            placeholder="Search species..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setShowResults(true);
                            }}
                            onFocus={() => {
                                setShowResults(true);
                                setIsSearchFocused(true);
                            }}
                        />
                        {search && (
                            <button
                                onClick={() => { setSearch(""); setShowResults(false); }}
                                className="pr-2 text-gray-400 hover:text-gray-600 shrink-0"
                                aria-label="Clear search"
                            >
                                <X size={14} />
                            </button>
                        )}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`pr-3 pl-1 shrink-0 transition-colors ${showFilters ? "text-teal-600" : "text-gray-400 hover:text-teal-500"}`}
                            title="Filters"
                        >
                            <SlidersHorizontal size={16} />
                        </button>

                    </div>


                    {showFilters && (
                        <div className="absolute top-12 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 z-50">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Filters</p>
                            <div>
                                <label
                                    htmlFor="min-confidence"
                                    className="text-sm text-gray-600 font-medium"
                                >
                                    Min Confidence: <span className="text-teal-600 font-bold">{minConfidence}%</span>
                                </label>
                                <input
                                    id="min-confidence"
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={minConfidence}
                                    onChange={(e) => setMinConfidence(Number(e.target.value))}
                                    className="w-full mt-2 accent-teal-500"
                                />
                            </div>
                            <div className="mt-3">
                                <label className="text-sm text-gray-600 font-medium">Location</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Ajloun..."
                                    value={locationFilter}
                                    onChange={(e) => setLocationFilter(e.target.value)}
                                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-500"
                                />
                            </div>
                        </div>
                    )}

                    {showResults && search.length > 1 && (
                        <div className="absolute top-12 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-lg z-40 max-h-72 overflow-y-auto">
                            {results.length === 0 ? (
                                <div className="p-4 text-sm text-gray-400 text-center">No results found</div>
                            ) : (
                                results.map((obs) => (
                                    <div
                                        key={obs.id}
                                        className="flex items-center justify-between gap-3 p-3 hover:bg-teal-50 cursor-pointer border-b border-gray-100 last:border-0"
                                        onClick={() => {
                                            navigate(`/observations/${obs.id}`);
                                            setShowResults(false);
                                            setSearch("");
                                            setIsSearchFocused(false);
                                        }}
                                    >
                                        <div className="flex flex-col">
                                            <p className="text-sm font-semibold text-gray-900">{obs.speciesName}</p>
                                            <p className="text-xs text-gray-400">{obs.location}</p>
                                            {obs.confidenceLevel != null && (
                                                <span className="text-xs font-bold text-teal-600 mt-0.5">
                                                    {(obs.confidenceLevel * 100).toFixed(0)}%
                                                </span>
                                            )}
                                        </div>
                                        {obs.image?.image && (
                                            <img src={obs.image.thumbnail ?? obs.image.image} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" alt={obs.speciesName || "Observation"} />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
                {/* <div className="flex items-center px-2 shrink-0">
                    <button
                        onClick={() => navigate('/chat')}
                        className="text-gray-500 hover:text-teal-600 p-2 transition-colors flex items-center justify-center"
                        title="الرسائل"
                    >
                        <MessageCircle size={24} />
                    </button>
                </div> */}
                <div className={`items-center gap-2 md:gap-4 shrink-0 ${isSearchFocused ? 'hidden md:flex' : 'flex'}`}>
                    {authUser ? (
                        <>
                            <button
                                onClick={() => navigate('/camera')}
                                className="hidden md:flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-full font-bold transition-all shadow-sm active:scale-95"
                            >
                                <Plus size={18} strokeWidth={3} />
                                <span>New Observation</span>
                            </button>

                            <div className="flex items-center gap-2 md:gap-3 md:border-l border-gray-200 md:pl-4 md:ml-2">
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="flex items-center justify-center w-9 h-9 bg-teal-100 text-teal-700 rounded-full font-bold text-sm hover:ring-2 hover:ring-teal-500 transition-all shrink-0"
                                    title="Go to Profile"
                                >
                                    {authUser.profile_picture ? (
                                        <img
                                            src={authUser.profile_thumbnail ?? authUser.profile_picture}
                                            className='w-9 h-9 rounded-full'
                                            alt={authUser.first_name ? `${authUser.first_name}'s profile` : "Profile"}
                                        />
                                    ) : (
                                        authUser?.first_name ? authUser.first_name[0].toUpperCase() : 'U'
                                    )}
                                </button>

                                <button
                                    onClick={async () => {
                                        await logoutUser();
                                        navigate('/login');
                                    }}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1.5 md:p-2 rounded-full hover:bg-red-50 shrink-0"
                                    title="Logout"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            className="rounded-full bg-teal-600 px-5 md:px-6 py-1.5 md:py-2 text-sm font-bold text-white transition hover:bg-teal-700 shrink-0"
                            onClick={() => navigate('/login')}
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}