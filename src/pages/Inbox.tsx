import { useState, useEffect, useRef } from "react";
import ChatPage from "./ChatPage";
import { useUIContext } from "../contexts/UIContext";
import { useNotifications, type INotification } from "../hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, UserPlus, Mail } from "lucide-react";

const ICON_MAP = {
  like:    <Heart size={15} className="text-rose-500" />,
  comment: <MessageCircle size={15} className="text-teal-500" />,
  message: <Mail size={15} className="text-blue-500" />,
  follow:  <UserPlus size={15} className="text-purple-500" />,
};

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotificationItem({ n, onRead }: { n: INotification; onRead: (id: number) => void }) {
  const navigate = useNavigate();

  const handleClick = () => {
    onRead(n.id);
    if (n.notif_type === 'like' || n.notif_type === 'comment') {
      navigate(`/observations/${n.content_id}`);
    } else if (n.notif_type === 'message') {
      navigate('/inbox');
    } else if (n.notif_type === 'follow') {
      navigate(`/users/${n.sender_username}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${
        !n.is_read ? 'bg-teal-50' : 'bg-white'
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm overflow-hidden">
          {n.sender_picture ? (
            <img src={n.sender_picture} alt={n.sender_username} className="w-full h-full object-cover" />
          ) : (
            n.sender_username[0].toUpperCase()
          )}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5">
          {ICON_MAP[n.notif_type]}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.created_at)}</p>
      </div>

      {/* Unread dot */}
      {!n.is_read && (
        <div className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
      )}
    </div>
  );
}

function Notifications() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
        <span className="text-4xl">🔔</span>
        <p className="font-medium text-sm">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {unreadCount > 0 && (
        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100 bg-white shrink-0">
          <span className="text-xs text-gray-500">
            {unreadCount} unread
          </span>
          <button
            onClick={markAllRead}
            className="text-xs text-teal-600 font-medium"
          >
            Mark all as read
          </button>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.map(n => (
          <NotificationItem key={n.id} n={n} onRead={markRead} />
        ))}
      </div>
    </div>
  );
}

export default function Inbox() {
  const [active, setActive] = useState<"chats" | "notifications">("chats");
  const { inboxTabsVisible, setHideBottomNav, setInboxTabsVisible } = useUIContext();
  const { unreadCount } = useNotifications();

  useEffect(() => {
    return () => {
      setHideBottomNav(false);
      setInboxTabsVisible(true);
    };
  }, []);

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Tabs */}
      <div className={`bg-white border-b border-gray-100 shrink-0 ${inboxTabsVisible ? 'flex' : 'hidden md:flex'}`}>
        {(["chats", "notifications"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`flex-1 py-3 text-sm font-bold transition-all capitalize border-b-2 relative ${
              active === tab
                ? "border-teal-500 text-teal-700"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab === "chats" ? "Chats" : "Notifications"}
            {tab === "notifications" && unreadCount > 0 && (
              <span className="absolute top-2 right-[calc(50%-28px)] bg-teal-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        {active === "chats" ? <ChatPage /> : <Notifications />}
      </div>
    </div>
  );
}