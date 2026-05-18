'use client';

import React, { useMemo, useState } from 'react';
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
} from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import DataTable from '@/components/common/DataTable';
import RoleGuard from '@/components/common/RoleGuard';
import { useRouterStore, buildBreadcrumb } from '@/stores/router-store';
import { useAgentsStore } from '@/stores/agents-store';
import { useTransactionsStore } from '@/stores/transactions-store';
import { toast } from 'sonner';
import {
  COUNTRY_LABELS,
  TRANSACTION_TYPE_LABELS,
  type AgentStatus,
} from '@/types';
import { formatXOF, formatDate, formatDateTime } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AgentDetailView() {
  const params = useRouterStore((s) => s.params);
  const navigate = useRouterStore((s) => s.navigate);
  const agents = useAgentsStore((s) => s.agents);
  const updateAgentStatus = useAgentsStore((s) => s.updateAgentStatus);
  const approveAgent = useAgentsStore((s) => s.approveAgent);
  const floatMovementsList = useAgentsStore((s) => s.floatMovements);
  const transactions = useTransactionsStore((s) => s.transactions);

  const [commissionRate, setCommissionRate] = useState('');

  const agentId = params.id ?? '';
  const agent = useMemo(() => agents.find(a => a.id === agentId), [agents, agentId]);

  // All useMemo before early return
  const agentTransactions = useMemo(
    () => transactions.filter((t) => t.agentId === agentId),
    [transactions, agentId]
  );

  const floatMovements = useMemo(
    () => floatMovementsList.filter((m) => m.agentId === agentId),
    [floatMovementsList, agentId]
  );

  // Transaction columns
  const txColumns = useMemo(() => [
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
      render: (value: unknown) => TRANSACTION_TYPE_LABELS[value as keyof typeof TRANSACTION_TYPE_LABELS] ?? (value as string),
    },
    {
      key: 'amount',
      label: 'Montant',
      width: '120px',
      render: (value: unknown) => (
        <span className="font-medium">{formatXOF(value as number)}</span>
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
  ], []);

  // Float movement columns
  const floatColumns = useMemo(() => [
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
          <Badge
            variant="outline"
            className={`text-xs font-medium ${
              isCredit
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {isCredit ? <ArrowDownLeft className="size-3 mr-1" /> : <ArrowUpRight className="size-3 mr-1" />}
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
        <span className="font-medium">{formatXOF(value as number)}</span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
    },
    {
      key: 'createdBy',
      label: 'Créé par',
      width: '140px',
      render: (value: unknown) => (
        <span className="text-xs text-muted-foreground">{value as string}</span>
      ),
    },
  ], []);

  if (!agent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('agents')}>
            <ArrowLeft className="size-4 mr-1" />
            Retour
          </Button>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">Agent introuvable.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSuspend = () => {
    updateAgentStatus(agent.id, 'SUSPENDED');
    toast.success('Agent suspendu', {
      description: `L'agent ${agent.firstName} ${agent.lastName} a été suspendu.`,
    });
  };

  const handleReactivate = () => {
    updateAgentStatus(agent.id, 'APPROVED');
    toast.success('Agent réactivé', {
      description: `L'agent ${agent.firstName} ${agent.lastName} a été réactivé.`,
    });
  };

  const handleApprove = () => {
    const rate = parseFloat(commissionRate);
    if (isNaN(rate) || rate <= 0 || rate > 100) {
      toast.error('Erreur', {
        description: 'Veuillez entrer un taux de commission valide (entre 0.1 et 100).',
      });
      return;
    }
    approveAgent(agent.id, rate);
    toast.success('Agent approuvé', {
      description: `L'agent ${agent.firstName} ${agent.lastName} a été approuvé avec un taux de ${rate}%.`,
    });
    setCommissionRate('');
  };

  // Float balance color
  const getFloatColor = (balance: number) => {
    if (balance > 500000) return 'text-emerald-600';
    if (balance >= 200000) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('agents')}>
          <ArrowLeft className="size-4 mr-1" />
          Retour aux agents
        </Button>
      </div>

      {/* Header */}
      <PageHeader
        title={`${agent.firstName} ${agent.lastName}`}
        subtitle={`${agent.code}`}
      >
        {/* Actions based on status */}
        {agent.status === 'PENDING' && (
          <RoleGuard roles={['super_admin', 'admin']}>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
                <Label htmlFor="commission" className="text-xs whitespace-nowrap">Taux (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  min="0.1"
                  max="100"
                  step="0.1"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  placeholder="ex: 1.5"
                  className="w-20 h-8 text-sm"
                />
              </div>
              <Button
                size="sm"
                onClick={handleApprove}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle className="size-4" />
                Approuver
              </Button>
            </div>
          </RoleGuard>
        )}
        {agent.status === 'APPROVED' && (
          <RoleGuard roles={['super_admin', 'admin']}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSuspend}
              className="gap-1.5 border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <Ban className="size-4" />
              Suspendre
            </Button>
          </RoleGuard>
        )}
        {agent.status === 'SUSPENDED' && (
          <RoleGuard roles={['super_admin', 'admin']}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReactivate}
              className="gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              <RotateCcw className="size-4" />
              Réactiver
            </Button>
          </RoleGuard>
        )}
        <StatusBadge status={agent.status} type="agent" />
      </PageHeader>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="float">Float</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="kyc">KYC</TabsTrigger>
        </TabsList>

        {/* Onglet Profil */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5 text-[var(--ricash-primary)]" />
                Informations de l&apos;agent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Hash className="size-3" /> Code Agent
                  </p>
                  <p className="font-mono text-sm font-medium">{agent.code}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Nom complet</p>
                  <p className="text-sm font-medium">{agent.firstName} {agent.lastName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="size-3" /> Téléphone
                  </p>
                  <p className="text-sm font-medium">{agent.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="size-3" /> Email
                  </p>
                  <p className="text-sm font-medium">{agent.email ?? 'Non renseigné'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-3" /> Pays
                  </p>
                  <p className="text-sm font-medium">{COUNTRY_LABELS[agent.country] ?? agent.country}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Statut</p>
                  <StatusBadge status={agent.status} type="agent" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Percent className="size-3" /> Taux commission
                  </p>
                  <p className="text-sm font-medium">{agent.commissionRate}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="size-3" /> Niveau KYC
                  </p>
                  <Badge variant="outline" className="text-xs font-medium border-[var(--ricash-accent)]/30 bg-[var(--ricash-accent)]/5 text-[var(--ricash-accent)]">
                    Niveau {agent.kycLevel}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3" /> Date inscription
                  </p>
                  <p className="text-sm font-medium">{formatDate(agent.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Float */}
        <TabsContent value="float">
          <div className="space-y-4">
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center size-14 rounded-xl bg-[var(--ricash-accent)]/10">
                      <Wallet className="size-7 text-[var(--ricash-accent)]" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Float actuel</p>
                      <p className={`text-3xl font-bold ${getFloatColor(agent.floatBalance)}`}>
                        {formatXOF(agent.floatBalance)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate('agent-float', { id: agent.id }, buildBreadcrumb([
                        { label: 'Agents', route: 'agents' },
                        { label: `${agent.firstName} ${agent.lastName}`, route: 'agent-detail', params: { id: agent.id } },
                        { label: 'Gestion Float' },
                      ]))
                    }
                    className="gap-1.5"
                  >
                    <Wallet className="size-4" />
                    Gérer le float
                  </Button>
                </div>
              </CardContent>
            </Card>

            <DataTable
              columns={floatColumns}
              data={floatMovements as unknown as Record<string, unknown>[]}
              emptyMessage="Aucun mouvement de float"
            />
          </div>
        </TabsContent>

        {/* Onglet Transactions */}
        <TabsContent value="transactions">
          <DataTable
            columns={txColumns}
            data={agentTransactions as unknown as Record<string, unknown>[]}
            emptyMessage="Aucune transaction pour cet agent"
          />
        </TabsContent>

        {/* Onglet KYC */}
        <TabsContent value="kyc">
          <div className="space-y-4">
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center size-14 rounded-xl bg-[var(--ricash-primary)]/10">
                    <ShieldCheck className="size-7 text-[var(--ricash-primary)]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Niveau KYC actuel</p>
                    <Badge variant="outline" className="text-lg font-semibold px-3 py-1 border-[var(--ricash-accent)]/30 bg-[var(--ricash-accent)]/5 text-[var(--ricash-accent)]">
                      Niveau {agent.kycLevel}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground text-sm">Aucun document KYC disponible pour cet agent.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
