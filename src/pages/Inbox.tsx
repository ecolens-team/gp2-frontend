import { useState, useEffect } from "react";
import ChatPage from "./ChatPage";
import { useUIContext } from "../contexts/UIContext";

function Notifications() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
      <span className="text-4xl">🔔</span>
      <p className="font-medium text-sm">No notifications yet</p>
    </div>
  );
}

export default function Inbox() {
  const [active, setActive] = useState<"chats" | "notifications">("chats");
  const { inboxTabsVisible, setHideBottomNav, setInboxTabsVisible } = useUIContext();

  useEffect(() => {
    return () => {
      setHideBottomNav(false);
      setInboxTabsVisible(true);
    };
  }, []);

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className={`bg-white border-b border-gray-100 shrink-0 ${inboxTabsVisible ? 'flex' : 'hidden md:flex'}`}>
        {(["chats", "notifications"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`flex-1 py-3 text-sm font-bold transition-all capitalize border-b-2 ${
              active === tab
                ? "border-teal-500 text-teal-700"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab === "chats" ? "Chats" : "Notifications"}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        {active === "chats" ? <ChatPage /> : <Notifications />}
      </div>
    </div>
  );
}
