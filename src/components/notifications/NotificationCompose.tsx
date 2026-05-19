'use client';

import React, { useState } from 'react';
import {
  Send,
  MessageSquare,
  Users,
  UserCheck,
  ShieldCheck,
  UserSquare,
  Megaphone,
} from 'lucide-react';
import NotificationTypePicker from '@/components/notifications/NotificationTypePicker';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useNotificationsStore } from '@/stores/notifications-store';
import { useAuthStore } from '@/stores/auth-store';
import {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_PRIORITY_LABELS,
  RECIPIENT_TYPE_LABELS,
  type NotificationType,
  type NotificationPriority,
  type NotificationRecipientType,
} from '@/types';

const RECIPIENT_CONFIG: Record<
  NotificationRecipientType,
  { icon: React.ElementType; description: string; count: number }
> = {
  all_clients: { icon: Users, description: 'Tous les clients enregistrés', count: 30 },
  all_agents: { icon: UserCheck, description: 'Tous les agents actifs', count: 12 },
  all_admins: { icon: ShieldCheck, description: 'Tous les administrateurs', count: 5 },
  specific: { icon: UserSquare, description: 'Sélection manuelle', count: 1 },
};

const PRIORITY_CONFIG: Record<NotificationPriority, { dotColor: string }> = {
  normal: { dotColor: 'bg-[var(--ricash-success)]' },
  high: { dotColor: 'bg-[var(--ricash-warning)]' },
  urgent: { dotColor: 'bg-[var(--ricash-danger)]' },
};

interface NotificationComposeProps {
  onSuccess?: () => void;
}

export default function NotificationCompose({ onSuccess }: NotificationComposeProps) {
  const user = useAuthStore((s) => s.user);
  const sendNotification = useNotificationsStore((s) => s.sendNotification);

  const [form, setForm] = useState({
    type: 'GENERAL_INFO' as NotificationType,
    priority: 'normal' as NotificationPriority,
    recipientType: 'all_clients' as NotificationRecipientType,
    title: '',
    message: '',
  });

  const [isSending, setIsSending] = useState(false);

  const recipientConfig = RECIPIENT_CONFIG[form.recipientType];
  const isFormValid = form.title.trim().length >= 3 && form.message.trim().length >= 10;
  const charCount = form.message.length;
  const selectedTypeLabel = NOTIFICATION_TYPE_LABELS[form.type];

  const handleSend = async () => {
    if (!user) {
      toast.error('Session expirée', {
        description: 'Reconnectez-vous pour envoyer une notification.',
      });
      return;
    }

    if (!isFormValid) {
      toast.error('Formulaire incomplet', {
        description: 'Titre (3 caractères min.) et message (10 caractères min.) requis.',
      });
      return;
    }

    setIsSending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      sendNotification(
        {
          type: form.type,
          priority: form.priority,
          recipientType: form.recipientType,
          title: form.title.trim(),
          message: form.message.trim(),
        },
        user.id,
        user.name,
      );

      toast.success('Notification envoyée avec succès', {
        description: `Message envoyé à ${recipientConfig.count} destinataire${recipientConfig.count > 1 ? 's' : ''}.`,
      });

      setForm({
        type: 'GENERAL_INFO',
        priority: 'normal',
        recipientType: 'all_clients',
        title: '',
        message: '',
      });

      onSuccess?.();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form
      className="w-full space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSend();
      }}
    >
      <div className="rounded-xl border border-ricash-brand/20 bg-gradient-to-br from-ricash-brand/8 via-card to-card p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-ricash-brand/15">
                <Megaphone className="size-4 text-ricash-brand" aria-hidden />
              </span>
              <h2 className="text-base font-semibold text-foreground sm:text-lg">
                Nouvelle notification
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl">
              Saisissez ou recherchez un type, définissez la priorité, puis diffusez votre message
              aux clients, agents ou administrateurs.
            </p>
            <p className="text-xs text-muted-foreground/90 pt-1">
              Type actuel :{' '}
              <span className="font-medium text-foreground">{selectedTypeLabel}</span>
            </p>
          </div>
          <NotificationTypePicker
            value={form.type}
            onChange={(type) => setForm((prev) => ({ ...prev, type }))}
            className="w-full lg:max-w-sm shrink-0"
          />
        </div>
      </div>

      <Card className="w-full shadow-sm border-border/80">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <CardTitle className="text-base font-semibold">Priorité</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <RadioGroup
            value={form.priority}
            onValueChange={(val) =>
              setForm((prev) => ({ ...prev, priority: val as NotificationPriority }))
            }
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full"
          >
            {Object.entries(NOTIFICATION_PRIORITY_LABELS).map(([key, label]) => {
              const cfg = PRIORITY_CONFIG[key as NotificationPriority];
              const selected = form.priority === key;
              return (
                <Label
                  key={key}
                  htmlFor={`priority-${key}`}
                  className={cn(
                    'flex w-full items-center justify-center gap-2.5 rounded-xl border px-4 py-3 cursor-pointer transition-all duration-150',
                    selected
                      ? 'border-ricash-brand bg-ricash-brand/5 shadow-sm ring-1 ring-ricash-brand/20'
                      : 'border-border hover:border-ricash-brand/30 hover:bg-muted/30',
                  )}
                >
                  <RadioGroupItem value={key} id={`priority-${key}`} className="sr-only" />
                  <span className={cn('size-2.5 rounded-full shrink-0', cfg.dotColor)} />
                  <span className="text-sm font-medium">{label}</span>
                </Label>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="w-full shadow-[var(--ricash-shadow-xs)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="size-4 text-[var(--ricash-accent)]" />
            Destinataires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={form.recipientType}
            onValueChange={(val) =>
              setForm((prev) => ({ ...prev, recipientType: val as NotificationRecipientType }))
            }
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full"
          >
            {Object.entries(RECIPIENT_TYPE_LABELS).map(([key, label]) => {
              const cfg = RECIPIENT_CONFIG[key as NotificationRecipientType];
              const Icon = cfg.icon;
              const isSelected = form.recipientType === key;
              return (
                <Label
                  key={key}
                  htmlFor={`recipient-${key}`}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-150 w-full',
                    isSelected
                      ? 'border-[var(--ricash-primary)] bg-[var(--ricash-primary-bg)] shadow-[var(--ricash-shadow-sm)]'
                      : 'border-border hover:border-[var(--ricash-primary-border)] hover:bg-[var(--ricash-primary-bg)]/30',
                  )}
                >
                  <RadioGroupItem value={key} id={`recipient-${key}`} className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon
                        className={cn(
                          'size-4',
                          isSelected ? 'text-[var(--ricash-primary)]' : 'text-muted-foreground',
                        )}
                      />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{cfg.description}</p>
                    <Badge variant="neutral" className="mt-2 text-[10px]">
                      {cfg.count} destinataire{cfg.count > 1 ? 's' : ''}
                    </Badge>
                  </div>
                </Label>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="w-full shadow-[var(--ricash-shadow-xs)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MessageSquare className="size-4 text-[var(--ricash-accent)]" />
            Contenu du message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notif-title" className="text-sm font-medium">
              Titre <span className="text-[var(--ricash-danger)]">*</span>
            </Label>
            <Input
              id="notif-title"
              placeholder="Ex : Maintenance planifiée ce week-end"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full"
              maxLength={100}
            />
            <p className="text-[11px] text-muted-foreground text-right">
              {form.title.length}/100 caractères
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notif-message" className="text-sm font-medium">
              Message <span className="text-[var(--ricash-danger)]">*</span>
            </Label>
            <Textarea
              id="notif-message"
              placeholder="Rédigez votre message ici..."
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              className="w-full min-h-[120px] resize-y"
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <p
                className={cn(
                  'text-[11px]',
                  charCount < 10 ? 'text-[var(--ricash-danger)]' : 'text-muted-foreground',
                )}
              >
                {charCount < 10
                  ? `Minimum 10 caractères (${charCount}/10)`
                  : `${charCount} caractères`}
              </p>
              <p className="text-[11px] text-muted-foreground">{charCount}/500</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSending}
          loading={isSending}
        >
          <Send className="size-4" />
          Envoyer la notification
        </Button>
        {!isFormValid && !isSending && (
          <p className="text-xs text-muted-foreground">
            Complétez le titre et le message pour activer l&apos;envoi.
          </p>
        )}
      </div>
    </form>
  );
}
