import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, ChevronDown, ChevronUp, Users, Clock, CheckCircle, Loader2 } from "lucide-react";
import { api } from "../../lib/axiosConfig";

interface Quest {
  id: number;
  title: string;
  description: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED";
  start_date: string;
  end_date: string;
  participant_count: number;
}

const STATUS_CONFIG = {
  ACTIVE:    { label: "Active",           color: "bg-teal-100 text-teal-700",  icon: <CheckCircle size={12} /> },
  PENDING:   { label: "Pending Approval", color: "bg-amber-100 text-amber-700", icon: <Clock size={12} /> },
  COMPLETED: { label: "Completed",        color: "bg-gray-100 text-gray-600",   icon: null },
};

const questSchema = z.object({
  title:       z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Please provide a description (20+ characters)"),
  start_date:  z.string().min(1, "Start date is required"),
  end_date:    z.string().min(1, "End date is required"),
});

type QuestFormData = z.infer<typeof questSchema>;

function QuestCard({ quest }: { quest: Quest }) {
  const cfg = STATUS_CONFIG[quest.status];
  const daysLeft = quest.status === "ACTIVE"
    ? Math.max(0, Math.ceil((new Date(quest.end_date).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold text-gray-900">{quest.title}</h3>
        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${cfg.color}`}>
          {cfg.icon} {cfg.label}
        </span>
      </div>
      <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{quest.description}</p>
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 font-medium">
        <span className="flex items-center gap-1"><Users size={12} /> {quest.participant_count ?? 0} participants</span>
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

function CreateQuestForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<QuestFormData>({
    resolver: zodResolver(questSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: QuestFormData) => api.post("/quests/new/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-quests"] });
      reset();
      onSuccess();
    },
  });

  const inputClass = "w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200";

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="bg-teal-50/50 border border-teal-100 rounded-2xl p-6 space-y-4">
      <h3 className="font-black text-teal-900">Propose a New Quest</h3>

      <div>
        <input {...register("title")} placeholder="Quest title" className={inputClass} />
        {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <textarea {...register("description")} placeholder="Describe the goal of this quest..." rows={3} className={`${inputClass} resize-none`} />
        {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
      </div>

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

      {mutation.isError && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">Failed to submit — please try again.</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
        >
          {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Submit for Approval
        </button>
      </div>
    </form>
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
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Create toggle */}
      <button
        onClick={() => setShowForm(v => !v)}
        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
      >
        <Plus size={16} />
        Propose Quest
        {showForm ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {showForm && <CreateQuestForm onSuccess={() => setShowForm(false)} />}

      {/* Filter tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit gap-0.5">
        {statusTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === tab.id ? "bg-white text-teal-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
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
  );
}
