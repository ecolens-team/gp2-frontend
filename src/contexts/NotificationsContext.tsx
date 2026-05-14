/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import { api } from '../lib/axiosConfig';
import { useAuth } from './AuthContext/AuthContext';
import type { INotification } from '../hooks/useNotifications';

interface NotificationsContextValue {
  notifications: INotification[];
  unreadCount: number;
  wsReady: boolean;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { authUser } = useAuth();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [wsReady, setWsReady] = useState(false);

  useEffect(() => {
    if (!authUser) {
      setNotifications([]);
      setWsReady(false);
      return;
    }

    let ws: WebSocket | null = null;
    let cancelled = false;

    api.get<INotification[]>('/notifications/').then((res) => {
      if (!cancelled) setNotifications(res.data);
    });

    api.get<{ token: string }>('/ws-token/').then(({ data }) => {
      if (cancelled) return;
      const BASE_WS = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
      ws = new WebSocket(`${BASE_WS}/ws/notifications/?token=${data.token}`);

      ws.onopen = () => setWsReady(true);
      ws.onclose = () => setWsReady(false);
      ws.onmessage = (e) => {
        const notif: INotification = JSON.parse(e.data);
        setNotifications((prev) => [notif, ...prev]);
      };
    });

    return () => {
      cancelled = true;
      ws?.close();
    };
  }, [authUser?.id]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markRead = useCallback(async (id: number) => {
    await api.post(`/notifications/${id}/read/`);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
  }, []);

  const markAllRead = useCallback(async () => {
    await api.delete('/notifications/read-all/');
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, []);

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, wsReady, markRead, markAllRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      'useNotificationsContext must be used inside NotificationsProvider',
    );
  return ctx;
}
