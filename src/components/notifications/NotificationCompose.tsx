'use client';

import React, { useState } from 'react';
import {
  Send,
  AlertTriangle,
  Wallet,
  IdCard,
  Info,
  ArrowLeftRight,
  Bell,
  Shield,
  Wrench,
  Eye,
  Users,
  UserCheck,
  ShieldCheck,
  UserSquare,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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

// ─── Type Config ────────────────────────────────────────────

const TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; colorClass: string; bgClass: string }> = {
  FRAUD_ALERT: { icon: AlertTriangle, colorClass: 'text-red-500', bgClass: 'bg-red-50' },
  LOW_FLOAT: { icon: Wallet, colorClass: 'text-orange-500', bgClass: 'bg-orange-50' },
  KYC_EXPIRED: { icon: IdCard, colorClass: 'text-yellow-600', bgClass: 'bg-yellow-50' },
  SYSTEM: { icon: Info, colorClass: 'text-sky-500', bgClass: 'bg-sky-50' },
  TRANSACTION_ALERT: { icon: ArrowLeftRight, colorClass: 'text-[var(--ricash-primary)]', bgClass: 'bg-[var(--ricash-primary-bg)]' },
  GENERAL_INFO: { icon: Bell, colorClass: 'text-violet-500', bgClass: 'bg-violet-50' },
  MAINTENANCE: { icon: Wrench, colorClass: 'text-amber-500', bgClass: 'bg-amber-50' },
  SECURITY: { icon: Shield, colorClass: 'text-red-600', bgClass: 'bg-red-50' },
};

const RECIPIENT_CONFIG: Record<NotificationRecipientType, { icon: React.ElementType; description: string; count: number }> = {
  all_clients: { icon: Users, description: 'Tous les clients enregistrés', count: 30 },
  all_agents: { icon: UserCheck, description: 'Tous les agents actifs', count: 12 },
  all_admins: { icon: ShieldCheck, description: 'Tous les administrateurs', count: 5 },
  specific: { icon: UserSquare, description: 'Sélection manuelle', count: 1 },
};

const PRIORITY_CONFIG: Record<NotificationPriority, { dotColor: string; borderColor: string }> = {
  normal: { dotColor: 'bg-[var(--ricash-success)]', borderColor: 'border-l-[var(--ricash-success)]' },
  high: { dotColor: 'bg-[var(--ricash-warning)]', borderColor: 'border-l-[var(--ricash-warning)]' },
  urgent: { dotColor: 'bg-[var(--ricash-danger)]', borderColor: 'border-l-[var(--ricash-danger)]' },
};

// ─── Component ──────────────────────────────────────────────

export default function NotificationCompose() {
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

  const typeConfig = TYPE_CONFIG[form.type];
  const TypeIcon = typeConfig.icon;
  const recipientConfig = RECIPIENT_CONFIG[form.recipientType];
  const RecipientIcon = recipientConfig.icon;
  const priorityConfig = PRIORITY_CONFIG[form.priority];

  const isFormValid = form.title.trim().length >= 3 && form.message.trim().length >= 10;

  const charCount = form.message.length;

  const handleSend = async () => {
    if (!isFormValid || !user) return;

    setIsSending(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));

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

    setIsSending(false);
    toast.success('Notification envoyée avec succès', {
      description: `Envoyée à ${recipientConfig.count} ${form.recipientType === 'all_clients' ? 'clients' : form.recipientType === 'all_agents' ? 'agents' : 'administrateurs'}`,
    });

    // Reset form
    setForm({
      type: 'GENERAL_INFO',
      priority: 'normal',
      recipientType: 'all_clients',
      title: '',
      message: '',
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* ─── Left: Compose Form ─── */}
      <div className="lg:col-span-3 space-y-5">
        {/* Type & Priority */}
        <Card className="shadow-[var(--ricash-shadow-xs)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="size-4 text-[var(--ricash-accent)]" />
              Type et priorité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Notification Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Type de notification</Label>
              <Select
                value={form.type}
                onValueChange={(val) => setForm(prev => ({ ...prev, type: val as NotificationType }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(NOTIFICATION_TYPE_LABELS).map(([key, label]) => {
                    const cfg = TYPE_CONFIG[key as NotificationType];
                    const Icon = cfg.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className={`size-4 ${cfg.colorClass}`} />
                          <span>{label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Priorité</Label>
              <RadioGroup
                value={form.priority}
                onValueChange={(val) => setForm(prev => ({ ...prev, priority: val as NotificationPriority }))}
                className="flex flex-wrap gap-3"
              >
                {Object.entries(NOTIFICATION_PRIORITY_LABELS).map(([key, label]) => {
                  const cfg = PRIORITY_CONFIG[key as NotificationPriority];
                  return (
                    <Label
                      key={key}
                      htmlFor={`priority-${key}`}
                      className={`
                        flex items-center gap-2.5 px-4 py-2.5 rounded-lg border cursor-pointer
                        transition-all duration-150
                        ${form.priority === key
                          ? 'border-[var(--ricash-primary)] bg-[var(--ricash-primary-bg)] shadow-[var(--ricash-shadow-xs)]'
                          : 'border-border hover:border-[var(--ricash-primary-border)] hover:bg-[var(--ricash-primary-bg)]/50'
                        }
                      `}
                    >
                      <RadioGroupItem value={key} id={`priority-${key}`} />
                      <span className={`size-2 rounded-full ${cfg.dotColor}`} />
                      <span className="text-sm font-medium">{label}</span>
                    </Label>
                  );
                })}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Recipients */}
        <Card className="shadow-[var(--ricash-shadow-xs)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="size-4 text-[var(--ricash-accent)]" />
              Destinataires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={form.recipientType}
              onValueChange={(val) => setForm(prev => ({ ...prev, recipientType: val as NotificationRecipientType }))}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {Object.entries(RECIPIENT_TYPE_LABELS).map(([key, label]) => {
                const cfg = RECIPIENT_CONFIG[key as NotificationRecipientType];
                const Icon = cfg.icon;
                const isSelected = form.recipientType === key;
                return (
                  <Label
                    key={key}
                    htmlFor={`recipient-${key}`}
                    className={`
                      flex items-start gap-3 p-4 rounded-lg border cursor-pointer
                      transition-all duration-150
                      ${isSelected
                        ? 'border-[var(--ricash-primary)] bg-[var(--ricash-primary-bg)] shadow-[var(--ricash-shadow-sm)]'
                        : 'border-border hover:border-[var(--ricash-primary-border)] hover:bg-[var(--ricash-primary-bg)]/30'
                      }
                    `}
                  >
                    <RadioGroupItem value={key} id={`recipient-${key}`} className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Icon className={`size-4 ${isSelected ? 'text-[var(--ricash-primary)]' : 'text-muted-foreground'}`} />
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

        {/* Message Content */}
        <Card className="shadow-[var(--ricash-shadow-xs)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Eye className="size-4 text-[var(--ricash-accent)]" />
              Contenu du message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="notif-title" className="text-sm font-medium">
                Titre <span className="text-[var(--ricash-danger)]">*</span>
              </Label>
              <Input
                id="notif-title"
                placeholder="Ex : Maintenance planifiée ce week-end"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full"
                maxLength={100}
              />
              <p className="text-[11px] text-muted-foreground text-right">{form.title.length}/100 caractères</p>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="notif-message" className="text-sm font-medium">
                Message <span className="text-[var(--ricash-danger)]">*</span>
              </Label>
              <Textarea
                id="notif-message"
                placeholder="Rédigez votre message ici..."
                value={form.message}
                onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                className="w-full min-h-[120px] resize-y"
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <p className={`text-[11px] ${charCount < 10 ? 'text-[var(--ricash-danger)]' : 'text-muted-foreground'}`}>
                  {charCount < 10 ? `Minimum 10 caractères (${charCount}/10)` : `${charCount} caractères`}
                </p>
                <p className="text-[11px] text-muted-foreground">{charCount}/500</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSend}
            disabled={!isFormValid || isSending}
            loading={isSending}
          >
            <Send className="size-4" />
            Envoyer la notification
          </Button>
        </div>
      </div>

      {/* ─── Right: Live Preview ─── */}
      <div className="lg:col-span-2">
        <div className="sticky top-20">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Eye className="size-4 text-[var(--ricash-accent)]" />
            Aperçu en temps réel
          </h3>
          <Card className="shadow-[var(--ricash-shadow-sm)] overflow-hidden">
            <CardContent className="p-0">
              {/* Preview header */}
              <div className="px-4 py-3 bg-[var(--ricash-primary-bg)] border-b border-[var(--ricash-primary-border)]">
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${priorityConfig.dotColor}`} />
                  <span className="text-xs font-semibold text-[var(--ricash-primary)]">
                    {NOTIFICATION_PRIORITY_LABELS[form.priority]}
                  </span>
                  <Separator orientation="vertical" className="h-3" />
                  <span className="text-xs text-muted-foreground">
                    {NOTIFICATION_TYPE_LABELS[form.type]}
                  </span>
                </div>
              </div>

              {/* Preview content */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`flex items-center justify-center size-10 rounded-lg shrink-0 ${typeConfig.bgClass}`}>
                    <TypeIcon className={`size-5 ${typeConfig.colorClass}`} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground truncate">
                        {form.title || 'Titre de la notification'}
                      </h4>
                      <span className="size-2 rounded-full bg-[var(--ricash-accent)] shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                      {form.message || 'Votre message apparaîtra ici...'}
                    </p>
                  </div>
                </div>

                <Separator className="my-3" />

                {/* Meta info */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <RecipientIcon className="size-3.5" />
                    <span>{RECIPIENT_TYPE_LABELS[form.recipientType]}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-[var(--ricash-accent)]" />
                    <span>À l&apos;instant</span>
                  </div>
                </div>

                {user && (
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Envoyé par <span className="font-medium text-foreground">{user.name}</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick stats */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Card className="shadow-[var(--ricash-shadow-xs)]">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-[var(--ricash-primary)]">{recipientConfig.count}</p>
                <p className="text-[11px] text-muted-foreground">Destinataires</p>
              </CardContent>
            </Card>
            <Card className="shadow-[var(--ricash-shadow-xs)]">
              <CardContent className="p-3 text-center">
                <p className={`text-2xl font-bold ${
                  form.priority === 'urgent' ? 'text-[var(--ricash-danger)]' :
                  form.priority === 'high' ? 'text-[var(--ricash-warning)]' :
                  'text-[var(--ricash-success)]'
                }`}>
                  {NOTIFICATION_PRIORITY_LABELS[form.priority]}
                </p>
                <p className="text-[11px] text-muted-foreground">Priorité</p>
              </CardContent>
            </Card>
          </div>

          {/* Tips */}
          <Card className="mt-4 shadow-[var(--ricash-shadow-xs)] border-[var(--ricash-info-border)] bg-[var(--ricash-info-bg)]">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Info className="size-4 text-[var(--ricash-info)] shrink-0 mt-0.5" />
                <div className="text-xs text-[var(--ricash-info)] space-y-1">
                  <p className="font-semibold">Conseils de rédaction</p>
                  <ul className="space-y-0.5 list-disc list-inside opacity-80">
                    <li>Utilisez un titre clair et concis</li>
                    <li>Précisez les actions attendues si nécessaire</li>
                    <li>Réservez la priorité urgente aux alertes critiques</li>
                    <li>Indiquez toujours une date ou délai si applicable</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
