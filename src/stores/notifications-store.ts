import { create } from 'zustand';
import { Notification } from '@/types';
import { mockNotifications } from '@/mocks/notifications.mock';

interface NotificationsStore {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getUnreadCount: () => number;
  getRecent: (limit: number) => Notification[];
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  notifications: [...mockNotifications],

  markAsRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
    }));
  },

  getUnreadCount: () => {
    return get().notifications.filter(n => !n.read).length;
  },

  getRecent: (limit) => {
    return [...get().notifications]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },
}));
