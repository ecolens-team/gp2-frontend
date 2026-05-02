import { useState, useEffect } from "react";
import Select from "react-select";
import { X, Plus } from "lucide-react";
import { api } from "../lib/axiosConfig";
import type { Specialization } from "../services/authService";

const LEVELS = [
  { value: "CLASS",   label: "Class"   },
  { value: "ORDER",   label: "Order"   },
  { value: "FAMILY",  label: "Family"  },
  { value: "GENUS",   label: "Genus"   },
  { value: "SPECIES", label: "Species" },
];

const STATIC_LEVELS = new Set(["CLASS", "ORDER", "FAMILY"]);
const CLASS_OPTIONS = [
  { value: "Insecta", label: "Insecta (Insects)" },
  { value: "Plantae", label: "Plantae (Plants)"  },
];

export default function SpecializationPicker({
  value,
  onChange,
  maxItems,
}: {
  value: Specialization[];
  onChange: (v: Specialization[]) => void;
  maxItems?: number;
}) {
  const [selectedLevel, setSelectedLevel] = useState<string>("FAMILY");
  const [nameOptions, setNameOptions] = useState<{ value: string; label: string }[]>([]);
  const [nameInput, setNameInput] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [selectedName, setSelectedName] = useState<{ value: string; label: string } | null>(null);

  useEffect(() => {
    if (selectedLevel === "CLASS") { setNameOptions(CLASS_OPTIONS); return; }
    if (!STATIC_LEVELS.has(selectedLevel)) { setNameOptions([]); return; }
    setLoadingOptions(true);
    api.get(`/species/taxonomy-options/?level=${selectedLevel.toLowerCase()}`)
      .then(res => setNameOptions((res.data as string[]).filter(Boolean).map(v => ({ value: v, label: v }))))
      .finally(() => setLoadingOptions(false));
  }, [selectedLevel]);

  useEffect(() => {
    if (STATIC_LEVELS.has(selectedLevel) || selectedLevel === "CLASS") return;
    if (nameInput.length < 2) { setNameOptions([]); return; }
    const t = setTimeout(() => {
      setLoadingOptions(true);
      api.get(`/species/taxonomy-options/?level=${selectedLevel.toLowerCase()}&q=${nameInput}`)
        .then(res => setNameOptions((res.data as string[]).filter(Boolean).map(v => ({ value: v, label: v }))))
        .finally(() => setLoadingOptions(false));
    }, 300);
    return () => clearTimeout(t);
  }, [nameInput, selectedLevel]);

  const addSpecialization = () => {
    if (!selectedName) return;
    if (maxItems && value.length >= maxItems) return;
    const next: Specialization = { level: selectedLevel, name: selectedName.value };
    if (!value.some(s => s.level === next.level && s.name === next.name)) {
      onChange([...value, next]);
    }
    setSelectedName(null);
    setNameInput("");
  };

  const atMax = maxItems !== undefined && value.length >= maxItems;

  return (
    <div className="space-y-3">
      {!atMax && (
        <div className="flex gap-2">
          <select
            value={selectedLevel}
            onChange={e => { setSelectedLevel(e.target.value); setSelectedName(null); setNameInput(""); }}
            className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 shrink-0"
          >
            {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>

          <div className="flex-1">
            <Select
              key={selectedLevel}
              options={nameOptions}
              value={selectedName}
              onChange={opt => setSelectedName(opt)}
              isLoading={loadingOptions}
              inputValue={STATIC_LEVELS.has(selectedLevel) || selectedLevel === "CLASS" ? undefined : nameInput}
              onInputChange={STATIC_LEVELS.has(selectedLevel) || selectedLevel === "CLASS" ? undefined : v => setNameInput(v)}
              placeholder={
                selectedLevel === "CLASS" ? "Select class..." :
                STATIC_LEVELS.has(selectedLevel) ? `Select ${selectedLevel.toLowerCase()}...` :
                `Type to search ${selectedLevel.toLowerCase()}...`
              }
              noOptionsMessage={() =>
                !STATIC_LEVELS.has(selectedLevel) && selectedLevel !== "CLASS" && nameInput.length < 2
                  ? "Type at least 2 characters" : "No results"
              }
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 999 }),
                control: (base) => ({
                  ...base, borderColor: '#d1d5db', borderRadius: '0.75rem', padding: '1px',
                  boxShadow: 'none', '&:hover': { borderColor: '#0d9488' },
                }),
              }}
            />
          </div>

          <button
            type="button"
            onClick={addSpecialization}
            disabled={!selectedName}
            className="shrink-0 bg-teal-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl px-3 py-2.5 flex items-center text-sm font-bold transition-colors hover:bg-teal-700"
          >
            <Plus size={15} />
          </button>
        </div>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((s, i) => (
            <span key={i} className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="text-teal-400 font-bold">{s.level[0] + s.level.slice(1).toLowerCase()}</span>
              <span>{s.name}</span>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="text-teal-400 hover:text-teal-700 transition-colors">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
