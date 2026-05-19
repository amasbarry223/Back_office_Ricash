'use client';

import { Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatTimeAgo } from '@/lib/format';
import { NOTIFICATION_TYPE_UI, PRIORITY_BADGE_UI } from '@/lib/notification-ui';
import { NOTIFICATION_TYPE_LABELS, RECIPIENT_TYPE_LABELS, type Notification } from '@/types';

interface NotificationInboxCardProps {
  notif: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function NotificationInboxCard({ notif, onRead, onDelete }: NotificationInboxCardProps) {
  const config = NOTIFICATION_TYPE_UI[notif.type];
  const Icon = config.icon;
  const priorityInfo = notif.priority ? PRIORITY_BADGE_UI[notif.priority] : null;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onRead(notif.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onRead(notif.id);
        }
      }}
      className={cn(
        'group relative flex gap-3 rounded-xl border p-4 text-left transition-all duration-150',
        'hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ricash-brand/30',
        notif.read
          ? 'border-border/60 bg-card'
          : 'border-ricash-brand/25 bg-ricash-brand/[0.03] shadow-sm ring-1 ring-ricash-brand/10',
      )}
      aria-label={`${notif.read ? '' : 'Non lue — '}${notif.title}`}
    >
      {!notif.read && (
        <span
          className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-ricash-accent"
          aria-hidden
        />
      )}

      <div
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-xl',
          config.bgClass,
        )}
      >
        <Icon className={cn('size-5', config.colorClass)} aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">{notif.title}</h3>
              {!notif.read && (
                <Badge variant="brand" className="h-5 px-1.5 text-[10px]">
                  Nouveau
                </Badge>
              )}
              {priorityInfo && (
                <Badge variant={priorityInfo.variant} className="h-5 px-1.5 text-[10px]">
                  {priorityInfo.label}
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {NOTIFICATION_TYPE_LABELS[notif.type]}
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{notif.message}</p>
            {notif.senderName && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Par <span className="font-medium text-foreground">{notif.senderName}</span>
                {notif.recipientType && (
                  <> · {RECIPIENT_TYPE_LABELS[notif.recipientType]}</>
                )}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <time className="text-[11px] text-muted-foreground whitespace-nowrap" dateTime={notif.createdAt}>
              {formatTimeAgo(notif.createdAt)}
            </time>
            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              {!notif.read && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-ricash-brand hover:text-ricash-brand/80"
                  aria-label="Marquer comme lue"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRead(notif.id);
                  }}
                >
                  <Check className="size-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground hover:text-ricash-danger"
                aria-label="Supprimer"
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
    </article>
  );
}
