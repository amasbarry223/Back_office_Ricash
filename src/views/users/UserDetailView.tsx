'use client';

import React, { useMemo, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Ban,
  CheckCircle,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  User,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Hash,
  ArrowLeftRight,
  Activity,
  IdCard,
} from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import DataTable from '@/components/common/DataTable';
import RoleGuard from '@/components/common/RoleGuard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { useRouterStore, buildBreadcrumb } from '@/stores/router-store';
import { useUsersStore } from '@/stores/users-store';
import { useTransactionsStore } from '@/stores/transactions-store';
import { useKycStore } from '@/stores/kyc-store';
import { KYC_VERIFIED_LEVEL } from '@/lib/client-ui';
import { toast } from 'sonner';
import {
  COUNTRY_LABELS,
  TRANSACTION_TYPE_LABELS,
  DOCUMENT_TYPE_LABELS,
  type KycLevel,
} from '@/types';
import { formatXOF, formatDate, formatDateTime } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const TAB_META: Record<string, { label: string; description: string }> = {
  info: {
    label: 'Informations personnelles',
    description: 'Identité, coordonnées et statut du compte client',
  },
  wallet: {
    label: 'Portefeuille',
    description: 'Solde disponible et mouvements liés au compte',
  },
  transactions: {
    label: 'Transactions',
    description: 'Historique des opérations effectuées par le client',
  },
  kyc: {
    label: 'KYC',
    description: 'Niveau de vérification et dossiers documentaires',
  },
  activity: {
    label: 'Activité',
    description: 'Connexions et sessions sur l\'application Ricash',
  },
};

function generateLoginHistory() {
  return [
    { id: 1, date: '2025-07-11T07:20:00Z', ip: '41.82.xxx.xxx', device: 'Android / Chrome', location: 'Bamako, ML' },
    { id: 2, date: '2025-07-10T15:30:00Z', ip: '41.82.xxx.xxx', device: 'Android / App Ricash', location: 'Bamako, ML' },
    { id: 3, date: '2025-07-09T09:45:00Z', ip: '196.192.xxx.xxx', device: 'iPhone / Safari', location: 'Bamako, ML' },
    { id: 4, date: '2025-07-08T12:00:00Z', ip: '41.82.xxx.xxx', device: 'Android / Chrome', location: 'Bamako, ML' },
    { id: 5, date: '2025-07-07T18:15:00Z', ip: '154.124.xxx.xxx', device: 'Android / App Ricash', location: 'Ségou, ML' },
  ];
}

const LOGIN_HISTORY = generateLoginHistory();

function StatMini({
  label,
  value,
  sub,
  warning,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  warning?: boolean;
  accent?: boolean;
}) {
  return (
    <div className={cn(
        'rounded-lg border px-3 py-2.5 min-w-0',
        accent && 'border-ricash-brand/30 bg-ricash-brand/5',
        warning && 'border ricash-alert-warning',
        !accent && !warning && 'border-border/60 bg-card',
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div
        className={cn(
          'mt-0.5 text-sm font-semibold truncate',
          accent && 'text-ricash-brand',
          warning && 'text-ricash-warning',
          !accent && !warning && 'text-foreground',
        )}
      >
        {value}
      </div>
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

export default function UserDetailView() {
  const params = useRouterStore((s) => s.params);
  const navigate = useRouterStore((s) => s.navigate);
  const goBack = useRouterStore((s) => s.goBack);
  const clients = useUsersStore((s) => s.clients);
  const updateClientStatus = useUsersStore((s) => s.updateClientStatus);
  const updateClientKyc = useUsersStore((s) => s.updateClientKyc);
  const transactions = useTransactionsStore((s) => s.transactions);
  const kycRecords = useKycStore((s) => s.records);

  const [activeTab, setActiveTab] = useState('info');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    action: 'suspend' | 'activate' | 'forceKyc';
    label: string;
  } | null>(null);

  const clientId = params.id ?? '';
  const client = useMemo(() => clients.find((c) => c.id === clientId), [clients, clientId]);

  const clientTransactions = useMemo(
    () => transactions.filter((t) => t.clientId === clientId),
    [transactions, clientId],
  );

  const clientKycRecords = useMemo(
    () => kycRecords.filter((r) => r.clientId === clientId),
    [kycRecords, clientId],
  );

  const walletMovements = useMemo(
    () =>
      clientTransactions.map((t) => ({
        date: t.createdAt,
        type: t.type === 'DEPOSIT' || t.type === 'REFUND' ? 'CRÉDIT' : 'DÉBIT',
        amount: t.amount,
        description: `${TRANSACTION_TYPE_LABELS[t.type]} — ${t.ref}`,
      })),
    [clientTransactions],
  );

  const txColumns = useMemo(
    () => [
      {
        key: 'ref',
        label: 'Réf',
        width: '160px',
        render: (value: unknown) => (
          <span className="font-mono text-xs">{value as string}</span>
        ),
      },
      {
        key: 'type',
        label: 'Type',
        width: '140px',
        render: (value: unknown) =>
          TRANSACTION_TYPE_LABELS[value as keyof typeof TRANSACTION_TYPE_LABELS] ??
          (value as string),
      },
      {
        key: 'amount',
        label: 'Montant',
        width: '120px',
        render: (value: unknown) => (
          <span className="font-medium tabular-nums">{formatXOF(value as number)}</span>
        ),
      },
      {
        key: 'status',
        label: 'Statut',
        width: '110px',
        render: (value: unknown) => <StatusBadge status={value as string} type="transaction" />,
      },
      {
        key: 'createdAt',
        label: 'Date',
        width: '120px',
        render: (value: unknown) => formatDate(value as string),
      },
    ],
    [],
  );

  const walletColumns = useMemo(
    () => [
      {
        key: 'date',
        label: 'Date',
        width: '120px',
        render: (value: unknown) => formatDate(value as string),
      },
      {
        key: 'type',
        label: 'Type',
        width: '90px',
        render: (value: unknown) => {
          const isCredit = (value as string) === 'CRÉDIT';
          return (
            <Badge variant={isCredit ? 'success' : 'error'} className="text-xs font-medium">
              {isCredit ? (
                <ArrowDownLeft className="size-3 mr-1" />
              ) : (
                <ArrowUpRight className="size-3 mr-1" />
              )}
              {value as string}
            </Badge>
          );
        },
      },
      {
        key: 'amount',
        label: 'Montant',
        width: '120px',
        render: (value: unknown) => (
          <span className="font-medium tabular-nums">{formatXOF(value as number)}</span>
        ),
      },
      { key: 'description', label: 'Description' },
    ],
    [],
  );

  const kycColumns = useMemo(
    () => [
      {
        key: 'documentType',
        label: 'Document',
        width: '180px',
        render: (value: unknown) =>
          DOCUMENT_TYPE_LABELS[value as keyof typeof DOCUMENT_TYPE_LABELS] ??
          (value as string),
      },
      {
        key: 'status',
        label: 'Statut',
        width: '110px',
        render: (value: unknown) => <StatusBadge status={value as string} type="kyc" />,
      },
      {
        key: 'submittedAt',
        label: 'Soumis le',
        width: '120px',
        render: (value: unknown) => formatDate(value as string),
      },
      {
        key: 'verifiedAt',
        label: 'Vérifié le',
        width: '120px',
        render: (value: unknown) => (value ? formatDate(value as string) : '—'),
      },
      {
        key: 'id',
        label: '',
        width: '100px',
        render: (value: unknown) => (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-ricash-brand"
            onClick={() =>
              navigate(
                'kyc-detail',
                { id: value as string },
                buildBreadcrumb([
                  { label: 'Clients', route: 'clients' },
                  {
                    label: client ? `${client.firstName} ${client.lastName}` : 'Client',
                    route: 'client-detail',
                    params: { id: clientId },
                  },
                  { label: 'Détail KYC' },
                ]),
              )
            }
          >
            Voir détail
          </Button>
        ),
      },
    ],
    [client, navigate, clientId],
  );

  const loginColumns = useMemo(
    () => [
      {
        key: 'date',
        label: 'Date / Heure',
        width: '160px',
        render: (value: unknown) => formatDateTime(value as string),
      },
      {
        key: 'ip',
        label: 'IP',
        width: '130px',
        render: (value: unknown) => <span className="font-mono text-xs">{value as string}</span>,
      },
      { key: 'device', label: 'Appareil' },
      { key: 'location', label: 'Localisation', width: '140px' },
    ],
    [],
  );

  const handleToggleStatus = useCallback(() => {
    if (!client) return;
    const isSuspend = client.status === 'ACTIVE';
    setConfirmAction({
      action: isSuspend ? 'suspend' : 'activate',
      label: isSuspend ? 'Suspendre ce client' : 'Activer ce client',
    });
    setConfirmOpen(true);
  }, [client]);

  const handleForceKyc = useCallback(() => {
    setConfirmAction({ action: 'forceKyc', label: 'Forcer le KYC' });
    setConfirmOpen(true);
  }, []);

  const handleConfirmAction = useCallback(() => {
    if (!confirmAction || !client) return;
    if (confirmAction.action === 'suspend') {
      updateClientStatus(client.id, 'SUSPENDED');
      toast.success('Client suspendu', {
        description: `${client.firstName} ${client.lastName} ne peut plus effectuer de transactions.`,
      });
    } else if (confirmAction.action === 'activate') {
      updateClientStatus(client.id, 'ACTIVE');
      toast.success('Client activé', {
        description: `${client.firstName} ${client.lastName} est de nouveau actif.`,
      });
    } else if (confirmAction.action === 'forceKyc') {
      updateClientKyc(client.id, KYC_VERIFIED_LEVEL as KycLevel);
      toast.success('KYC forcé', {
        description: `Niveau KYC fixé au niveau ${KYC_VERIFIED_LEVEL}.`,
      });
    }
    setConfirmOpen(false);
    setConfirmAction(null);
  }, [confirmAction, client, updateClientStatus, updateClientKyc]);

  if (!client) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate('clients')}>
          <ArrowLeft className="size-4 mr-1.5" />
          Retour aux clients
        </Button>
        <EmptyState
          title="Client introuvable"
          description="Ce client n'existe pas ou a été supprimé."
          icon={<User className="size-8 text-muted-foreground" />}
          action={
            <Button variant="outline" size="sm" onClick={() => navigate('clients')}>
              Voir la liste des clients
            </Button>
          }
        />
      </div>
    );
  }

  const fullName = `${client.firstName} ${client.lastName}`;
  const initials = `${client.firstName[0] ?? ''}${client.lastName[0] ?? ''}`.toUpperCase();
  const kycVerified = client.kycLevel >= KYC_VERIFIED_LEVEL;
  const activeTabMeta = TAB_META[activeTab];

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground hover:text-foreground"
        onClick={goBack}
      >
        <ArrowLeft className="size-4 mr-1.5" />
        Retour aux clients
      </Button>

      <PageHeader
        title={fullName}
        subtitle={`${client.id} · ${client.phone}`}
        breadcrumb={[
          { label: 'Tableau de bord', onClick: () => navigate('dashboard') },
          { label: 'Clients', onClick: () => navigate('clients') },
          { label: fullName },
        ]}
      >
        <StatusBadge status={client.status} type="user" />
      </PageHeader>

      {/* Hero */}
      <div className="rounded-xl border border-ricash-brand/20 bg-gradient-to-br from-ricash-brand/8 via-card to-card p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4 min-w-0">
            <div
              className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-ricash-brand/15 text-lg font-bold text-ricash-brand"
              aria-hidden
            >
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">{fullName}</h2>
                <Badge variant="neutral" className="font-mono text-xs">
                  {client.id}
                </Badge>
                <StatusBadge status={client.status} type="user" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5">
                <Phone className="size-3.5 shrink-0" aria-hidden />
                {client.phone}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {COUNTRY_LABELS[client.country] ?? client.country}
                {client.email && ` · ${client.email}`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:max-w-xl shrink-0">
            <StatMini label="Solde" value={formatXOF(client.balance)} accent />
            <StatMini
              label="KYC"
              value={
                <Badge variant={kycVerified ? 'success' : 'warning'} className="text-xs">
                  Niv. {client.kycLevel}
                </Badge>
              }
              warning={!kycVerified}
            />
            <StatMini label="Transactions" value={clientTransactions.length} />
            <StatMini
              label="Dernière connexion"
              value={client.lastLogin ? formatDate(client.lastLogin) : '—'}
              sub={client.lastLogin ? undefined : 'Jamais'}
            />
          </div>
        </div>
      </div>

      {client.status === 'SUSPENDED' && (
        <div className="flex gap-3 rounded-xl border border ricash-alert-warning px-4 py-3">
          <Ban className="size-5 shrink-0 text-ricash-warning mt-0.5" aria-hidden />
          <div>
            <p className="text-sm font-medium text-foreground">
              Compte suspendu
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Ce client ne peut plus effectuer de transactions tant que le compte n&apos;est pas
              réactivé.
            </p>
          </div>
        </div>
      )}

      {!kycVerified && client.status === 'ACTIVE' && (
        <div className="flex gap-3 rounded-xl border border ricash-alert-warning px-4 py-3">
          <IdCard className="size-5 shrink-0 text-ricash-warning mt-0.5" aria-hidden />
          <div>
            <p className="text-sm font-medium text-foreground">
              KYC incomplet
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Le niveau actuel ({client.kycLevel}) est inférieur au seuil requis (niveau{' '}
              {KYC_VERIFIED_LEVEL}). Certaines opérations peuvent être limitées.
            </p>
          </div>
        </div>
      )}

      <RoleGuard roles={['super_admin', 'admin']}>
        <div className="flex flex-wrap gap-2">
          {client.status === 'ACTIVE' ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-[var(--ricash-warning-border)] text-ricash-warning hover:bg-[var(--ricash-warning-bg)]"
              onClick={handleToggleStatus}
            >
              <Ban className="size-4" />
              Suspendre
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-[var(--ricash-success-border)] text-ricash-success hover:bg-[var(--ricash-success-bg)]"
              onClick={handleToggleStatus}
            >
              <CheckCircle className="size-4" />
              Activer
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleForceKyc}>
            <ShieldCheck className="size-4" />
            Forcer KYC
          </Button>
        </div>
      </RoleGuard>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="overflow-x-auto border-b bg-muted/20 px-3 py-2 sm:px-4 ricash-scroll">
            <TabsList className="h-auto min-w-max w-full justify-start gap-1 bg-transparent p-0">
              {(
                [
                  { value: 'info', label: 'Informations', icon: User },
                  { value: 'wallet', label: 'Portefeuille', icon: Wallet },
                  { value: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
                  { value: 'kyc', label: 'KYC', icon: ShieldCheck },
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
                  {value === 'transactions' && clientTransactions.length > 0 && (
                    <Badge variant="neutral" className="h-5 min-w-[20px] px-1.5 text-[10px]">
                      {clientTransactions.length}
                    </Badge>
                  )}
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

        <TabsContent value="info" className="mt-0 focus-visible:outline-none">
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="size-4 text-ricash-brand" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailRow icon={Hash} label="ID client" value={<span className="font-mono">{client.id}</span>} />
                <DetailRow icon={Phone} label="Téléphone" value={client.phone} />
                <DetailRow icon={Mail} label="Email" value={client.email ?? 'Non renseigné'} />
                <DetailRow icon={MapPin} label="Pays" value={COUNTRY_LABELS[client.country] ?? client.country} />
                <DetailRow
                  icon={ShieldCheck}
                  label="Niveau KYC"
                  value={
                    <Badge variant={kycVerified ? 'success' : 'warning'} className="text-xs">
                      Niveau {client.kycLevel}
                    </Badge>
                  }
                />
                <DetailRow
                  icon={CheckCircle}
                  label="Statut"
                  value={<StatusBadge status={client.status} type="user" />}
                />
                <DetailRow icon={Calendar} label="Inscription" value={formatDate(client.createdAt)} />
                <DetailRow
                  icon={Clock}
                  label="Dernière connexion"
                  value={client.lastLogin ? formatDateTime(client.lastLogin) : 'Jamais connecté'}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallet" className="mt-0 space-y-4 focus-visible:outline-none">
          <Card className="shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-xl bg-ricash-accent-bg">
                  <Wallet className="size-7 text-ricash-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Solde actuel</p>
                  <p className="text-2xl sm:text-3xl font-bold text-ricash-brand tabular-nums">
                    {formatXOF(client.balance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/20 pb-3">
              <CardTitle className="text-base font-semibold">
                Mouvements
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({walletMovements.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {walletMovements.length === 0 ? (
                <EmptyState
                  title="Aucun mouvement"
                  description="Les crédits et débits apparaîtront ici."
                  icon={<Wallet className="size-8 text-muted-foreground" />}
                />
              ) : (
                <DataTable
                  columns={walletColumns}
                  data={walletMovements as unknown as Record<string, unknown>[]}
                  emptyMessage="Aucun mouvement sur le portefeuille"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-0 focus-visible:outline-none">
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/20 pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ArrowLeftRight className="size-4 text-ricash-brand" />
                Transactions
                <span className="text-sm font-normal text-muted-foreground">
                  ({clientTransactions.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {clientTransactions.length === 0 ? (
                <EmptyState
                  title="Aucune transaction"
                  description="Ce client n'a pas encore effectué d'opération."
                  icon={<ArrowLeftRight className="size-8 text-muted-foreground" />}
                />
              ) : (
                <DataTable
                  columns={txColumns}
                  data={clientTransactions as unknown as Record<string, unknown>[]}
                  emptyMessage="Aucune transaction pour ce client"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyc" className="mt-0 space-y-4 focus-visible:outline-none">
          <Card className="shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-xl bg-ricash-brand/10">
                  <ShieldCheck className="size-7 text-ricash-brand" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Niveau KYC actuel</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge
                      variant={kycVerified ? 'success' : 'warning'}
                      className="text-base font-semibold px-3 py-1"
                    >
                      Niveau {client.kycLevel}
                    </Badge>
                    <span className="text-xs text-muted-foreground">sur 3 niveaux</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                {[0, 1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      'h-2 flex-1 rounded-full transition-colors',
                      level <= client.kycLevel ? 'bg-ricash-brand' : 'bg-muted',
                    )}
                    aria-hidden
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/20 pb-3">
              <CardTitle className="text-base font-semibold">
                Dossiers KYC
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({clientKycRecords.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {clientKycRecords.length === 0 ? (
                <EmptyState
                  title="Aucun dossier KYC"
                  description="Les soumissions documentaires apparaîtront ici."
                  icon={<IdCard className="size-8 text-muted-foreground" />}
                />
              ) : (
                <DataTable
                  columns={kycColumns}
                  data={clientKycRecords as unknown as Record<string, unknown>[]}
                  emptyMessage="Aucun document KYC"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-0 focus-visible:outline-none">
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/20 pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="size-4 text-ricash-brand" />
                Historique de connexion
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                columns={loginColumns}
                data={LOGIN_HISTORY as unknown as Record<string, unknown>[]}
                emptyMessage="Aucun historique de connexion"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmAction?.label ?? 'Confirmer'}
        description={
          confirmAction?.action === 'suspend'
            ? 'Ce client ne pourra plus effectuer de transactions.'
            : confirmAction?.action === 'forceKyc'
              ? `Le niveau KYC sera forcé au niveau ${KYC_VERIFIED_LEVEL}.`
              : 'Ce client retrouvera l\'accès à ses opérations.'
        }
        confirmLabel={
          confirmAction?.action === 'suspend'
            ? 'Suspendre'
            : confirmAction?.action === 'forceKyc'
              ? 'Forcer KYC'
              : 'Activer'
        }
        variant={confirmAction?.action === 'suspend' ? 'destructive' : 'default'}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
