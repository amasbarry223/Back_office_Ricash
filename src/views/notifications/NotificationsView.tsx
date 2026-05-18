'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Wallet,
  IdCard,
  Info,
  ArrowLeftRight,
  CheckCheck,
  Bell,
  Send,
  Shield,
  Wrench,
  Trash2,
  Users,
  UserCheck,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import NotificationCompose from '@/components/notifications/NotificationCompose';
import { useRouterStore } from '@/stores/router-store';
import { useNotificationsStore } from '@/stores/notifications-store';
import {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_PRIORITY_LABELS,
  RECIPIENT_TYPE_LABELS,
  type NotificationType,
  type Notification,
  type SentNotification,
} from '@/types';
import { formatTimeAgo } from '@/lib/format';

// ─── Icon & Color Config ────────────────────────────────────

const NOTIFICATION_ICONS: Record<NotificationType, { icon: React.ElementType; colorClass: string; bgClass: string }> = {
  FRAUD_ALERT: { icon: AlertTriangle, colorClass: 'text-red-500', bgClass: 'bg-red-50' },
  LOW_FLOAT: { icon: Wallet, colorClass: 'text-orange-500', bgClass: 'bg-orange-50' },
  KYC_EXPIRED: { icon: IdCard, colorClass: 'text-yellow-600', bgClass: 'bg-yellow-50' },
  SYSTEM: { icon: Info, colorClass: 'text-sky-500', bgClass: 'bg-sky-50' },
  TRANSACTION_ALERT: { icon: ArrowLeftRight, colorClass: 'text-[var(--ricash-primary)]', bgClass: 'bg-[var(--ricash-primary-bg)]' },
  GENERAL_INFO: { icon: Bell, colorClass: 'text-violet-500', bgClass: 'bg-violet-50' },
  MAINTENANCE: { icon: Wrench, colorClass: 'text-amber-500', bgClass: 'bg-amber-50' },
  SECURITY: { icon: Shield, colorClass: 'text-red-600', bgClass: 'bg-red-50' },
};

const RECIPIENT_ICONS: Record<string, React.ElementType> = {
  all_clients: Users,
  all_agents: UserCheck,
  all_admins: ShieldCheck,
  specific: Users,
};

const PRIORITY_BADGE: Record<string, { variant: 'success' | 'warning' | 'error'; label: string }> = {
  normal: { variant: 'success', label: 'Normale' },
  high: { variant: 'warning', label: 'Haute' },
  urgent: { variant: 'error', label: 'Urgente' },
};

// ─── Sub-Components ─────────────────────────────────────────

function NotificationCard({
  notif,
  onRead,
  onDelete,
}: {
  notif: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const config = NOTIFICATION_ICONS[notif.type];
  const IconComponent = config.icon;
  const priorityInfo = notif.priority ? PRIORITY_BADGE[notif.priority] : null;

  return (
    <Card
      className={`
        cursor-pointer transition-all duration-150 hover:shadow-md group
        ${notif.read
          ? 'bg-white border-border/50'
          : 'bg-card border-l-4 border-l-ricash-accent shadow-sm'
        }
      `}
      onClick={() => onRead(notif.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex items-center justify-center size-10 rounded-lg shrink-0 ${config.bgClass}`}>
            <IconComponent className={`size-5 ${config.colorClass}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    {notif.title}
                  </h3>
                  {!notif.read && (
                    <span className="size-2 rounded-full bg-ricash-accent shrink-0" />
                  )}
                  {priorityInfo && (
                    <Badge variant={priorityInfo.variant} className="text-[10px] px-1.5 py-0 h-4">
                      {priorityInfo.label}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                  {notif.message}
                </p>
                {/* Sender info */}
                {notif.senderName && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Envoyé par <span className="font-medium">{notif.senderName}</span>
                    {notif.recipientType && (
                      <> · {RECIPIENT_TYPE_LABELS[notif.recipientType]}</>
                    )}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">
                  {formatTimeAgo(notif.createdAt)}
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-[var(--ricash-danger)]"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notif.id);
                  }}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SentNotificationCard({ notif }: { notif: SentNotification }) {
  const config = NOTIFICATION_ICONS[notif.type];
  const IconComponent = config.icon;
  const RecipientIcon = RECIPIENT_ICONS[notif.recipientType] || Users;
  const priorityInfo = PRIORITY_BADGE[notif.priority];

  return (
    <Card className="transition-all duration-150 hover:shadow-md border-l-4 border-l-[var(--ricash-primary)]/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex items-center justify-center size-10 rounded-lg shrink-0 ${config.bgClass}`}>
            <IconComponent className={`size-5 ${config.colorClass}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    {notif.title}
                  </h3>
                  {priorityInfo && (
                    <Badge variant={priorityInfo.variant} className="text-[10px] px-1.5 py-0 h-4">
                      {priorityInfo.label}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                  {notif.message}
                </p>
                {/* Meta row */}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <RecipientIcon className="size-3" />
                    <span>{RECIPIENT_TYPE_LABELS[notif.recipientType]}</span>
                    <Badge variant="neutral" className="text-[10px] px-1.5 py-0 h-4 ml-1">
                      {notif.recipientCount}
                    </Badge>
                  </div>
                  <Separator orientation="vertical" className="h-3" />
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Send className="size-3" />
                    <span>Par {notif.senderName}</span>
                  </div>
                  <Separator orientation="vertical" className="h-3" />
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    <span>{formatTimeAgo(notif.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main View ──────────────────────────────────────────────

export default function NotificationsView() {
  const navigate = useRouterStore((s) => s.navigate);
  const notifications = useNotificationsStore((s) => s.notifications);
  const sentNotifications = useNotificationsStore((s) => s.sentNotifications);
  const markAsRead = useNotificationsStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationsStore((s) => s.markAllAsRead);
  const deleteNotification = useNotificationsStore((s) => s.deleteNotification);

  const [activeTab, setActiveTab] = useState('inbox');

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [notifications]
  );

  const sortedSentNotifications = useMemo(
    () =>
      [...sentNotifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [sentNotifications]
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

  const handleDeleteNotification = (id: string) => {
    deleteNotification(id);
    toast.success('Notification supprimée');
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} notification${unreadCount !== 1 ? 's' : ''} non lue${unreadCount !== 1 ? 's' : ''} · ${sentNotifications.length} envoyée${sentNotifications.length !== 1 ? 's' : ''}`}
        breadcrumb={[
          { label: 'Tableau de bord', onClick: () => navigate('dashboard') },
          { label: 'Notifications' },
        ]}
      >
        {activeTab === 'inbox' && unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-ricash-brand hover:text-ricash-brand/80 border-ricash-brand/30"
            onClick={handleMarkAllAsRead}
          >
            <CheckCheck className="size-4 mr-1.5" />
            Tout marquer comme lu
          </Button>
        )}
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inbox" className="gap-1.5">
            <Bell className="size-3.5" />
            Boîte de réception
            {unreadCount > 0 && (
              <Badge variant="error" className="text-[10px] px-1.5 py-0 h-4 min-w-[16px] justify-center border-0 ml-1">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="compose" className="gap-1.5">
            <Send className="size-3.5" />
            Envoyer
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-1.5">
            <CheckCheck className="size-3.5" />
            Envoyées
            {sentNotifications.length > 0 && (
              <Badge variant="neutral" className="text-[10px] px-1.5 py-0 h-4 ml-1">
                {sentNotifications.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ─── Inbox Tab ─── */}
        <TabsContent value="inbox">
          {sortedNotifications.length === 0 ? (
            <EmptyState
              title="Aucune notification"
              description="Vous n'avez pas de notification pour le moment."
              icon={<Bell className="size-8 text-muted-foreground" />}
            />
          ) : (
            <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1 ricash-scroll">
              {sortedNotifications.map((notif) => (
                <NotificationCard
                  key={notif.id}
                  notif={notif}
                  onRead={handleClickNotification}
                  onDelete={handleDeleteNotification}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Compose Tab ─── */}
        <TabsContent value="compose">
          <NotificationCompose />
        </TabsContent>

        {/* ─── Sent Tab ─── */}
        <TabsContent value="sent">
          {sortedSentNotifications.length === 0 ? (
            <EmptyState
              title="Aucune notification envoyée"
              description="Vous n'avez pas encore envoyé de notification."
              icon={<Send className="size-8 text-muted-foreground" />}
              action={
                <Button variant="primary" size="sm" onClick={() => setActiveTab('compose')}>
                  <Send className="size-4 mr-1.5" />
                  Envoyer une notification
                </Button>
              }
            />
          ) : (
            <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1 ricash-scroll">
              {sortedSentNotifications.map((notif) => (
                <SentNotificationCard key={notif.id} notif={notif} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
