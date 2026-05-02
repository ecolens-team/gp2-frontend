import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext/AuthContext";
import { LayoutDashboard, Microscope, BarChart2, Trophy, Download } from "lucide-react";
import OverviewTab from "../components/researcher/OverviewTab";
import VerificationTab from "../components/researcher/VerificationTab";
import InsightsTab from "../components/researcher/InsightsTab";
import QuestsTab from "../components/researcher/QuestsTab";
import ExportTab from "../components/researcher/ExportTab";

type TabId = "home" | "speciesVerification" | "speciesInsights" | "quests" | "data";

const TAB_CONFIG: { id: TabId; title: string; icon: React.ReactNode }[] = [
  { id: "home",               title: "Overview",            icon: <LayoutDashboard size={18} /> },
  { id: "speciesVerification",title: "Species Verification", icon: <Microscope size={18} /> },
  { id: "speciesInsights",    title: "Species Insights",     icon: <BarChart2 size={18} /> },
  { id: "quests",             title: "My Quests",            icon: <Trophy size={18} /> },
  { id: "data",               title: "Data Export",          icon: <Download size={18} /> },
];

const Sidebar = ({
  active,
  setActive,
  disabled,
}: {
  active: TabId;
  setActive: (id: TabId) => void;
  disabled?: boolean;
}) => (
  <div className="w-60 bg-teal-600 text-white h-full flex flex-col">
    <div className="bg-teal-700 px-6 py-5">
      <h1 className="font-black text-lg ">Researcher Dashboard</h1>
    </div>
    <nav className="flex-1 py-2">
      {TAB_CONFIG.map(tab => {
        const isDisabled = disabled && tab.id !== "home";
        return (
          <button
            key={tab.id}
            onClick={() => !isDisabled && setActive(tab.id)}
            disabled={isDisabled}
            className={`w-full flex items-center gap-3 px-6 py-3.5 text-sm font-bold transition-colors
              ${isDisabled ? "opacity-30 cursor-not-allowed" : "hover:bg-teal-500/40 cursor-pointer"}
              ${active === tab.id ? "bg-teal-700/60 " : ""}
            `}
          >
            <span className="opacity-70">{tab.icon}</span>
            {tab.title}
          </button>
        );
      })}
    </nav>
  </div>
);

export default function ResearcherDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const { authUser } = useAuth();
  const navigate = useNavigate();

  if (!authUser || (authUser.role !== "RESEARCHER" && authUser.role !== "ADMIN")) {
    navigate("/");
    return null;
  }

  const isApproved = authUser.researcher_profile?.application_status === "APPROVED"
    || authUser.role === "ADMIN";

  const tabContent: Record<TabId, React.ReactNode> = useMemo(() => ({
    home:               <OverviewTab authUser={authUser} onNavigate={id => setActiveTab(id as TabId)} />,
    speciesVerification:<VerificationTab />,
    speciesInsights:    <InsightsTab />,
    quests:             <QuestsTab />,
    data:               <ExportTab />,
  }), [authUser]);

  const currentTitle = TAB_CONFIG.find(t => t.id === activeTab)?.title ?? "";

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">
      <Sidebar active={activeTab} setActive={setActiveTab} disabled={!isApproved} />

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6 border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto w-full">
            <h2 className="text-2xl font-black text-gray-900">{currentTitle}</h2>
          </div>
        </div>
        
        <div className="p-8 max-w-7xl mx-auto w-full">
          {tabContent[activeTab]}
        </div>
      </div>
    </div>
  );
}
