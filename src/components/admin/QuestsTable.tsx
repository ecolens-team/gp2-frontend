import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/axiosConfig";
import { CheckCircle, XCircle, Users, Clock, Trophy, Leaf, Target, Camera, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface AdminQuest {
  id: number;
  title: string;
  description: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "REJECTED";
  category: "PLANT" | "INSECT" | "GENERAL";
  reward_pts: number;
  target_count: number;
  start_date: string;
  end_date: string;
  researcher_username: string;
  participant_count: number;
}

const STATUS_CONFIG = {
  ACTIVE:    { label: "Active",    color: "bg-teal-100 text-teal-700",   dot: "bg-teal-500" },
  PENDING:   { label: "Pending",   color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  COMPLETED: { label: "Completed", color: "bg-gray-100 text-gray-600",   dot: "bg-gray-400" },
  REJECTED:  { label: "Rejected",  color: "bg-red-100 text-red-700",     dot: "bg-red-500" },
};

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  PLANT:   <Leaf size={12} />,
  INSECT:  <Target size={12} />,
  GENERAL: <Camera size={12} />,
};

const TABS = ["PENDING", "ACTIVE", "COMPLETED", "REJECTED", "ALL"] as const;

export default function QuestsTable() {
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const queryClient = useQueryClient();

  const { data: quests = [], isLoading } = useQuery<AdminQuest[]>({
    queryKey: ["admin-quests", statusFilter],
    queryFn: () => {
      const params = statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
      return api.get(`/quests/admin/${params}`).then(r => r.data);
    },
  });

  const approve = useMutation({
    mutationFn: (id: number) => api.patch(`/quests/${id}/approve/`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Quest approved!");
    },
    onError: () => toast.error("Failed to approve quest"),
  });

  const reject = useMutation({
    mutationFn: (id: number) => api.patch(`/quests/${id}/reject/`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Quest rejected.");
    },
    onError: () => toast.error("Failed to reject quest"),
  });

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit gap-0.5">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === tab
                ? "bg-white text-teal-700 shadow-xs"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "ALL" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
        </div>
      ) : quests.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Trophy size={40} className="mx-auto mb-3 opacity-25" />
          <p className="font-medium">No quests found</p>
          <p className="text-sm mt-1">
            {statusFilter === "PENDING" ? "No quests awaiting approval." : "Nothing here yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {quests.map(quest => {
            const cfg = STATUS_CONFIG[quest.status];
            const isPending = quest.status === "PENDING";
            const isBusy = approve.isPending || reject.isPending;

            return (
              <div key={quest.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {CATEGORY_ICON[quest.category]} {quest.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900">{quest.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{quest.description}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-400 font-medium">
                      <span>by <span className="text-gray-600 font-bold">@{quest.researcher_username}</span></span>
                      <span className="flex items-center gap-1"><Users size={11} /> {quest.participant_count} participants</span>
                      <span className="flex items-center gap-1"><Trophy size={11} /> +{quest.reward_pts} pts</span>
                      <span className="flex items-center gap-1"><Target size={11} /> {quest.target_count} obs. needed</span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(quest.start_date).toLocaleDateString()} – {new Date(quest.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {isPending && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => approve.mutate(quest.id)}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {approve.isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                        Approve
                      </button>
                      <button
                        onClick={() => reject.mutate(quest.id)}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {reject.isPending ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
