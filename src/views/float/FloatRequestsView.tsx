'use client';

import React, { useState, useMemo } from 'react';
import { CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import PageHeader from '@/components/common/PageHeader';
import RoleGuard from '@/components/common/RoleGuard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useRouterStore, buildBreadcrumb } from '@/stores/router-store';
import { useAuthStore } from '@/stores/auth-store';
import { useAgentsStore } from '@/stores/agents-store';
import type { FloatRequest } from '@/types';
import { formatXOF, formatDateTime } from '@/lib/format';

export default function FloatRequestsView() {
  const navigate = useRouterStore((s) => s.navigate);
  const user = useAuthStore((s) => s.user);
  const floatRequests = useAgentsStore((s) => s.floatRequests);
  const approveFloatRequest = useAgentsStore((s) => s.approveFloatRequest);
  const rejectFloatRequest = useAgentsStore((s) => s.rejectFloatRequest);

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingPage, setPendingPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  // Confirm dialog for approve
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'approve' } | null>(null);

  const pendingCount = useMemo(() => floatRequests.filter(r => r.status === 'PENDING').length, [floatRequests]);

  const pendingRequests = useMemo(
    () => floatRequests.filter((r) => r.status === 'PENDING'),
    [floatRequests]
  );

  const allRequests = useMemo(
    () => [...floatRequests].sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    ),
    [floatRequests]
  );

  const handleApprove = (id: string) => {
    setConfirmAction({ id, action: 'approve' });
    setConfirmOpen(true);
  };

  const handleConfirmApprove = () => {
    if (!confirmAction || !user?.email) return;
    approveFloatRequest(confirmAction.id, user.email);
    toast.success('Demande de float approuvée');
    setConfirmOpen(false);
    setConfirmAction(null);
  };

  const handleReject = (id: string) => {
    if (!user?.email) return;
    if (!rejectComment.trim()) {
      toast.error('Veuillez saisir un commentaire de refus');
      return;
    }
    rejectFloatRequest(id, user.email, rejectComment.trim());
    setRejectingId(null);
    setRejectComment('');
    toast.success('Demande de float rejetée');
  };

  const pendingColumns = useMemo(() => [
    {
      key: 'id',
      label: 'N°',
      sortable: true,
      width: '100px',
    },
    {
      key: 'agentCode',
      label: 'Agent',
      sortable: true,
      render: (_value: unknown, row: Record<string, unknown>) => {
        const req = row as unknown as FloatRequest;
        return (
          <div>
            <p className="font-medium text-sm">{req.agentCode}</p>
            <p className="text-xs text-muted-foreground">{req.agentName}</p>
          </div>
        );
      },
    },
    {
      key: 'amount',
      label: 'Montant demandé (XOF)',
      sortable: true,
      render: (_value: unknown, row: Record<string, unknown>) => {
        const req = row as unknown as FloatRequest;
        return <span className="font-medium text-sm">{formatXOF(req.amount)}</span>;
      },
    },
    {
      key: 'justification',
      label: 'Justification',
      render: (_value: unknown, row: Record<string, unknown>) => {
        const req = row as unknown as FloatRequest;
        return (
          <p className="text-sm text-muted-foreground max-w-xs truncate" title={req.justification}>
            {req.justification}
          </p>
        );
      },
    },
    {
      key: 'requestedAt',
      label: 'Date',
      sortable: true,
      render: (_value: unknown, row: Record<string, unknown>) => {
        const req = row as unknown as FloatRequest;
        return <span className="text-sm">{formatDateTime(req.requestedAt)}</span>;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '260px',
      render: (_value: unknown, row: Record<string, unknown>) => {
        const req = row as unknown as FloatRequest;

        if (rejectingId === req.id) {
          return (
            <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
              <Textarea
                placeholder="Commentaire de refus…"
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                className="min-h-[60px] text-sm"
                autoFocus
              />
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 text-xs"
                  onClick={() => handleReject(req.id)}
                >
                  <XCircle className="size-3.5 mr-1" />
                  Confirmer
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => {
                    setRejectingId(null);
                    setRejectComment('');
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <RoleGuard roles={['super_admin', 'admin']}>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                onClick={() => handleApprove(req.id)}
              >
                <CheckCircle className="size-3.5 mr-1" />
                Approuver
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setRejectingId(req.id)}
              >
                <XCircle className="size-3.5 mr-1" />
                Rejeter
              </Button>
            </RoleGuard>
          </div>
        );
      },
    },
  ], [rejectingId, rejectComment, handleApprove, handleReject]);

  const historyColumns = useMemo(() => [
    {
      key: 'id',
      label: 'N°',
      sortable: true,
      width: '100px',
    },
    {
      key: 'agentCode',
      label: 'Agent',
      sortable: true,
      render: (_value: unknown, row: Record<string, unknown>) => {
        const req = row as unknown as FloatRequest;
        return (
          <div>
            <p className="font-medium text-sm">{req.agentCode}</p>
            <p className="text-xs text-muted-foreground">{req.agentName}</p>
          </div>
        );
      },
    },
    {
      key: 'amount',
      label: 'Montant demandé (XOF)',
      sortable: true,
      render: (_value: unknown, row: Record<string, unknown>) => {
        const req = row as unknown as FloatRequest;
        return <span className="font-medium text-sm">{formatXOF(req.amount)}</span>;
      },
    },
    {
      key: 'justification',
      label: 'Justification',
      render: (_value: unknown, row: Record<string, unknown>) => {
        const req = row as unknown as FloatRequest;
        return (
          <p className="text-sm text-muted-foreground max-w-xs truncate" title={req.justification}>
            {req.justification}
          </p>
        );
      },
    },
    {
      key: 'requestedAt',
      label: 'Date',
      sortable: true,
      render: (_value: unknown, row: Record<string, unknown>) => {
        const req = row as unknown as FloatRequest;
        return <span className="text-sm">{formatDateTime(req.requestedAt)}</span>;
      },
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (_value: unknown, row: Record<string, unknown>) => {
        const req = row as unknown as FloatRequest;
        return <StatusBadge status={req.status} type="float_request" />;
      },
    },
    {
      key: 'comment',
      label: 'Commentaire',
      render: (_value: unknown, row: Record<string, unknown>) => {
        const req = row as unknown as FloatRequest;
        return req.comment ? (
          <div className="flex items-start gap-1.5 max-w-xs">
            <MessageSquare className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground truncate" title={req.comment}>
              {req.comment}
            </p>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
  ], []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Demandes de Float"
        subtitle="Gestion des demandes de recharge float des agents"
        breadcrumb={[
          { label: 'Tableau de bord', onClick: () => navigate('dashboard') },
          { label: 'Demandes de Float' },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5">
            En attente
            {pendingCount > 0 && (
              <Badge variant="warning" className="text-[10px] px-1.5 py-0 h-5 min-w-[20px] flex items-center justify-center">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <DataTable
            columns={pendingColumns}
            data={pendingRequests as unknown as Record<string, unknown>[]}
            emptyMessage="Aucune demande en attente"
            pagination={{
              page: pendingPage,
              perPage: 10,
              total: pendingRequests.length,
            }}
            onPageChange={setPendingPage}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <DataTable
            columns={historyColumns}
            data={allRequests as unknown as Record<string, unknown>[]}
            emptyMessage="Aucune demande de float"
            pagination={{
              page: historyPage,
              perPage: 10,
              total: allRequests.length,
            }}
            onPageChange={setHistoryPage}
          />
        </TabsContent>
      </Tabs>

      {/* Confirmation dialog for approve */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Approuver la demande"
        description="Êtes-vous sûr de vouloir approuver cette demande de float ? Le montant sera crédité au compte de l'agent."
        confirmLabel="Approuver"
        variant="primary"
        onConfirm={handleConfirmApprove}
      />
    </div>
  );
}
