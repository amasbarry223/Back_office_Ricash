'use client';

import React, { useMemo, useState } from 'react';
import {
  Bell,
  CheckCheck,
  Inbox,
  MailOpen,
  Mail,
  Search,
  Send,
  Plus,
  History,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import NotificationCompose from '@/components/notifications/NotificationCompose';
import NotificationInboxCard from '@/components/notifications/NotificationInboxCard';
import NotificationSentCard from '@/components/notifications/NotificationSentCard';
import { useRouterStore } from '@/stores/router-store';
import { useNotificationsStore } from '@/stores/notifications-store';
import {
  filterInboxNotifications,
  groupNotificationsByDate,
  type InboxFilter,
} from '@/lib/notification-ui';
import { cn } from '@/lib/utils';

const TAB_META: Record<string, { label: string; description: string }> = {
  inbox: {
    label: 'Boîte de réception',
    description: 'Alertes système, fraude, float, KYC et messages reçus',
  },
  compose: {
    label: 'Envoyer une notification',
    description: 'Diffusez un message aux clients, agents ou administrateurs',
  },
  sent: {
    label: 'Historique des envois',
    description: 'Notifications que vous avez envoyées depuis le back-office',
  },
};

const INBOX_FILTERS: { id: InboxFilter; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'Toutes', icon: Inbox },
  { id: 'unread', label: 'Non lues', icon: Mail },
  { id: 'read', label: 'Lues', icon: MailOpen },
];

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-colors',
        accent
          ? 'border-ricash-brand/30 bg-gradient-to-br from-ricash-brand/10 to-background'
          : 'border-border/60 bg-card',
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1 text-2xl font-bold tabular-nums',
          accent ? 'text-ricash-brand' : 'text-foreground',
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function NotificationsView() {
  const navigate = useRouterStore((s) => s.navigate);
  const notifications = useNotificationsStore((s) => s.notifications);
  const sentNotifications = useNotificationsStore((s) => s.sentNotifications);
  const markAsRead = useNotificationsStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationsStore((s) => s.markAllAsRead);
  const deleteNotification = useNotificationsStore((s) => s.deleteNotification);

  const [activeTab, setActiveTab] = useState('inbox');
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const readCount = notifications.length - unreadCount;

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [notifications],
  );

  const filteredInbox = useMemo(
    () => filterInboxNotifications(sortedNotifications, inboxFilter, searchQuery),
    [sortedNotifications, inboxFilter, searchQuery],
  );

  const groupedInbox = useMemo(
    () => groupNotificationsByDate(filteredInbox),
    [filteredInbox],
  );

  const sortedSent = useMemo(
    () =>
      [...sentNotifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [sentNotifications],
  );

  const activeTabMeta = TAB_META[activeTab];

  const handleNotificationSent = () => {
    setActiveTab('sent');
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast.success('Toutes les notifications marquées comme lues');
  };

  const handleMarkNotificationRead = (id: string) => {
    const notif = notifications.find((n) => n.id === id);
    if (notif && !notif.read) {
      markAsRead(id);
    }
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotification(id);
    toast.success('Notification supprimée');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Centre de communication — alertes opérationnelles et messages diffusés"
        breadcrumb={[
          { label: 'Tableau de bord', onClick: () => navigate('dashboard') },
          { label: 'Notifications' },
        ]}
      >
        {activeTab === 'inbox' && unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="border-ricash-brand/30 text-ricash-brand hover:bg-ricash-brand/5"
            onClick={handleMarkAllAsRead}
          >
            <CheckCheck className="size-4 mr-1.5" />
            Tout marquer comme lu
          </Button>
        )}
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => setActiveTab('compose')}
        >
          <Plus className="size-4 mr-1.5" />
          Nouvelle notification
        </Button>
      </PageHeader>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Non lues" value={unreadCount} hint="À traiter en priorité" accent />
        <StatCard label="Dans la boîte" value={notifications.length} hint={`${readCount} déjà lues`} />
        <StatCard label="Envoyées" value={sentNotifications.length} hint="Par votre équipe" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="overflow-x-auto border-b bg-muted/20 px-3 py-2 sm:px-4 ricash-scroll">
            <TabsList className="h-auto min-w-max w-full justify-start gap-1 bg-transparent p-0">
              <TabsTrigger
                value="inbox"
                className="gap-2 px-3 py-2 h-auto data-[state=active]:bg-background data-[state=active]:text-ricash-brand data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border/60"
              >
                <Bell className="size-4 shrink-0" />
                Boîte de réception
                {unreadCount > 0 && (
                  <Badge variant="error" className="ml-0.5 h-5 min-w-[20px] justify-center border-0 px-1.5 text-[10px]">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="compose"
                className="gap-2 px-3 py-2 h-auto data-[state=active]:bg-background data-[state=active]:text-ricash-brand data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border/60"
              >
                <Send className="size-4 shrink-0" />
                Envoyer
              </TabsTrigger>
              <TabsTrigger
                value="sent"
                className="gap-2 px-3 py-2 h-auto data-[state=active]:bg-background data-[state=active]:text-ricash-brand data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border/60"
              >
                <History className="size-4 shrink-0" />
                Envoyées
              </TabsTrigger>
            </TabsList>
          </div>

          {activeTabMeta && activeTab !== 'compose' && (
            <div className="border-b bg-muted/10 px-4 py-3">
              <p className="text-sm font-medium text-foreground">{activeTabMeta.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{activeTabMeta.description}</p>
            </div>
          )}
        </div>

        {/* ─── Inbox ─── */}
        <TabsContent value="inbox" className="mt-0 space-y-4 focus-visible:outline-none">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrer les notifications">
              {INBOX_FILTERS.map(({ id, label, icon: Icon }) => {
                const count =
                  id === 'all'
                    ? notifications.length
                    : id === 'unread'
                      ? unreadCount
                      : readCount;
                const isActive = inboxFilter === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setInboxFilter(id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                      isActive
                        ? 'border-ricash-brand/40 bg-ricash-brand/10 text-ricash-brand shadow-sm'
                        : 'border-border bg-card text-muted-foreground hover:border-ricash-brand/30 hover:text-foreground',
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden />
                    {label}
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0.5 text-[10px] tabular-nums',
                        isActive ? 'bg-ricash-brand/15' : 'bg-muted',
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Rechercher une notification…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                aria-label="Rechercher dans la boîte de réception"
              />
            </div>
          </div>

          {filteredInbox.length === 0 ? (
            <EmptyState
              title={
                searchQuery || inboxFilter !== 'all'
                  ? 'Aucun résultat'
                  : 'Aucune notification'
              }
              description={
                searchQuery
                  ? 'Essayez un autre mot-clé ou réinitialisez les filtres.'
                  : inboxFilter === 'unread'
                    ? 'Toutes vos notifications ont été lues.'
                    : 'Vous n\'avez pas de notification pour le moment.'
              }
              icon={<Bell className="size-8 text-muted-foreground" />}
              action={
                (searchQuery || inboxFilter !== 'all') ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setInboxFilter('all');
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-6 max-h-[calc(100vh-420px)] overflow-y-auto pr-1 ricash-scroll">
              {groupedInbox.map((group) => (
                <section key={group.label} aria-labelledby={`notif-group-${group.label}`}>
                  <h2
                    id={`notif-group-${group.label}`}
                    className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {group.label}
                    <span className="ml-2 font-normal normal-case text-muted-foreground/80">
                      ({group.items.length})
                    </span>
                  </h2>
                  <div className="space-y-2">
                    {group.items.map((notif) => (
                      <NotificationInboxCard
                        key={notif.id}
                        notif={notif}
                        onRead={handleMarkNotificationRead}
                        onDelete={handleDeleteNotification}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Compose ─── */}
        <TabsContent value="compose" className="mt-0 focus-visible:outline-none">
          <NotificationCompose onSuccess={handleNotificationSent} />
        </TabsContent>

        {/* ─── Sent ─── */}
        <TabsContent value="sent" className="mt-0 space-y-4 focus-visible:outline-none">
          {sortedSent.length === 0 ? (
            <EmptyState
              title="Aucun envoi"
              description="Les notifications que vous diffusez apparaîtront ici."
              icon={<Send className="size-8 text-muted-foreground" />}
              action={
                <Button type="button" variant="primary" size="sm" onClick={() => setActiveTab('compose')}>
                  <Plus className="size-4 mr-1.5" />
                  Nouvelle notification
                </Button>
              }
            />
          ) : (
            <div className="space-y-2 max-h-[calc(100vh-420px)] overflow-y-auto pr-1 ricash-scroll">
              {sortedSent.map((notif) => (
                <NotificationSentCard key={notif.id} notif={notif} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
