'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  FileText,
  TrendingUp,
} from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import DataTable from '@/components/common/DataTable';
import { useRouterStore, buildBreadcrumb } from '@/stores/router-store';
import { useAgentsStore } from '@/stores/agents-store';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function formatXOF(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount) + ' XOF';
}

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default function AgentFloatView() {
  const params = useRouterStore((s) => s.params);
  const navigate = useRouterStore((s) => s.navigate);
  const getAgentById = useAgentsStore((s) => s.getAgentById);
  const floatRequestsList = useAgentsStore((s) => s.floatRequests);
  const floatMovementsList = useAgentsStore((s) => s.floatMovements);
  const createFloatRequest = useAgentsStore((s) => s.createFloatRequest);
  const user = useAuthStore((s) => s.user);

  const [amount, setAmount] = useState('');
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const agentId = params.id ?? '';
  const agent = getAgentById(agentId);

  // All useMemo before early return
  const floatRequests = useMemo(
    () => floatRequestsList.filter((r) => r.agentId === agentId),
    [floatRequestsList, agentId]
  );

  const floatMovements = useMemo(
    () => floatMovementsList.filter((m) => m.agentId === agentId),
    [floatMovementsList, agentId]
  );

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

  // Float balance color
  const getFloatColor = (balance: number) => {
    if (balance > 500000) return 'text-emerald-600';
    if (balance >= 200000) return 'text-orange-600';
    return 'text-red-600';
  };

  const getFloatBgColor = (balance: number) => {
    if (balance > 500000) return 'bg-emerald-50 border-emerald-200';
    if (balance >= 200000) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const handleSubmitRequest = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Erreur', {
        description: 'Veuillez entrer un montant valide supérieur à 0.',
      });
      return;
    }
    if (!justification.trim()) {
      toast.error('Erreur', {
        description: 'Veuillez fournir une justification.',
      });
      return;
    }

    setIsSubmitting(true);
    createFloatRequest({
      agentId: agent.id,
      agentCode: agent.code,
      agentName: `${agent.firstName} ${agent.lastName}`,
      amount: numAmount,
      justification: justification.trim(),
      requestedBy: user?.email ?? 'admin@ricash.com',
    });

    // Small delay for UX
    setTimeout(() => {
      setIsSubmitting(false);
      setAmount('');
      setJustification('');
      toast.success('Demande soumise', {
        description: `Votre demande de rechargement de ${formatXOF(numAmount)} a été soumise avec succès.`,
      });
    }, 500);
  };

  // Float request columns
  const requestColumns = [
    {
      key: 'id',
      label: 'N°',
      width: '100px',
      render: (value: unknown) => (
        <span className="font-mono text-xs">{value as string}</span>
      ),
    },
    {
      key: 'amount',
      label: 'Montant',
      width: '130px',
      render: (value: unknown) => (
        <span className="font-medium">{formatXOF(value as number)}</span>
      ),
    },
    {
      key: 'justification',
      label: 'Justification',
    },
    {
      key: 'requestedAt',
      label: 'Date',
      width: '140px',
      render: (value: unknown) => formatDateTime(value as string),
    },
    {
      key: 'status',
      label: 'Statut',
      width: '120px',
      render: (value: unknown) => {
        const statusMap: Record<string, { type: 'agent' | 'kyc' | 'transaction' | 'user'; status: string }> = {
          PENDING: { type: 'kyc', status: 'PENDING' },
          APPROVED: { type: 'agent', status: 'APPROVED' },
          REJECTED: { type: 'kyc', status: 'REJECTED' },
        };
        const mapping = statusMap[value as string];
        if (mapping) {
          return <StatusBadge status={mapping.status} type={mapping.type} />;
        }
        return <span>{value as string}</span>;
      },
    },
    {
      key: 'comment',
      label: 'Commentaire',
      width: '160px',
      render: (value: unknown) => (
        <span className="text-xs text-muted-foreground">
          {(value as string) ?? '—'}
        </span>
      ),
    },
  ];

  // Float movement columns
  const movementColumns = [
    {
      key: 'createdAt',
      label: 'Date',
      width: '140px',
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
      width: '130px',
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
      width: '160px',
      render: (value: unknown) => (
        <span className="text-xs text-muted-foreground">{value as string}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            navigate('agent-detail', { id: agent.id }, buildBreadcrumb([
              { label: 'Agents', route: 'agents' },
              { label: `${agent.firstName} ${agent.lastName}` },
            ]))
          }
        >
          <ArrowLeft className="size-4 mr-1" />
          Retour au profil
        </Button>
      </div>

      {/* Header */}
      <PageHeader title={`Gestion Float — ${agent.firstName} ${agent.lastName}`} subtitle={agent.code} />

      {/* Section 1 — Récapitulatif */}
      <Card className={`border ${getFloatBgColor(agent.floatBalance)}`}>
        <CardContent className="py-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-16 rounded-xl bg-white/80 shadow-sm">
              <Wallet className={`size-8 ${getFloatColor(agent.floatBalance)}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {agent.firstName} {agent.lastName} — {agent.code}
              </p>
              <p className={`text-4xl font-bold ${getFloatColor(agent.floatBalance)}`}>
                {formatXOF(agent.floatBalance)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {agent.floatBalance > 500000
                  ? 'Float confortable'
                  : agent.floatBalance >= 200000
                    ? 'Float à surveiller'
                    : 'Float critique — rechargement recommandé'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2 — Formulaire demande rechargement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Send className="size-5 text-[var(--ricash-primary)]" />
            Demande de rechargement
          </CardTitle>
          <CardDescription>
            Soumettez une demande de rechargement du float de l&apos;agent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (XOF)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="ex: 500000"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="justification">Justification</Label>
              <Textarea
                id="justification"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Décrivez la raison du rechargement…"
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={handleSubmitRequest}
              disabled={isSubmitting || !amount || !justification.trim()}
              className="gap-1.5 bg-[var(--ricash-primary)] hover:bg-[var(--ricash-primary)]/90 text-white"
            >
              <Send className="size-4" />
              {isSubmitting ? 'Soumission en cours…' : 'Soumettre la demande'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section 3 — Historique des demandes */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="size-5 text-[var(--ricash-primary)]" />
          Historique des demandes
        </h2>
        <DataTable
          columns={requestColumns}
          data={floatRequests as unknown as Record<string, unknown>[]}
          emptyMessage="Aucune demande de float"
        />
      </div>

      {/* Section 4 — Historique mouvements */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="size-5 text-[var(--ricash-primary)]" />
          Historique des mouvements
        </h2>
        <DataTable
          columns={movementColumns}
          data={floatMovements as unknown as Record<string, unknown>[]}
          emptyMessage="Aucun mouvement de float"
        />
      </div>
    </div>
  );
}
