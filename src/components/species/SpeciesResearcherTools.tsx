import { useState } from "react";
import { ShieldCheck, CheckCircle, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSpecies } from "../../services/observationsService";
import type { ISpecies } from "../../interfaces/species";
import toast from "react-hot-toast";

interface Props {
  species: ISpecies;
  speciesId: string;
}

export default function SpeciesResearcherTools({ species, speciesId }: Props) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [draftDescription, setDraftDescription] = useState("");
  const [draftCommonNameEn, setDraftCommonNameEn] = useState("");
  const [draftCommonNameAr, setDraftCommonNameAr] = useState("");
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateSpecies>[1]) =>
      updateSpecies(Number(speciesId), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['species', speciesId] });
      setEditingField(null);
      toast.success("Species updated.");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || error.response?.data?.error || "Update failed.";
      toast.error(msg);
    },
  });

  const flags = [
    { key: 'is_endangered', label: 'Endangered', current: species.ecology.isEndangered },
    { key: 'is_invasive',   label: 'Invasive',   current: species.ecology.isInvasive },
    { key: 'is_endemic',    label: 'Endemic to Jordan', current: species.ecology.isEndemic },
  ];

  const nameFields = [
    { key: 'en', label: 'English', value: species.commonNameEn, draft: draftCommonNameEn, setDraft: setDraftCommonNameEn, payloadKey: 'common_name_en' },
    { key: 'ar', label: 'Arabic',  value: species.commonNameAr, draft: draftCommonNameAr, setDraft: setDraftCommonNameAr, payloadKey: 'common_name_ar' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-teal-200 shadow-sm overflow-hidden">
      <div className="bg-teal-50/50 px-5 py-3 border-b border-teal-100 flex items-center gap-2 text-teal-800 font-bold text-sm tracking-wide">
        <ShieldCheck size={18} /> RESEARCHER TOOLS
      </div>

      <div className="p-5 space-y-5">
        {/* Flags */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Species Flags</p>
          <div className="flex flex-col gap-2">
            {flags.map(({ key, label, current }) => (
              <div key={key} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-2.5 border border-slate-100">
                <span className="text-sm font-semibold text-slate-700">{label}</span>
                <button
                  disabled={updateMutation.isPending}
                  onClick={() => updateMutation.mutate({ [key]: !current })}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${current ? 'bg-teal-600' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${current ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Common Names */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Common Names</p>
          <div className="space-y-2">
            {nameFields.map(({ key, label, value, draft, setDraft, payloadKey }) =>
              editingField === `name_${key}` ? (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">{label}</label>
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className="w-full border border-teal-300 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-teal-400"
                    dir={key === 'ar' ? 'rtl' : 'ltr'}
                  />
                  <div className="flex gap-2">
                    <button
                      disabled={updateMutation.isPending}
                      onClick={() => updateMutation.mutate({ [payloadKey]: draft })}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-bold py-2 rounded-lg text-xs transition-colors flex justify-center items-center"
                    >
                      {updateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
                    </button>
                    <button onClick={() => setEditingField(null)} className="px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-2 rounded-lg text-xs">Cancel</button>
                  </div>
                </div>
              ) : (
                <div key={key} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-2.5 border border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{label}</p>
                    <p className="text-sm font-semibold text-slate-700" dir={key === 'ar' ? 'rtl' : 'ltr'}>
                      {value || <span className="italic text-slate-400">Not set</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => { setDraft(value || ''); setEditingField(`name_${key}`); }}
                    className="text-xs text-teal-600 hover:text-teal-700 font-bold"
                  >Edit</button>
                </div>
              )
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Description</p>
          {editingField === 'description' ? (
            <div className="space-y-2">
              <textarea
                autoFocus
                rows={6}
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                className="w-full border border-teal-300 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-teal-400 resize-none"
              />
              <div className="flex gap-2">
                <button
                  disabled={updateMutation.isPending}
                  onClick={() => updateMutation.mutate({ description: draftDescription, description_is_verified: true })}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-bold py-2 rounded-lg text-xs transition-colors flex justify-center items-center gap-1.5"
                >
                  {updateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle size={12} /> Save & Verify</>}
                </button>
                <button onClick={() => setEditingField(null)} className="px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-2 rounded-lg text-xs">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-100 flex justify-between items-start gap-3">
              <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 italic">
                {species.description.text || <span className="text-slate-400">No description yet.</span>}
              </p>
              <button
                onClick={() => { setDraftDescription(species.description.text || ''); setEditingField('description'); }}
                className="text-xs text-teal-600 hover:text-teal-700 font-bold shrink-0"
              >Edit</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
