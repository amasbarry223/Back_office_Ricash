'use client';

import React, { useMemo } from 'react';
import {
  AlertTriangle,
  Wallet,
  IdCard,
  Info,
  ArrowLeftRight,
  CheckCheck,
  Bell,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import { useRouterStore } from '@/stores/router-store';
import { useNotificationsStore } from '@/stores/notifications-store';
import type { NotificationType, Notification } from '@/types';
import { formatTimeAgo } from '@/lib/format';

const NOTIFICATION_ICONS: Record<NotificationType, { icon: React.ElementType; colorClass: string; bgClass: string }> = {
  FRAUD_ALERT: {
    icon: AlertTriangle,
    colorClass: 'text-red-500',
    bgClass: 'bg-red-50',
  },
  LOW_FLOAT: {
    icon: Wallet,
    colorClass: 'text-orange-500',
    bgClass: 'bg-orange-50',
  },
  KYC_EXPIRED: {
    icon: IdCard,
    colorClass: 'text-yellow-600',
    bgClass: 'bg-yellow-50',
  },
  SYSTEM: {
    icon: Info,
    colorClass: 'text-sky-500',
    bgClass: 'bg-sky-50',
  },
  TRANSACTION_ALERT: {
    icon: ArrowLeftRight,
    colorClass: 'text-[var(--ricash-primary)]',
    bgClass: 'bg-[var(--ricash-primary)]/5',
  },
};

export default function NotificationsView() {
  const navigate = useRouterStore((s) => s.navigate);
  const notifications = useNotificationsStore((s) => s.notifications);
  const markAsRead = useNotificationsStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationsStore((s) => s.markAllAsRead);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [notifications]
  );

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast.success('Toutes les notifications marquées comme lues');
  };

  const handleClickNotification = (notif: Notification) => {
    if (!notif.read) {
      markAsRead(notif.id);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} notification${unreadCount !== 1 ? 's' : ''} non lue${unreadCount !== 1 ? 's' : ''}`}
        breadcrumb={[
          { label: 'Tableau de bord', onClick: () => navigate('dashboard') },
          { label: 'Notifications' },
        ]}
      >
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-[var(--ricash-primary)] hover:text-[var(--ricash-primary)]/80 border-[var(--ricash-primary)]/30"
            onClick={handleMarkAllAsRead}
          >
            <CheckCheck className="size-4 mr-1.5" />
            Tout marquer comme lu
          </Button>
        )}
      </PageHeader>

      {sortedNotifications.length === 0 ? (
        <EmptyState
          title="Aucune notification"
          description="Vous n'avez pas de notification pour le moment."
          icon={<Bell className="size-8 text-muted-foreground" />}
        />
      ) : (
        <div className="space-y-2 max-h-[calc(100vh-260px)] overflow-y-auto pr-1 scrollbar-thin">
          {sortedNotifications.map((notif) => {
            const config = NOTIFICATION_ICONS[notif.type];
            const IconComponent = config.icon;

            return (
              <Card
                key={notif.id}
                className={`cursor-pointer transition-all duration-150 hover:shadow-md ${
                  notif.read
                    ? 'bg-white border-border/50'
                    : 'bg-white border-l-4 border-l-[var(--ricash-accent)] shadow-sm'
                }`}
                onClick={() => handleClickNotification(notif)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`flex items-center justify-center size-10 rounded-lg shrink-0 ${config.bgClass}`}
                    >
                      <IconComponent className={`size-5 ${config.colorClass}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground truncate">
                              {notif.title}
                            </h3>
                            {!notif.read && (
                              <span className="size-2 rounded-full bg-[var(--ricash-accent)] shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
