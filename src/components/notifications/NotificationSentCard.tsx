'use client';

import type { ElementType } from 'react';
import { Clock, Send, Users, UserCheck, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatTimeAgo } from '@/lib/format';
import { NOTIFICATION_TYPE_UI, PRIORITY_BADGE_UI } from '@/lib/notification-ui';
import {
  NOTIFICATION_TYPE_LABELS,
  RECIPIENT_TYPE_LABELS,
  type SentNotification,
} from '@/types';
const RECIPIENT_ICONS: Record<string, ElementType> = {
  all_clients: Users,
  all_agents: UserCheck,
  all_admins: ShieldCheck,
  specific: Users,
};

interface NotificationSentCardProps {
  notif: SentNotification;
}

export default function NotificationSentCard({ notif }: NotificationSentCardProps) {
  const config = NOTIFICATION_TYPE_UI[notif.type];
  const Icon = config.icon;
  const RecipientIcon = RECIPIENT_ICONS[notif.recipientType] ?? Users;
  const priorityInfo = PRIORITY_BADGE_UI[notif.priority];

  return (
    <article
      className={cn(
        'flex gap-3 rounded-xl border border-border/60 bg-card p-4 transition-all duration-150 hover:shadow-md',
      )}
    >
      <div
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-xl',
          config.bgClass,
        )}
      >
        <Icon className={cn('size-5', config.colorClass)} aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{notif.title}</h3>
          <Badge variant={priorityInfo.variant} className="h-5 px-1.5 text-[10px]">
            {priorityInfo.label}
          </Badge>
          <Badge variant="neutral" className="h-5 px-1.5 text-[10px]">
            {NOTIFICATION_TYPE_LABELS[notif.type]}
          </Badge>
        </div>

        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{notif.message}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <RecipientIcon className="size-3.5 shrink-0" aria-hidden />
            {RECIPIENT_TYPE_LABELS[notif.recipientType]}
            <Badge variant="outline" className="ml-0.5 h-5 px-1.5 text-[10px]">
              {notif.recipientCount}
            </Badge>
          </span>
          <Separator orientation="vertical" className="hidden h-3 sm:block" />
          <span className="inline-flex items-center gap-1.5">
            <Send className="size-3.5 shrink-0" aria-hidden />
            {notif.senderName}
          </span>
          <Separator orientation="vertical" className="hidden h-3 sm:block" />
          <time className="inline-flex items-center gap-1.5" dateTime={notif.createdAt}>
            <Clock className="size-3.5 shrink-0" aria-hidden />
            {formatTimeAgo(notif.createdAt)}
          </time>
        </div>
      </div>
    </article>
  );
}
