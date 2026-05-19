'use client';

import React, { useMemo, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Ban,
  CheckCircle,
  RotateCcw,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Wallet,
  Percent,
  Hash,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  ArrowLeftRight,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import DataTable from '@/components/common/DataTable';
import RoleGuard from '@/components/common/RoleGuard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { useRouterStore, buildBreadcrumb } from '@/stores/router-store';
import { useAgentsStore } from '@/stores/agents-store';
import { useTransactionsStore } from '@/stores/transactions-store';
import { LOW_FLOAT_THRESHOLD } from '@/lib/agent-ui';
import { toast } from 'sonner';
import {
  AGENT_STATUS_LABELS,
  COUNTRY_LABELS,
  TRANSACTION_TYPE_LABELS,
  type Agent,
} from '@/types';
import { formatXOF, formatDate, formatDateTime } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const TAB_META: Record<string, { label: string; description: string }> = {
  profile: {
    label: 'Profil',
    description: 'Identité, coordonnées et paramètres du compte agent',
  },
  float: {
    label: 'Float',
    description: 'Solde actuel et historique des mouvements de trésorerie',
  },
  transactions: {
    label: 'Transactions',
    description: 'Opérations clients traitées par cet agent',
  },
  kyc: {
    label: 'KYC',
    description: 'Niveau de vérification et documents d\'identité',
  },
};

function StatMini({
  label,
  value,
  sub,
  warning,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  warning?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border px-3 py-2.5 min-w-0',
        warning
          ? 'border ricash-alert-warning'
          : 'border-border/60 bg-card',
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'mt-0.5 text-sm font-semibold truncate',
          warning ? 'text-ricash-warning' : 'text-foreground',
        )}
      >
        {value}
      </p>
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

export default function AgentDetailView() {
  const params = useRouterStore((s) => s.params);
  const navigate = useRouterStore((s) => s.navigate);
  const goBack = useRouterStore((s) => s.goBack);
  const agents = useAgentsStore((s) => s.agents);
  const updateAgentStatus = useAgentsStore((s) => s.updateAgentStatus);
  const approveAgent = useAgentsStore((s) => s.approveAgent);
  const floatMovementsList = useAgentsStore((s) => s.floatMovements);
  const transactions = useTransactionsStore((s) => s.transactions);

  const [activeTab, setActiveTab] = useState('profile');
  const [commissionRate, setCommissionRate] = useState('');
  const [commissionSeedKey, setCommissionSeedKey] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    'suspend' | 'reactivate' | 'approve' | null
  >(null);

  const agentId = params.id ?? '';
  const agent = useMemo(() => agents.find((a) => a.id === agentId), [agents, agentId]);

  const agentTransactions = useMemo(
    () => transactions.filter((t) => t.agentId === agentId),
    [transactions, agentId],
  );

  const floatMovements = useMemo(
    () => floatMovementsList.filter((m) => m.agentId === agentId),
    [floatMovementsList, agentId],
  );

  const commissionSeed = `${agentId}:${agent?.status ?? ''}:${agent?.commissionRate ?? ''}`;
  if (
    commissionSeed !== commissionSeedKey &&
    agent?.status === 'PENDING' &&
    agent.commissionRate > 0
  ) {
    setCommissionSeedKey(commissionSeed);
    setCommissionRate(String(agent.commissionRate));
  }

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

  const floatColumns = useMemo(
    () => [
      {
        key: 'createdAt',
        label: 'Date',
        width: '120px',
        render: (value: unknown) => formatDateTime(value as string),
      },
      {
        key: 'type',
        label: 'Type',
        width: '90px',
        render: (value: unknown) => {
          const isCredit = (value as string) === 'CREDIT';
          return (
            <Badge variant={isCredit ? 'success' : 'error'} className="text-xs font-medium">
              {isCredit ? (
                <ArrowDownLeft className="size-3 mr-1" />
              ) : (
                <ArrowUpRight className="size-3 mr-1" />
              )}
              {isCredit ? 'CRÉDIT' : 'DÉBIT'}
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
      {
        key: 'createdBy',
        label: 'Créé par',
        width: '140px',
        render: (value: unknown) => (
          <span className="text-xs text-muted-foreground">{value as string}</span>
        ),
      },
    ],
    [],
  );

  const handleConfirmAction = useCallback(() => {
    if (!agent || !confirmAction) return;
    if (confirmAction === 'suspend') {
      updateAgentStatus(agent.id, 'SUSPENDED');
      toast.success('Agent suspendu', {
        description: `${agent.firstName} ${agent.lastName} ne peut plus traiter de transactions.`,
      });
    } else if (confirmAction === 'reactivate') {
      updateAgentStatus(agent.id, 'APPROVED');
      toast.success('Agent réactivé', {
        description: `${agent.firstName} ${agent.lastName} est de nouveau opérationnel.`,
      });
    } else if (confirmAction === 'approve') {
      const rate = parseFloat(commissionRate);
      if (isNaN(rate) || rate <= 0 || rate > 100) {
        toast.error('Taux invalide', {
          description: 'Saisissez un taux entre 0,1 % et 100 %.',
        });
        setConfirmOpen(false);
        setConfirmAction(null);
        return;
      }
      approveAgent(agent.id, rate);
      toast.success('Agent approuvé', {
        description: `Taux de commission fixé à ${rate} %.`,
      });
      setCommissionRate('');
    }
    setConfirmOpen(false);
    setConfirmAction(null);
  }, [agent, confirmAction, commissionRate, updateAgentStatus, approveAgent]);

  const navigateToFloat = (a: Agent) => {
    navigate(
      'agent-float',
      { id: a.id },
      buildBreadcrumb([
        { label: 'Agents', route: 'agents' },
        { label: `${a.firstName} ${a.lastName}`, route: 'agent-detail', params: { id: a.id } },
        { label: 'Gestion Float' },
      ]),
    );
  };

  if (!agent) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate('agents')}>
          <ArrowLeft className="size-4 mr-1.5" />
          Retour aux agents
        </Button>
        <EmptyState
          title="Agent introuvable"
          description="Cet agent n'existe pas ou a été supprimé."
          icon={<User className="size-8 text-muted-foreground" />}
          action={
            <Button variant="outline" size="sm" onClick={() => navigate('agents')}>
              Voir la liste des agents
            </Button>
          }
        />
      </div>
    );
  }

  const fullName = `${agent.firstName} ${agent.lastName}`;
  const initials = `${agent.firstName[0] ?? ''}${agent.lastName[0] ?? ''}`.toUpperCase();
  const isLowFloat = agent.floatBalance < LOW_FLOAT_THRESHOLD;
  const activeTabMeta = TAB_META[activeTab];

  const getFloatColor = (balance: number) => {
    if (balance >= 500_000) return 'text-ricash-success';
    if (balance >= LOW_FLOAT_THRESHOLD) return 'text-foreground';
    return 'text-ricash-warning';
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
        Retour aux agents
      </Button>

      <PageHeader
        title={fullName}
        subtitle={`Code agent · ${agent.code}`}
        breadcrumb={[
          { label: 'Tableau de bord', onClick: () => navigate('dashboard') },
          { label: 'Agents', onClick: () => navigate('agents') },
          { label: fullName },
        ]}
      >
        <StatusBadge status={agent.status} type="agent" />
        {agent.status === 'APPROVED' && (
          <Button variant="outline" size="sm" onClick={() => navigateToFloat(agent)} className="gap-1.5">
            <Wallet className="size-4" />
            Gérer le float
          </Button>
        )}
      </PageHeader>

      {/* Hero agent */}
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
                  {agent.code}
                </Badge>
                <StatusBadge status={agent.status} type="agent" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {COUNTRY_LABELS[agent.country] ?? agent.country}
                {agent.email && (
                  <>
                    {' '}
                    · <span className="truncate">{agent.email}</span>
                  </>
                )}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Inscrit le {formatDate(agent.createdAt)}
                {agent.status === 'PENDING' && (
                  <span className="ml-2 inline-flex items-center gap-1 text-ricash-warning">
                    <Clock className="size-3" aria-hidden />
                    {AGENT_STATUS_LABELS.PENDING}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:max-w-xl shrink-0">
            <StatMini
              label="Float"
              value={formatXOF(agent.floatBalance)}
              warning={isLowFloat && agent.status === 'APPROVED'}
              sub={isLowFloat ? 'Seuil bas' : undefined}
            />
            <StatMini label="Commission" value={`${agent.commissionRate} %`} />
            <StatMini label="Tx / mois" value={agent.monthlyTransactions} />
            <StatMini
              label="KYC"
              value={
                <Badge variant="info" className="text-xs">
                  Niveau {agent.kycLevel}
                </Badge>
              }
            />
          </div>
        </div>
      </div>

      {/* Approbation en attente */}
      {agent.status === 'PENDING' && (
        <Card className="border ricash-alert-amber shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <Clock className="size-4" />
              Validation du compte agent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Cet agent est en attente d&apos;approbation. Définissez le taux de commission avant
              d&apos;activer son accès opérationnel.
            </p>
            <RoleGuard roles={['super_admin', 'admin']}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="space-y-2 flex-1 sm:max-w-xs">
                  <Label htmlFor="commission" className="text-sm font-medium">
                    Taux de commission (%) *
                  </Label>
                  <div className="relative">
                    <Percent
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <Input
                      id="commission"
                      type="number"
                      min="0.1"
                      max="100"
                      step="0.1"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(e.target.value)}
                      placeholder="ex. 1,5"
                      className="pl-9"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Entre 0,1 % et 100 %</p>
                </div>
                <Button
                  variant="primary"
                  className="gap-1.5 sm:shrink-0"
                  onClick={() => {
                    const rate = parseFloat(commissionRate);
                    if (isNaN(rate) || rate <= 0 || rate > 100) {
                      toast.error('Taux invalide', {
                        description: 'Saisissez un taux entre 0,1 % et 100 %.',
                      });
                      return;
                    }
                    setConfirmAction('approve');
                    setConfirmOpen(true);
                  }}
                >
                  <CheckCircle className="size-4" />
                  Approuver l&apos;agent
                </Button>
              </div>
            </RoleGuard>
          </CardContent>
        </Card>
      )}

      {/* Actions statut */}
      {agent.status !== 'PENDING' && (
        <RoleGuard roles={['super_admin', 'admin']}>
          <div className="flex flex-wrap gap-2">
            {agent.status === 'APPROVED' && (
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
                Suspendre
              </Button>
            )}
            {agent.status === 'SUSPENDED' && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-[var(--ricash-success-border)] text-ricash-success hover:bg-[var(--ricash-success-bg)]"
                onClick={() => {
                  setConfirmAction('reactivate');
                  setConfirmOpen(true);
                }}
              >
                <RotateCcw className="size-4" />
                Réactiver
              </Button>
            )}
          </div>
        </RoleGuard>
      )}

      {isLowFloat && agent.status === 'APPROVED' && (
        <div className="flex gap-3 rounded-xl border border ricash-alert-warning px-4 py-3">
          <AlertTriangle className="size-5 shrink-0 text-ricash-warning mt-0.5" aria-hidden />
          <div>
            <p className="text-sm font-medium text-foreground">Float insuffisant</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Le solde est inférieur à {formatXOF(LOW_FLOAT_THRESHOLD)}. Envisagez un
              réapprovisionnement via la gestion du float.
            </p>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="overflow-x-auto border-b bg-muted/20 px-3 py-2 sm:px-4 ricash-scroll">
            <TabsList className="h-auto min-w-max w-full justify-start gap-1 bg-transparent p-0">
              {(
                [
                  { value: 'profile', label: 'Profil', icon: User },
                  { value: 'float', label: 'Float', icon: Wallet },
                  { value: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
                  { value: 'kyc', label: 'KYC', icon: ShieldCheck },
                ] as const
              ).map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="gap-2 px-3 py-2 h-auto data-[state=active]:bg-background data-[state=active]:text-ricash-brand data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border/60"
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                  {value === 'transactions' && agentTransactions.length > 0 && (
                    <Badge variant="neutral" className="h-5 min-w-[20px] px-1.5 text-[10px]">
                      {agentTransactions.length}
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

        <TabsContent value="profile" className="mt-0 focus-visible:outline-none">
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="size-4 text-ricash-brand" />
                Informations de l&apos;agent
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailRow icon={Hash} label="Code agent" value={<span className="font-mono">{agent.code}</span>} />
                <DetailRow icon={User} label="Nom complet" value={fullName} />
                <DetailRow icon={Phone} label="Téléphone" value={agent.phone} />
                <DetailRow icon={Mail} label="Email" value={agent.email ?? 'Non renseigné'} />
                <DetailRow icon={MapPin} label="Pays" value={COUNTRY_LABELS[agent.country] ?? agent.country} />
                <DetailRow icon={Percent} label="Commission" value={`${agent.commissionRate} %`} />
                <DetailRow
                  icon={ShieldCheck}
                  label="Niveau KYC"
                  value={
                    <Badge variant="info" className="text-xs">
                      Niveau {agent.kycLevel}
                    </Badge>
                  }
                />
                <DetailRow icon={Calendar} label="Date d'inscription" value={formatDate(agent.createdAt)} />
                <DetailRow
                  icon={CheckCircle}
                  label="Statut"
                  value={<StatusBadge status={agent.status} type="agent" />}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="float" className="mt-0 space-y-4 focus-visible:outline-none">
          <Card className="shadow-sm overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex size-14 items-center justify-center rounded-xl bg-ricash-accent-bg">
                    <Wallet className="size-7 text-ricash-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Float actuel</p>
                    <p className={cn('text-2xl sm:text-3xl font-bold tabular-nums', getFloatColor(agent.floatBalance))}>
                      {formatXOF(agent.floatBalance)}
                    </p>
                    {isLowFloat && (
                      <Badge variant="warning" className="mt-2 text-[10px]">
                        Float bas
                      </Badge>
                    )}
                  </div>
                </div>
                {agent.status === 'APPROVED' && (
                  <Button variant="primary" onClick={() => navigateToFloat(agent)} className="gap-1.5 shrink-0">
                    <Wallet className="size-4" />
                    Gérer le float
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="border-b bg-muted/20 pb-3">
              <CardTitle className="text-base font-semibold">
                Historique des mouvements
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({floatMovements.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {floatMovements.length === 0 ? (
                <EmptyState
                  title="Aucun mouvement"
                  description="Les crédits et débits de float apparaîtront ici."
                  icon={<Wallet className="size-8 text-muted-foreground" />}
                />
              ) : (
                <DataTable
                  columns={floatColumns}
                  data={floatMovements as unknown as Record<string, unknown>[]}
                  emptyMessage="Aucun mouvement de float"
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
                  ({agentTransactions.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {agentTransactions.length === 0 ? (
                <EmptyState
                  title="Aucune transaction"
                  description="Cet agent n'a pas encore traité d'opération."
                  icon={<ArrowLeftRight className="size-8 text-muted-foreground" />}
                />
              ) : (
                <DataTable
                  columns={txColumns}
                  data={agentTransactions as unknown as Record<string, unknown>[]}
                  emptyMessage="Aucune transaction pour cet agent"
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
                    <Badge variant="info" className="text-base font-semibold px-3 py-1">
                      Niveau {agent.kycLevel}
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
                      level <= agent.kycLevel ? 'bg-ricash-brand' : 'bg-muted',
                    )}
                    aria-hidden
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-dashed">
            <CardContent className="py-10">
              <EmptyState
                title="Aucun document KYC"
                description="Les pièces d'identité et justificatifs de l'agent seront affichés ici une fois déposés."
                icon={<FileText className="size-8 text-muted-foreground" />}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={
          confirmAction === 'approve'
            ? 'Approuver cet agent'
            : confirmAction === 'suspend'
              ? 'Suspendre cet agent'
              : 'Réactiver cet agent'
        }
        description={
          confirmAction === 'approve'
            ? `Confirmer l'approbation avec un taux de commission de ${commissionRate} % ?`
            : confirmAction === 'suspend'
              ? 'Cet agent ne pourra plus traiter de transactions tant qu\'il est suspendu.'
              : 'Cet agent retrouvera ses droits opérationnels.'
        }
        confirmLabel={
          confirmAction === 'approve'
            ? 'Approuver'
            : confirmAction === 'suspend'
              ? 'Suspendre'
              : 'Réactiver'
        }
        variant={confirmAction === 'suspend' ? 'destructive' : 'default'}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}

