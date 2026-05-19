'use client';

import React, { useMemo, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Ban,
  CheckCircle,
  Mail,
  Phone,
  Calendar,
  Shield,
  ShieldCheck,
  Hash,
  UserCog,
  KeyRound,
  Clock,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusBadge from '@/components/common/StatusBadge';
import PageHeader from '@/components/common/PageHeader';
import RoleGuard from '@/components/common/RoleGuard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { useRouterStore, buildBreadcrumb } from '@/stores/router-store';
import { useUsersStore } from '@/stores/users-store';
import { ADMIN_ROLE_CAPABILITIES } from '@/lib/admin-ui';
import { formatDate, formatDateTimeLong } from '@/lib/format';
import { cn } from '@/lib/utils';
const TAB_META: Record<string, { label: string; description: string }> = {
  profile: {
    label: 'Profil',
    description: 'Identité, coordonnées et statut du compte administrateur',
  },
  access: {
    label: 'Accès & droits',
    description: 'Périmètre fonctionnel lié au rôle attribué',
  },
  activity: {
    label: 'Activité',
    description: 'Historique de connexion et suivi du compte',
  },
};

function StatMini({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card px-3 py-2.5 min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-0.5 text-sm font-semibold truncate">{value}</div>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/10 p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background border border-border/60">
        <Icon className="size-4 text-muted-foreground" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="mt-0.5 text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

export default function AdminDetailView() {
  const params = useRouterStore((s) => s.params);
  const navigate = useRouterStore((s) => s.navigate);
  const goBack = useRouterStore((s) => s.goBack);
  const admins = useUsersStore((s) => s.admins);
  const updateAdminStatus = useUsersStore((s) => s.updateAdminStatus);

  const [activeTab, setActiveTab] = useState('profile');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'suspend' | 'reactivate' | null>(null);

  const admin = useMemo(() => admins.find((a) => a.id === params.id), [admins, params.id]);

  const handleConfirmAction = useCallback(() => {
    if (!confirmAction || !admin) return;
    if (confirmAction === 'suspend') {
      updateAdminStatus(admin.id, 'SUSPENDED');
      toast.success('Administrateur suspendu', {
        description: `${admin.name} a perdu ses accès au back-office.`,
      });
    } else {
      updateAdminStatus(admin.id, 'ACTIVE');
      toast.success('Administrateur réactivé', {
        description: `${admin.name} peut à nouveau se connecter.`,
      });
    }
    setConfirmOpen(false);
    setConfirmAction(null);
  }, [confirmAction, admin, updateAdminStatus]);

  if (!admin) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate('admins')}>
          <ArrowLeft className="size-4 mr-1.5" />
          Retour à l&apos;administration
        </Button>
        <EmptyState
          title="Administrateur introuvable"
          description="Ce compte n'existe pas ou a été supprimé."
          icon={<UserCog className="size-8 text-muted-foreground" />}
          action={
            <Button variant="outline" size="sm" onClick={() => navigate('admins')}>
              Voir la liste
            </Button>
          }
        />
      </div>
    );
  }

  const roleCaps = ADMIN_ROLE_CAPABILITIES[admin.role];
  const isSuperAdmin = admin.role === 'super_admin';
  const initials = admin.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const activeTabMeta = TAB_META[activeTab];

  const formatLastLogin = (dateStr?: string) => {
    if (!dateStr) return 'Jamais connecté';
    return formatDateTimeLong(dateStr);
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground hover:text-foreground"
        onClick={goBack}
      >
        <ArrowLeft className="size-4 mr-1.5" />
        Retour à l&apos;administration
      </Button>

      <PageHeader
        title={admin.name}
        subtitle={`${isSuperAdmin ? 'Super Admin' : 'Admin'} · ${admin.email}`}
        breadcrumb={[
          { label: 'Tableau de bord', onClick: () => navigate('dashboard') },
          {
            label: 'Administration',
            onClick: () =>
              navigate('admins', {}, buildBreadcrumb([{ label: 'Administration' }])),
          },
          { label: admin.name },
        ]}
      >
        <StatusBadge status={admin.status} type="user" />
      </PageHeader>

      {/* Hero */}
      <div
        className={cn(
          'rounded-xl border p-4 sm:p-6 shadow-sm',
          isSuperAdmin
            ? 'border-ricash-brand/25 bg-gradient-to-br from-ricash-brand/10 via-card to-card'
            : 'border-border/80 bg-gradient-to-br from-muted/30 via-card to-card',
        )}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4 min-w-0">
            <div
              className={cn(
                'flex size-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold',
                isSuperAdmin
                  ? 'bg-ricash-brand/15 text-ricash-brand'
                  : 'bg-muted text-muted-foreground',
              )}
              aria-hidden
            >
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">{admin.name}</h2>
                <Badge variant={isSuperAdmin ? 'brand' : 'neutral'}>
                  {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </Badge>
                <StatusBadge status={admin.status} type="user" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground truncate">{admin.email}</p>
              {admin.phone && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Phone className="size-3" aria-hidden />
                  {admin.phone}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground font-mono">{admin.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full lg:max-w-md shrink-0">
            <StatMini
              label="Rôle"
              value={
                <Badge variant={isSuperAdmin ? 'brand' : 'neutral'} className="text-xs">
                  {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </Badge>
              }
            />
            <StatMini
              label="Statut"
              value={<StatusBadge status={admin.status} type="user" />}
            />
            <StatMini
              label="Dernière connexion"
              value={admin.lastLogin ? formatDate(admin.lastLogin) : '—'}
              sub={admin.lastLogin ? undefined : 'Aucune session'}
            />
          </div>
        </div>
      </div>

      {admin.status === 'SUSPENDED' && (
        <div className="flex gap-3 rounded-xl border border ricash-alert-warning px-4 py-3">
          <Ban className="size-5 shrink-0 text-ricash-warning mt-0.5" aria-hidden />
          <div>
            <p className="text-sm font-medium text-foreground">
              Compte suspendu
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Cet administrateur ne peut plus accéder au back-office tant que le compte n&apos;est
              pas réactivé.
            </p>
          </div>
        </div>
      )}

      <RoleGuard roles={['super_admin']}>
        <div className="flex flex-wrap gap-2">
          {admin.status === 'ACTIVE' && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-[var(--ricash-warning-border)] text-ricash-warning hover:bg-[var(--ricash-warning-bg)]"
              onClick={() => {
                setConfirmAction('suspend');
                setConfirmOpen(true);
              }}
            >
              <Ban className="size-4" />
              Suspendre le compte
            </Button>
          )}
          {(admin.status === 'SUSPENDED' || admin.status === 'INACTIVE') && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-[var(--ricash-success-border)] text-ricash-success hover:bg-[var(--ricash-success-bg)]"
              onClick={() => {
                setConfirmAction('reactivate');
                setConfirmOpen(true);
              }}
            >
              <CheckCircle className="size-4" />
              {admin.status === 'INACTIVE' ? 'Activer le compte' : 'Réactiver le compte'}
            </Button>
          )}
        </div>
      </RoleGuard>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="overflow-x-auto border-b bg-muted/20 px-3 py-2 sm:px-4 ricash-scroll">
            <TabsList className="h-auto min-w-max w-full justify-start gap-1 bg-transparent p-0">
              {(
                [
                  { value: 'profile', label: 'Profil', icon: UserCog },
                  { value: 'access', label: 'Accès & droits', icon: KeyRound },
                  { value: 'activity', label: 'Activité', icon: Activity },
                ] as const
              ).map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="gap-2 px-3 py-2 h-auto data-[state=active]:bg-background data-[state=active]:text-ricash-brand data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border/60"
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {activeTabMeta && (
            <div className="border-b bg-muted/10 px-4 py-3">
              <p className="text-sm font-medium text-foreground">{activeTabMeta.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{activeTabMeta.description}</p>
            </div>
          )}
        </div>

        <TabsContent value="profile" className="mt-0 focus-visible:outline-none">
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <UserCog className="size-4 text-ricash-brand" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailRow icon={Hash} label="Identifiant" value={<span className="font-mono">{admin.id}</span>} />
                <DetailRow icon={Mail} label="Email" value={admin.email} />
                <DetailRow icon={Phone} label="Téléphone" value={admin.phone ?? 'Non renseigné'} />
                <DetailRow
                  icon={Shield}
                  label="Rôle"
                  value={
                    <Badge variant={isSuperAdmin ? 'brand' : 'neutral'}>
                      {isSuperAdmin ? 'Super Admin' : 'Admin'}
                    </Badge>
                  }
                />
                <DetailRow
                  icon={CheckCircle}
                  label="Statut du compte"
                  value={<StatusBadge status={admin.status} type="user" />}
                />
                <DetailRow icon={Calendar} label="Compte créé le" value={formatDate(admin.createdAt)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="mt-0 focus-visible:outline-none">
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                {isSuperAdmin ? (
                  <ShieldCheck className="size-4 text-ricash-brand" />
                ) : (
                  <Shield className="size-4 text-muted-foreground" />
                )}
                {roleCaps.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <p className="text-sm text-muted-foreground">{roleCaps.description}</p>
              <ul className="space-y-2">
                {roleCaps.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-foreground rounded-lg border border-border/60 bg-muted/10 px-3 py-2"
                  >
                    <CheckCircle className="size-4 shrink-0 text-ricash-brand mt-0.5" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              {isSuperAdmin && (
                <div className="flex gap-3 rounded-lg border border ricash-alert-warning px-3 py-2.5">
                  <Shield className="size-4 shrink-0 text-ricash-warning mt-0.5" aria-hidden />
                  <p className="text-xs text-muted-foreground">
                    Les Super Admin peuvent gérer les autres comptes administrateurs et accéder aux
                    paramètres système sensibles.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-0 space-y-4 focus-visible:outline-none">
          <Card className="shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                  <Clock className="size-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dernière connexion</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {formatLastLogin(admin.lastLogin)}
                  </p>
                  {admin.lastLogin && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Compte actif depuis le {formatDate(admin.createdAt)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-dashed">
            <CardContent className="py-10">
              <EmptyState
                title="Journal d'audit à venir"
                description="L'historique des actions et connexions sera disponible dans une prochaine version."
                icon={<Activity className="size-8 text-muted-foreground" />}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={
          confirmAction === 'suspend'
            ? 'Suspendre cet administrateur'
            : 'Réactiver cet administrateur'
        }
        description={
          confirmAction === 'suspend'
            ? `${admin.name} perdra immédiatement ses accès au back-office.`
            : `${admin.name} pourra à nouveau se connecter et exercer ses droits.`
        }
        confirmLabel={confirmAction === 'suspend' ? 'Suspendre' : 'Réactiver'}
        variant={confirmAction === 'suspend' ? 'destructive' : 'default'}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
