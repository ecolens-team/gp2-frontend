import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/axiosConfig';

export interface INotification {
  id: number;
  notif_type: 'like' | 'comment' | 'message' | 'follow';
  sender_username: string;
  sender_picture: string | null;
  message: string;
  content_id: number | null;
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications]   = useState<INotification[]>([]);
  const [wsReady, setWsReady]               = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // جلب القديمة
  useEffect(() => {
    api.get<INotification[]>('/notifications/').then(res => setNotifications(res.data));
  }, []);

  // WebSocket
  useEffect(() => {
    let ws: WebSocket;

    api.get<{ token: string }>('/ws-token/').then(({ data }) => {
      const BASE_WS = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
      ws = new WebSocket(`${BASE_WS}/ws/notifications/?token=${data.token}`);
      wsRef.current = ws;

      ws.onopen  = () => setWsReady(true);
      ws.onclose = () => setWsReady(false);
      ws.onmessage = (e) => {
        const notif: INotification = JSON.parse(e.data);
        setNotifications(prev => [notif, ...prev]);
      };
    });

    return () => ws?.close();
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markRead = useCallback(async (id: number) => {
    await api.post(`/notifications/${id}/read/`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  }, []);

  const markAllRead = useCallback(async () => {
    await api.delete('/notifications/read-all/');
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }, []);

  return { notifications, unreadCount, markRead, markAllRead, wsReady };
}