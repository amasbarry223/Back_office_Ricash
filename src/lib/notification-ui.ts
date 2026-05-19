import type { ElementType } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  Bell,
  IdCard,
  Info,
  Shield,
  Wallet,
  Wrench,
} from 'lucide-react';
import type { Notification, NotificationType } from '@/types';

export const NOTIFICATION_TYPE_UI: Record<
  NotificationType,
  { icon: ElementType; colorClass: string; bgClass: string }
> = {
  FRAUD_ALERT: { icon: AlertTriangle, colorClass: 'text-ricash-danger', bgClass: 'bg-ricash-danger-bg' },
  LOW_FLOAT: { icon: Wallet, colorClass: 'text-ricash-warning', bgClass: 'bg-ricash-warning-bg' },
  KYC_EXPIRED: { icon: IdCard, colorClass: 'text-ricash-amber', bgClass: 'bg-ricash-amber-bg' },
  SYSTEM: { icon: Info, colorClass: 'text-ricash-info', bgClass: 'bg-ricash-info-bg' },
  TRANSACTION_ALERT: {
    icon: ArrowLeftRight,
    colorClass: 'text-ricash-brand',
    bgClass: 'bg-ricash-brand-bg',
  },
  GENERAL_INFO: { icon: Bell, colorClass: 'text-ricash-blue-gray', bgClass: 'bg-ricash-blue-gray-bg' },
  MAINTENANCE: { icon: Wrench, colorClass: 'text-ricash-amber', bgClass: 'bg-ricash-amber-bg' },
  SECURITY: { icon: Shield, colorClass: 'text-ricash-danger', bgClass: 'bg-ricash-danger-bg' },
};

export const PRIORITY_BADGE_UI: Record<
  string,
  { variant: 'success' | 'warning' | 'error'; label: string }
> = {
  normal: { variant: 'success', label: 'Normale' },
  high: { variant: 'warning', label: 'Haute' },
  urgent: { variant: 'error', label: 'Urgente' },
};

export type InboxFilter = 'all' | 'unread' | 'read';

export interface NotificationDateGroup {
  label: string;
  items: Notification[];
}

export function groupNotificationsByDate(notifications: Notification[]): NotificationDateGroup[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const buckets: Record<string, Notification[]> = {
    "Aujourd'hui": [],
    Hier: [],
    'Cette semaine': [],
    'Plus ancien': [],
  };

  for (const notif of notifications) {
    const date = new Date(notif.createdAt);
    if (date >= startOfToday) {
      buckets["Aujourd'hui"].push(notif);
    } else if (date >= startOfYesterday) {
      buckets.Hier.push(notif);
    } else if (date >= startOfWeek) {
      buckets['Cette semaine'].push(notif);
    } else {
      buckets['Plus ancien'].push(notif);
    }
  }

  return Object.entries(buckets)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

export function filterInboxNotifications(
  notifications: Notification[],
  filter: InboxFilter,
  query: string,
): Notification[] {
  const q = query.trim().toLowerCase();
  return notifications.filter((n) => {
    if (filter === 'unread' && n.read) return false;
    if (filter === 'read' && !n.read) return false;
    if (!q) return true;
    return (
      n.title.toLowerCase().includes(q) ||
      n.message.toLowerCase().includes(q) ||
      (n.senderName?.toLowerCase().includes(q) ?? false)
    );
  });
}
