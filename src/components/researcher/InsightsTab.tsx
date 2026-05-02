import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { ShieldAlert, Leaf, X, CheckCircle, Bug, Flower2 } from "lucide-react";
import { api } from "../../lib/axiosConfig";
import type { Specialization } from "../../services/authService";
import SpeciesMapTab from "../species/SpeciesMapTab";

interface Insights {
  species: { total: number; observed: number; unobserved: number };
  total_observations: number;
  top_governorates: { governorate: string; count: number }[];
  monthly_observations: { year: number; month: number; count: number }[];
  confidence_distribution: { bucket: string; count: number }[];
  verification_rate: number;
  weather_stats: { weather: string; count: number }[];
  type_breakdown: { plants: number; insects: number };
  top_species: { species__id: number; species__scientific_name: string; species__common_name_en: string; count: number }[];
  taxa_breakdown: { level: string; name: string; count: number }[];
  observation_locations: { id: number; latitude: number; longitude: number }[];
}

interface Alert {
  id: number;
  species_name: string | null;
  flags: ("endangered" | "invasive")[];
  governorate: string | null;
  timestamp: string;
  thumbnail: string | null;
  longitude: number | null;
  latitude: number | null;
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function InsightsTab() {
  const [activeSection, setActiveSection] = useState<"stats" | "alerts">("stats");
  const [selectedSpecs, setSelectedSpecs] = useState<Set<string>>(new Set());

  const { data: specializations = [] } = useQuery<Specialization[]>({
    queryKey: ["my-specializations"],
    queryFn: () => api.get("/me/specializations/").then(r => r.data),
  });

  const specsParam = useMemo(
    () => (selectedSpecs.size > 0 ? Array.from(selectedSpecs).join(",") : ""),
    [selectedSpecs],
  );

  const { data: insights, isLoading: insightsLoading } = useQuery<Insights>({
    queryKey: ["researcher-insights", specsParam],
    queryFn: () =>
      api.get("/researcher/insights/", { params: specsParam ? { specs: specsParam } : {} }).then(r => r.data),
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery<Alert[]>({
    queryKey: ["researcher-alerts"],
    queryFn: () => api.get("/researcher/alerts/").then(r => r.data),
  });

  const navigate = useNavigate();

  const monthlyData = insights?.monthly_observations.map(m => ({
    label: `${MONTH_NAMES[m.month - 1]} ${m.year}`,
    count: m.count,
  })) ?? [];

  const toggleSpec = (key: string) => {
    setSelectedSpecs(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-6 w-full">
      {/* Sub-tab */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
        {(["stats", "alerts"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSection(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all capitalize ${
              activeSection === tab ? "bg-white text-teal-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "stats" ? "Analytics" : `Alerts${alerts.length ? ` (${alerts.length})` : ""}`}
          </button>
        ))}
      </div>

      {activeSection === "stats" && (
        <div className="space-y-6">
          {/* Specialization filter pills */}
          {specializations.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Filter by:</span>
              {specializations.map(s => {
                const key = `${s.level}:${s.name}`;
                const active = selectedSpecs.has(key);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSpec(key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      active
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"
                    }`}
                  >
                    {s.level[0] + s.level.slice(1).toLowerCase()}: {s.name}
                  </button>
                );
              })}
              {selectedSpecs.size > 0 && (
                <button
                  onClick={() => setSelectedSpecs(new Set())}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={12} /> Clear
                </button>
              )}
            </div>
          )}

          {/* Summary metric cards */}
          {insightsLoading ? (
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : insights && (
            <div className="grid grid-cols-4 gap-4">
              <MetricCard
                label="Total Observations"
                value={insights.total_observations.toLocaleString()}
                color="text-gray-900"
              />
              <MetricCard
                label="Verification Rate"
                value={`${insights.verification_rate}%`}
                color="text-teal-600"
                icon={<CheckCircle size={16} className="text-teal-400" />}
              />
              <MetricCard
                label="Plants"
                value={insights.type_breakdown.plants.toLocaleString()}
                color="text-emerald-600"
                icon={<Flower2 size={16} className="text-emerald-400" />}
              />
              <MetricCard
                label="Insects"
                value={insights.type_breakdown.insects.toLocaleString()}
                color="text-violet-600"
                icon={<Bug size={16} className="text-violet-400" />}
              />
            </div>
          )}

          {/* Species coverage */}
          {!insightsLoading && insights && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Species Coverage</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { label: "In Your Domain", value: insights.species.total, color: "text-gray-900" },
                  { label: "Observed", value: insights.species.observed, color: "text-teal-600" },
                  { label: "Never Observed", value: insights.species.unobserved, color: "text-gray-400" },
                ].map(s => (
                  <div key={s.label}>
                    <p className={`text-3xl font-black ${s.color}`}>{s.value.toLocaleString()}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${insights.species.total ? (insights.species.observed / insights.species.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Taxa breakdown + Top species side by side */}
          {!insightsLoading && insights && (
            <div className="grid grid-cols-2 gap-6">
              {/* Taxa breakdown */}
              {insights.taxa_breakdown.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Observations by Taxon</h3>
                  <ResponsiveContainer width="100%" height={Math.max(180, insights.taxa_breakdown.length * 40)}>
                    <BarChart layout="vertical" data={insights.taxa_breakdown} barSize={20}>
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={120}
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v: string) => v.length > 16 ? v.slice(0, 14) + "…" : v}
                      />
                      <Tooltip
                        formatter={(value: any) => [value, "Observations"]}
                        labelFormatter={(label: any) => label}
                      />
                      <Bar dataKey="count" fill="#0d9488" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Top species */}
              {insights.top_species.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Top Species</h3>
                  <div className="space-y-0.5">
                    {insights.top_species.map((sp, i) => (
                      <button
                        key={sp.species__id}
                        onClick={() => navigate(`/species/${sp.species__id}`)}
                        className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                      >
                        <span className="text-sm font-black text-gray-300 w-5 text-right shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 italic truncate">{sp.species__scientific_name}</p>
                          {sp.species__common_name_en && (
                            <p className="text-xs text-gray-400 truncate">{sp.species__common_name_en}</p>
                          )}
                        </div>
                        <span className="text-sm font-bold text-teal-600 shrink-0">{sp.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Observation location map */}
          {!insightsLoading && insights && insights.observation_locations.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Observation Locations</h3>
              <SpeciesMapTab
                markers={insights.observation_locations}
                className="rounded-xl overflow-hidden h-[400px]"
              />
            </div>
          )}

          {/* Governorates + Weather side by side */}
          {!insightsLoading && insights && (
            <div className="grid grid-cols-2 gap-6">
              {insights.top_governorates.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Top Governorates</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={insights.top_governorates} barSize={32}>
                      <XAxis dataKey="governorate" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {insights.weather_stats.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Weather Conditions</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={insights.weather_stats} barSize={32}>
                      <XAxis dataKey="weather" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Monthly trend + Confidence distribution side by side */}
          {!insightsLoading && insights && (
            <div className="grid grid-cols-2 gap-6">
              {monthlyData.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Observation Trend (12 months)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">AI Confidence Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={insights.confidence_distribution} barSize={40}>
                    <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-400 mt-3 text-center">Lower confidence = higher priority in verification queue.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSection === "alerts" && (
        <div className="space-y-3">
          {alertsLoading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShieldAlert size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No alerts this week</p>
              <p className="text-sm mt-1">New sightings of endangered or invasive species in your domain will appear here.</p>
            </div>
          ) : alerts.map(alert => (
            <button
              key={alert.id}
              onClick={() => navigate(`/observations/${alert.id}`)}
              className="w-full text-left bg-white rounded-xl border border-red-100 shadow-sm p-4 flex items-center gap-4 hover:border-red-300 transition-all group"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {alert.thumbnail
                  ? <img src={alert.thumbnail} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gray-200" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 italic truncate">{alert.species_name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{alert.governorate} · {new Date(alert.timestamp).toLocaleDateString()}</p>
                <div className="flex gap-1.5 mt-1.5">
                  {alert.flags.includes("endangered") && (
                    <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Leaf size={10} /> Endangered
                    </span>
                  )}
                  {alert.flags.includes("invasive") && (
                    <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldAlert size={10} /> Invasive
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label, value, color, icon,
}: {
  label: string;
  value: string;
  color: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        {icon}
      </div>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}
