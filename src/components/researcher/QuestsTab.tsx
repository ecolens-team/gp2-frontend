import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus, ChevronDown, ChevronUp, Users, Clock, CheckCircle,
  Loader2, X, Leaf, Target, Camera, Map as MapIcon, Search,
  Bug,
} from "lucide-react";
import { api } from "../../lib/axiosConfig";
import { Map as MapboxMap } from "react-map-gl/mapbox";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "mapbox-gl/dist/mapbox-gl.css";

interface Quest {
  id: number;
  title: string;
  description: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "REJECTED";
  category: string;
  reward_pts: number;
  target_count: number;
  start_date: string;
  end_date: string;
  participant_count: number;
}

interface SpeciesOption { id: number; name: string; }

const STATUS_CONFIG = {
  ACTIVE:    { label: "Active",           color: "bg-teal-100 text-teal-700",   icon: <CheckCircle size={12} /> },
  PENDING:   { label: "Pending Approval", color: "bg-amber-100 text-amber-700", icon: <Clock size={12} /> },
  COMPLETED: { label: "Completed",        color: "bg-gray-100 text-gray-600",   icon: null },
  REJECTED:  { label: "Rejected",         color: "bg-red-100 text-red-700",     icon: null },
};

const CATEGORY_OPTIONS = [
  { value: "PLANT",   label: "Plant",   icon: <Leaf size={14} /> },
  { value: "INSECT",  label: "Insect",  icon: <Bug size={14} /> },
  { value: "GENERAL", label: "General", icon: <Camera size={14} /> },
] as const;

const questSchema = z.object({
  title:        z.string().min(5, "Title must be at least 5 characters"),
  description:  z.string().min(20, "Please provide a description (20+ characters)"),
  rules:        z.string().optional(),
  category:     z.enum(["PLANT", "INSECT", "GENERAL"]),
  reward_pts:   z.number().min(0).max(10000),
  target_count: z.number().min(1, "At least 1 observation required"),
  start_date:   z.string().min(1, "Start date is required"),
  end_date:     z.string().min(1, "End date is required"),
});
type QuestFormData = z.infer<typeof questSchema>;

function SpeciesSearch({
  selected, onAdd, onRemove,
}: {
  selected: SpeciesOption[];
  onAdd: (s: SpeciesOption) => void;
  onRemove: (id: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpeciesOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(() => {
      setLoading(true);
      api.get(`/species/taxonomy-options/?level=species&q=${query}&with_ids=true`)
        .then(r => setResults((r.data as SpeciesOption[]).filter(s => !selected.find(x => x.id === s.id))))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query, selected]);

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-500 block">Target Species <span className="text-gray-400 font-normal">(optional)</span></label>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search species by scientific name…"
          className="w-full rounded-xl border border-gray-300 pl-8 pr-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
        />
        {loading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
      </div>
      {results.length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
          {results.map(s => (
            <button key={s.id} type="button" onClick={() => { onAdd(s); setQuery(""); setResults([]); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-teal-50 transition-colors border-b border-gray-100 last:border-0">
              <span className="italic text-gray-700">{s.name}</span>
            </button>
          ))}
        </div>
      )}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map(s => (
            <span key={s.id} className="flex items-center gap-1.5 text-xs font-medium bg-teal-50 border border-teal-200 text-teal-800 px-2.5 py-1 rounded-full">
              <span className="italic">{s.name}</span>
              <button type="button" onClick={() => onRemove(s.id)} className="text-teal-500 hover:text-teal-700">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function DrawZoneMap({ onPolygonChange }: { onPolygonChange: (geojson: object | null) => void }) {
  const mapRef = useRef<any>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  const onMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || drawRef.current) return;

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
    });
    map.addControl(draw);
    drawRef.current = draw;

    const update = () => {
      const data = draw.getAll();
      const polygon = data.features.find(f => f.geometry.type === "Polygon");
      onPolygonChange(polygon ? polygon.geometry : null);
    };

    map.on("draw.create", update);
    map.on("draw.update", update);
    map.on("draw.delete", () => onPolygonChange(null));
  }, [onPolygonChange]);

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 260 }}>
      <MapboxMap
        ref={mapRef}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        initialViewState={{ longitude: 36.5, latitude: 31.0, zoom: 6 }}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
        onLoad={onMapLoad}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

function CreateQuestForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesOption[]>([]);
  const [polygon, setPolygon] = useState<object | null>(null);
  const [showMap, setShowMap] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<QuestFormData>({
    resolver: zodResolver(questSchema),
    defaultValues: { category: "GENERAL", reward_pts: 100, target_count: 10 },
  });

  const selectedCategory = watch("category");

  const mutation = useMutation({
    mutationFn: (data: QuestFormData) => api.post("/quests/new/", {
      ...data,
      geographic_area: polygon || null,
      target_species: selectedSpecies.map(s => s.id),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-quests"] });
      reset();
      setSelectedSpecies([]);
      setPolygon(null);
      setShowMap(false);
      onSuccess();
    },
  });

  const inputClass = "w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200";

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="bg-teal-50/50 border border-teal-100 rounded-2xl p-6 space-y-5">
      <h3 className="font-black text-teal-900">Propose a New Quest</h3>

      <div>
        <label className="text-xs font-bold text-gray-500 block mb-2">Category</label>
        <div className="flex gap-2">
          {CATEGORY_OPTIONS.map(opt => (
            <button
              key={opt.value} type="button"
              onClick={() => setValue("category", opt.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                selectedCategory === opt.value
                  ? "bg-teal-600 border-teal-600 text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:border-teal-300"
              }`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <input {...register("title")} placeholder="Quest title" className={inputClass} />
        {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
      </div>


      <div>
        <textarea {...register("description")} placeholder="Describe the goal of this quest…" rows={3} className={`${inputClass} resize-none`} />
        {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
      </div>

      <div>
        <textarea {...register("rules")} placeholder="Rules & guidelines (optional)…" rows={2} className={`${inputClass} resize-none`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Reward Points</label>
          <input type="number" {...register("reward_pts", { valueAsNumber: true })} min={0} max={10000} className={inputClass} />
          {errors.reward_pts && <p className="text-red-400 text-xs mt-1">{errors.reward_pts.message}</p>}
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Observations Required</label>
          <input type="number" {...register("target_count", { valueAsNumber: true })} min={1} className={inputClass} />
          {errors.target_count && <p className="text-red-400 text-xs mt-1">{errors.target_count.message}</p>}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Start Date</label>
          <input type="date" {...register("start_date")} className={inputClass} />
          {errors.start_date && <p className="text-red-400 text-xs mt-1">{errors.start_date.message}</p>}
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">End Date</label>
          <input type="date" {...register("end_date")} className={inputClass} />
          {errors.end_date && <p className="text-red-400 text-xs mt-1">{errors.end_date.message}</p>}
        </div>
      </div>

      <SpeciesSearch
        selected={selectedSpecies}
        onAdd={s => setSelectedSpecies(prev => [...prev, s])}
        onRemove={id => setSelectedSpecies(prev => prev.filter(s => s.id !== id))}
      />

      <div>
        <button
          type="button"
          onClick={() => setShowMap(v => !v)}
          className="flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-900 transition-colors"
        >
          <MapIcon size={15} />
          {showMap ? "Hide Zone Map" : "Restrict to a Geographic Zone (optional)"}
          {showMap ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {polygon && !showMap && (
          <p className="text-xs text-teal-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle size={12} /> Zone defined
            <button type="button" onClick={() => setPolygon(null)} className="text-gray-400 hover:text-red-500 ml-1"><X size={11} /></button>
          </p>
        )}
        {showMap && (
          <div className="mt-3 space-y-1.5">
            <p className="text-xs text-gray-400">Draw a polygon on the map to restrict the quest to that area. Observations outside it won't count.</p>
            <DrawZoneMap onPolygonChange={setPolygon} />
            {polygon && <p className="text-xs text-teal-600 font-medium flex items-center gap-1"><CheckCircle size={12} /> Zone saved</p>}
          </div>
        )}
      </div>

      {mutation.isError && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">Failed to submit — please try again.</p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
      >
        {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        Submit for Approval
      </button>
    </form>
  );
}

function QuestCard({ quest }: { quest: Quest }) {
  const cfg = STATUS_CONFIG[quest.status] ?? STATUS_CONFIG.PENDING;
  const daysLeft = quest.status === "ACTIVE"
    ? Math.max(0, Math.ceil((new Date(quest.end_date).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold text-gray-900">{quest.title}</h3>
        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${cfg.color}`}>
          {cfg.icon} {cfg.label}
        </span>
      </div>
      <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{quest.description}</p>
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 font-medium flex-wrap">
        <span className="flex items-center gap-1"><Users size={12} /> {quest.participant_count ?? 0} participants</span>
        <span className="flex items-center gap-1"><Target size={12} /> {quest.target_count} obs. needed</span>
        {daysLeft !== null && (
          <span className={`flex items-center gap-1 ${daysLeft <= 3 ? "text-red-500 font-bold" : ""}`}>
            <Clock size={12} /> {daysLeft}d remaining
          </span>
        )}
        <span>{new Date(quest.start_date).toLocaleDateString()} – {new Date(quest.end_date).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

export default function QuestsTab() {
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data: quests = [], isLoading } = useQuery<Quest[]>({
    queryKey: ["my-quests"],
    queryFn: () => api.get("/quests/mine/").then(r => r.data),
  });

  const filtered = statusFilter === "ALL" ? quests : quests.filter(q => q.status === statusFilter);

  const statusTabs = [
    { id: "ALL",       label: "All" },
    { id: "ACTIVE",    label: "Active" },
    { id: "PENDING",   label: "Pending Approval" },
    { id: "COMPLETED", label: "Completed" },
    { id: "REJECTED",  label: "Rejected" },
  ];

  return (
    <div className=" max-w-5xl mx-auto">
      <div className="space-y-6">
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} />
          Propose Quest
          {showForm ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {showForm && <CreateQuestForm onSuccess={() => setShowForm(false)} />}
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit gap-0.5 flex-wrap">
          {statusTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === tab.id ? "bg-white text-teal-700 shadow-xs" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="font-medium">No quests yet</p>
            <p className="text-sm mt-1">Propose a quest to engage the community in your research area.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(q => <QuestCard key={q.id} quest={q} />)}
          </div>
        )}
      </div>
    </div>
  );
}
