import { create } from 'zustand';
import { Notification, SentNotification, NotificationType, NotificationPriority, NotificationRecipientType } from '@/types';
import { mockNotifications, mockSentNotifications } from '@/mocks/notifications.mock';

interface ComposeForm {
  type: NotificationType;
  priority: NotificationPriority;
  recipientType: NotificationRecipientType;
  title: string;
  message: string;
}

interface NotificationsStore {
  notifications: Notification[];
  sentNotifications: SentNotification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getUnreadCount: () => number;
  getRecent: (limit: number) => Notification[];
  sendNotification: (form: ComposeForm, senderId: string, senderName: string) => void;
  deleteNotification: (id: string) => void;
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  notifications: [...mockNotifications],
  sentNotifications: [...mockSentNotifications],

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

  sendNotification: (form, senderId, senderName) => {
    // Calculate recipient count based on type
    let recipientCount = 0;
    switch (form.recipientType) {
      case 'all_clients':
        recipientCount = 30; // mock count
        break;
      case 'all_agents':
        recipientCount = 12; // mock count
        break;
      case 'all_admins':
        recipientCount = 5; // mock count
        break;
      case 'specific':
        recipientCount = 1; // mock count
        break;
    }

    const now = new Date().toISOString();
    const newId = `NOT-${String(get().notifications.length + 1).padStart(3, '0')}`;
    const sentId = `SNT-${String(get().sentNotifications.length + 1).padStart(3, '0')}`;

    const sentNotif: SentNotification = {
      id: sentId,
      type: form.type,
      title: form.title,
      message: form.message,
      read: true,
      createdAt: now,
      priority: form.priority,
      senderId,
      senderName,
      recipientType: form.recipientType,
      recipientCount,
    };

    // Also add to main notifications as a system notification
    const systemNotif: Notification = {
      id: newId,
      type: form.type,
      title: form.title,
      message: form.message,
      read: false,
      createdAt: now,
      priority: form.priority,
      senderId,
      senderName,
      recipientType: form.recipientType,
      recipientCount,
    };

    set(state => ({
      sentNotifications: [sentNotif, ...state.sentNotifications],
      notifications: [systemNotif, ...state.notifications],
    }));
  },

  deleteNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },
}));
