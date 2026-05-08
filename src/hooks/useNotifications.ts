import { useNotificationsContext } from '../contexts/NotificationsContext';

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
  return useNotificationsContext();
}
