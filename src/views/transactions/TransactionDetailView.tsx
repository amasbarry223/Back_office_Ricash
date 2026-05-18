'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRightLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  Store,
  RotateCcw,
  User,
  Briefcase,
  XCircle,
  CheckCircle2,
  Calendar,
  Hash,
  Radio,
  Smartphone,
  Building2,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import StatusBadge from '@/components/common/StatusBadge';
import RoleGuard from '@/components/common/RoleGuard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import PageHeader from '@/components/common/PageHeader';
import { useRouterStore, buildBreadcrumb } from '@/stores/router-store';
import { useAuthStore } from '@/stores/auth-store';
import { useTransactionsStore } from '@/stores/transactions-store';
import {
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_STATUS_LABELS,
  CHANNEL_LABELS,
  OPERATOR_LABELS,
  type TransactionType,
  type TransactionStatus,
  type Channel,
  type Operator,
} from '@/types';
import { formatXOF, formatDateTimeLong } from '@/lib/format';
import { toast } from 'sonner';

// Transaction type icon mapping
const TYPE_ICONS: Record<TransactionType, React.ReactNode> = {
  DEPOSIT: <ArrowDownToLine className="size-5" />,
  WITHDRAWAL: <ArrowUpFromLine className="size-5" />,
  TRANSFER: <ArrowRightLeft className="size-5" />,
  MERCHANT_PAYMENT: <Store className="size-5" />,
  REFUND: <RotateCcw className="size-5" />,
};

// Transaction type color mapping
const TYPE_COLORS: Record<TransactionType, string> = {
  DEPOSIT: 'text-emerald-600 bg-emerald-50',
  WITHDRAWAL: 'text-orange-600 bg-orange-50',
  TRANSFER: 'text-sky-600 bg-sky-50',
  MERCHANT_PAYMENT: 'text-violet-600 bg-violet-50',
  REFUND: 'text-rose-600 bg-rose-50',
};

// Channel icon mapping
const CHANNEL_ICONS: Record<Channel, React.ReactNode> = {
  APP_MOBILE: <Smartphone className="size-4" />,
  USSD: <Hash className="size-4" />,
  WEB: <Building2 className="size-4" />,
  AGENT: <UserCheck className="size-4" />,
};

export default function TransactionDetailView() {
  const params = useRouterStore((s) => s.params);
  const navigate = useRouterStore((s) => s.navigate);
  const goBack = useRouterStore((s) => s.goBack);
  const transactions = useTransactionsStore((s) => s.transactions);
  const updateTransactionStatus = useTransactionsStore((s) => s.updateTransactionStatus);
  const user = useAuthStore((s) => s.user);

  const [isCancelling, setIsCancelling] = useState(false);
  const [isMarkingSuccess, setIsMarkingSuccess] = useState(false);
  const [isMarkingFailed, setIsMarkingFailed] = useState(false);

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ action: 'cancel' | 'markSuccess' | 'markFailed'; label: string } | null>(null);

  const transaction = useMemo(() => {
    const id = params.id;
    return id ? transactions.find(t => t.id === id) : undefined;
  }, [params.id, transactions]);

  if (!transaction) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground text-lg">Transaction introuvable</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('transactions')}>
          <ArrowLeft className="size-4 mr-2" />
          Retour aux transactions
        </Button>
      </div>
    );
  }

  // Calculate net amount
  const netAmount =
    transaction.type === 'WITHDRAWAL'
      ? transaction.amount + transaction.fees
      : transaction.amount - transaction.fees;

  const typeIcon = TYPE_ICONS[transaction.type];
  const typeColor = TYPE_COLORS[transaction.type];
  const channelIcon = CHANNEL_ICONS[transaction.channel];

  // Action handlers
  const handleCancel = () => {
    setConfirmAction({ action: 'cancel', label: 'Annuler la transaction' });
    setConfirmOpen(true);
  };

  const handleMarkSuccess = () => {
    setConfirmAction({ action: 'markSuccess', label: 'Marquer comme réussie' });
    setConfirmOpen(true);
  };

  const handleMarkFailed = () => {
    setConfirmAction({ action: 'markFailed', label: 'Marquer comme échouée' });
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    if (confirmAction.action === 'cancel') {
      setIsCancelling(true);
      try {
        await new Promise((r) => setTimeout(r, 500));
        updateTransactionStatus(transaction.id, 'CANCELLED');
        toast.success('Transaction annulée avec succès');
      } finally {
        setIsCancelling(false);
      }
    } else if (confirmAction.action === 'markSuccess') {
      setIsMarkingSuccess(true);
      try {
        await new Promise((r) => setTimeout(r, 500));
        updateTransactionStatus(transaction.id, 'SUCCESS');
        toast.success('Transaction marquée comme réussie');
      } finally {
        setIsMarkingSuccess(false);
      }
    } else {
      setIsMarkingFailed(true);
      try {
        await new Promise((r) => setTimeout(r, 500));
        updateTransactionStatus(transaction.id, 'FAILED');
        toast.success('Transaction marquée comme échouée');
      } finally {
        setIsMarkingFailed(false);
      }
    }
    setConfirmOpen(false);
    setConfirmAction(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Transaction ${transaction.ref}`}
        breadcrumb={[
          { label: 'Transactions', onClick: () => navigate('transactions', {}, buildBreadcrumb([{ label: 'Transactions' }])) },
          { label: transaction.ref },
        ]}
      >
        <Button variant="outline" size="sm" onClick={goBack} className="gap-1.5">
          <ArrowLeft className="size-4" />
          Retour
        </Button>
      </PageHeader>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column — 60% */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="ricash-card-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Détails de la transaction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Reference */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Référence</p>
                <p className="text-xl font-bold font-mono text-ricash-brand">{transaction.ref}</p>
              </div>

              {/* Type + Status row */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`flex items-center justify-center size-9 rounded-lg ${typeColor}`}>
                    {typeIcon}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="font-medium text-sm">{TRANSACTION_TYPE_LABELS[transaction.type]}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Statut</p>
                  <StatusBadge status={transaction.status} type="transaction" />
                </div>
              </div>

              <Separator />

              {/* Amounts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Montant</p>
                  <p className="text-lg font-bold text-foreground">{formatXOF(transaction.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Frais</p>
                  <p className="text-lg font-semibold text-muted-foreground">{formatXOF(transaction.fees)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Montant net</p>
                  <p className="text-lg font-bold text-ricash-accent">{formatXOF(netAmount)}</p>
                </div>
              </div>

              <Separator />

              {/* Channel + Operator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center size-8 rounded-md bg-muted">
                    {channelIcon}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Canal</p>
                    <p className="text-sm font-medium">{CHANNEL_LABELS[transaction.channel]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center size-8 rounded-md bg-muted">
                    <Radio className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Opérateur</p>
                    <p className="text-sm font-medium">{OPERATOR_LABELS[transaction.operator]}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {transaction.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{transaction.description}</p>
                  </div>
                </>
              )}

              <Separator />

              {/* Date */}
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Date/Heure de création</p>
                  <p className="text-sm font-medium">{formatDateTimeLong(transaction.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column — 40% */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Card */}
          <Card className="ricash-card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="size-4 text-ricash-brand" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Nom</p>
                <p className="text-sm font-medium">{transaction.clientName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Téléphone</p>
                <p className="text-sm font-medium">{transaction.clientPhone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ID</p>
                <p className="text-sm font-mono text-muted-foreground">{transaction.clientId}</p>
              </div>
              <Button
                variant="link"
                size="sm"
                className="text-ricash-brand p-0 h-auto text-xs"
                onClick={() =>
                  navigate('client-detail', { id: transaction.clientId }, buildBreadcrumb([
                    { label: 'Transactions', route: 'transactions' },
                    { label: transaction.ref },
                    { label: `Client ${transaction.clientName}` },
                  ]))
                }
              >
                Voir la fiche client →
              </Button>
            </CardContent>
          </Card>

          {/* Agent Card (if applicable) */}
          {transaction.agentId && transaction.agentCode && (
            <Card className="ricash-card-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="size-4 text-ricash-accent" />
                  Agent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Code</p>
                  <p className="text-sm font-mono font-semibold text-ricash-accent">
                    {transaction.agentCode}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ID</p>
                  <p className="text-sm font-mono text-muted-foreground">{transaction.agentId}</p>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="text-ricash-accent p-0 h-auto text-xs"
                  onClick={() =>
                    navigate('agent-detail', { id: transaction.agentId! }, buildBreadcrumb([
                      { label: 'Transactions', route: 'transactions' },
                      { label: transaction.ref },
                      { label: `Agent ${transaction.agentCode}` },
                    ]))
                  }
                >
                  Voir la fiche agent →
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Operations Card */}
          {(transaction.status === 'PENDING' || transaction.status === 'IN_PROGRESS') && (
            <Card className="ricash-card-shadow border-l-4 border-l-orange-400">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="size-4 text-orange-500" />
                  Opérations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {transaction.status === 'PENDING' && (
                  <RoleGuard roles={['super_admin', 'admin']}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={handleCancel}
                      disabled={isCancelling}
                    >
                      {isCancelling ? (
                        <div className="size-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <XCircle className="size-4" />
                      )}
                      Annuler la transaction
                    </Button>
                  </RoleGuard>
                )}
                {transaction.status === 'IN_PROGRESS' && (
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={handleMarkSuccess}
                      disabled={isMarkingSuccess}
                    >
                      {isMarkingSuccess ? (
                        <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      Marquer comme réussi
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={handleMarkFailed}
                      disabled={isMarkingFailed}
                    >
                      {isMarkingFailed ? (
                        <div className="size-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <XCircle className="size-4" />
                      )}
                      Marquer comme échoué
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmAction?.label ?? 'Confirmer'}
        description={
          confirmAction?.action === 'cancel'
            ? 'Êtes-vous sûr de vouloir annuler cette transaction ? Cette action est irréversible.'
            : confirmAction?.action === 'markFailed'
              ? 'Êtes-vous sûr de vouloir marquer cette transaction comme échouée ? Cette action est irréversible.'
              : 'Êtes-vous sûr de vouloir marquer cette transaction comme réussie ?'
        }
        confirmLabel={
          confirmAction?.action === 'cancel' ? 'Annuler' : confirmAction?.action === 'markFailed' ? 'Marquer échouée' : 'Marquer réussie'
        }
        variant={confirmAction?.action === 'cancel' || confirmAction?.action === 'markFailed' ? 'destructive' : 'primary'}
        onConfirm={handleConfirmAction}
        loading={isCancelling || isMarkingSuccess || isMarkingFailed}
      />
    </div>
  );
}
