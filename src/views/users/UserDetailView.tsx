'use client';

import React, { useMemo } from 'react';
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
} from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import DataTable from '@/components/common/DataTable';
import RoleGuard from '@/components/common/RoleGuard';
import { useRouterStore, buildBreadcrumb } from '@/stores/router-store';
import { useUsersStore } from '@/stores/users-store';
import { useTransactionsStore } from '@/stores/transactions-store';
import { useKycStore } from '@/stores/kyc-store';
import { toast } from 'sonner';
import {
  COUNTRY_LABELS,
  TRANSACTION_TYPE_LABELS,
  DOCUMENT_TYPE_LABELS,
  type UserStatus,
  type KycLevel,
} from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

function formatXOF(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount) + ' XOF';
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
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

// Mock login history generator
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

export default function UserDetailView() {
  const params = useRouterStore((s) => s.params);
  const navigate = useRouterStore((s) => s.navigate);
  const getClientById = useUsersStore((s) => s.getClientById);
  const updateClientStatus = useUsersStore((s) => s.updateClientStatus);
  const updateClientKyc = useUsersStore((s) => s.updateClientKyc);
  const transactions = useTransactionsStore((s) => s.transactions);
  const kycRecords = useKycStore((s) => s.records);

  const clientId = params.id ?? '';
  const client = getClientById(clientId);

  // All useMemo before the early return
  const clientTransactions = useMemo(
    () => transactions.filter((t) => t.clientId === clientId),
    [transactions, clientId]
  );

  const clientKycRecords = useMemo(
    () => kycRecords.filter((r) => r.clientId === clientId),
    [kycRecords, clientId]
  );

  const walletMovements = useMemo(
    () =>
      clientTransactions.map((t) => ({
        date: t.createdAt,
        type: t.type === 'DEPOSIT' || t.type === 'REFUND' ? 'CRÉDIT' : 'DÉBIT',
        amount: t.amount,
        description: `${TRANSACTION_TYPE_LABELS[t.type]} — ${t.ref}`,
      })),
    [clientTransactions]
  );

  if (!client) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('clients')}>
            <ArrowLeft className="size-4 mr-1" />
            Retour
          </Button>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">Client introuvable.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleToggleStatus = () => {
    const newStatus: UserStatus = client.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    updateClientStatus(client.id, newStatus);
    toast.success(newStatus === 'SUSPENDED' ? 'Client suspendu' : 'Client activé', {
      description: 'Le statut a été mis à jour avec succès.',
    });
  };

  const handleForceKyc = () => {
    updateClientKyc(client.id, 2 as KycLevel);
    toast.success('KYC forcé', {
      description: 'Le niveau KYC du client a été forcé à Niveau 2.',
    });
  };

  // Transaction columns
  const txColumns = [
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
  ];

  const walletColumns = [
    {
      key: 'date',
      label: 'Date',
      width: '120px',
      render: (value: unknown) => formatDate(value as string),
    },
    {
      key: 'type',
      label: 'Type',
      width: '80px',
      render: (value: unknown) => {
        const isCredit = (value as string) === 'CRÉDIT';
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
        <span className="font-medium">{formatXOF(value as number)}</span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
    },
  ];

  // KYC columns
  const kycColumns = [
    {
      key: 'documentType',
      label: 'Type de document',
      width: '180px',
      render: (value: unknown) => DOCUMENT_TYPE_LABELS[value as keyof typeof DOCUMENT_TYPE_LABELS] ?? (value as string),
    },
    {
      key: 'status',
      label: 'Statut',
      width: '110px',
      render: (value: unknown) => <StatusBadge status={value as string} type="kyc" />,
    },
    {
      key: 'submittedAt',
      label: 'Date soumission',
      width: '120px',
      render: (value: unknown) => formatDate(value as string),
    },
    {
      key: 'verifiedAt',
      label: 'Date vérification',
      width: '120px',
      render: (value: unknown) => value ? formatDate(value as string) : '—',
    },
    {
      key: 'id',
      label: 'Action',
      width: '100px',
      render: (value: unknown) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-[var(--ricash-accent)] hover:text-[var(--ricash-accent)]/80"
          onClick={() =>
            navigate('kyc-detail', { id: value as string }, buildBreadcrumb([
              { label: 'Clients', route: 'clients' },
              { label: `${client.firstName} ${client.lastName}`, route: 'client-detail', params: { id: client.id } },
              { label: 'KYC' },
            ]))
          }
        >
          Voir détail
        </Button>
      ),
    },
  ];

  // Login history columns
  const loginColumns = [
    {
      key: 'date',
      label: 'Date / Heure',
      width: '160px',
      render: (value: unknown) => formatDateTime(value as string),
    },
    {
      key: 'ip',
      label: 'Adresse IP',
      width: '130px',
      render: (value: unknown) => <span className="font-mono text-xs">{value as string}</span>,
    },
    {
      key: 'device',
      label: 'Appareil',
    },
    {
      key: 'location',
      label: 'Localisation',
      width: '140px',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('clients')}>
          <ArrowLeft className="size-4 mr-1" />
          Retour aux clients
        </Button>
      </div>

      {/* Header */}
      <PageHeader
        title={`${client.firstName} ${client.lastName}`}
        subtitle={`${client.id} — ${client.phone}`}
      >
        <RoleGuard roles={['super_admin', 'admin']}>
          {client.status === 'ACTIVE' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleStatus}
              className="gap-1.5 border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <Ban className="size-4" />
              Suspendre
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleStatus}
              className="gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              <CheckCircle className="size-4" />
              Activer
            </Button>
          )}
        </RoleGuard>
        <RoleGuard roles={['super_admin', 'admin']}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleForceKyc}
            className="gap-1.5"
          >
            <ShieldCheck className="size-4" />
            Forcer KYC
          </Button>
        </RoleGuard>
        <StatusBadge status={client.status} type="user" />
      </PageHeader>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="info">Informations personnelles</TabsTrigger>
          <TabsTrigger value="wallet">Portefeuille</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="kyc">KYC</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
        </TabsList>

        {/* Onglet Informations personnelles */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5 text-[var(--ricash-primary)]" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">ID Client</p>
                  <p className="font-mono text-sm font-medium">{client.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="size-3" /> Téléphone
                  </p>
                  <p className="text-sm font-medium">{client.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="size-3" /> Email
                  </p>
                  <p className="text-sm font-medium">{client.email ?? 'Non renseigné'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-3" /> Pays
                  </p>
                  <p className="text-sm font-medium">{COUNTRY_LABELS[client.country] ?? client.country}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Statut</p>
                  <StatusBadge status={client.status} type="user" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="size-3" /> Niveau KYC
                  </p>
                  <Badge variant="outline" className="text-xs font-medium border-[var(--ricash-accent)]/30 bg-[var(--ricash-accent)]/5 text-[var(--ricash-accent)]">
                    Niveau {client.kycLevel}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3" /> Date inscription
                  </p>
                  <p className="text-sm font-medium">{formatDate(client.createdAt)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" /> Dernier login
                  </p>
                  <p className="text-sm font-medium">
                    {client.lastLogin ? formatDateTime(client.lastLogin) : 'Jamais connecté'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Portefeuille */}
        <TabsContent value="wallet">
          <div className="space-y-4">
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center size-14 rounded-xl bg-[var(--ricash-accent)]/10">
                    <Wallet className="size-7 text-[var(--ricash-accent)]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Solde actuel</p>
                    <p className="text-3xl font-bold text-[var(--ricash-primary)]">
                      {formatXOF(client.balance)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <DataTable
              columns={walletColumns}
              data={walletMovements as unknown as Record<string, unknown>[]}
              emptyMessage="Aucun mouvement sur le portefeuille"
            />
          </div>
        </TabsContent>

        {/* Onglet Transactions */}
        <TabsContent value="transactions">
          <DataTable
            columns={txColumns}
            data={clientTransactions as unknown as Record<string, unknown>[]}
            emptyMessage="Aucune transaction pour ce client"
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
                      Niveau {client.kycLevel}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {clientKycRecords.length > 0 && (
              <DataTable
                columns={kycColumns}
                data={clientKycRecords as unknown as Record<string, unknown>[]}
                emptyMessage="Aucun document KYC"
              />
            )}
          </div>
        </TabsContent>

        {/* Onglet Activité */}
        <TabsContent value="activity">
          <DataTable
            columns={loginColumns}
            data={LOGIN_HISTORY as unknown as Record<string, unknown>[]}
            emptyMessage="Aucun historique de connexion"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
