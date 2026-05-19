'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Eye,
  Ban,
  CheckCircle,
  Search,
  Shield,
  ShieldCheck,
  UserCog,
  Users,
  Download,
  MoreHorizontal,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import PageHeader from '@/components/common/PageHeader';
import RoleGuard from '@/components/common/RoleGuard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { useRouterStore, buildBreadcrumb } from '@/stores/router-store';
import { useUsersStore } from '@/stores/users-store';
import {
  computeAdminStats,
  filterAdmins,
  type AdminQuickFilter,
} from '@/lib/admin-ui';
import { type Role, type Admin } from '@/types';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { DEFAULT_TABLE_PER_PAGE } from '@/lib/pagination';
import { useTablePagination } from '@/hooks/use-table-pagination';

const PER_PAGE = DEFAULT_TABLE_PER_PAGE;

const QUICK_FILTERS: { id: AdminQuickFilter; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'Tous', icon: Users },
  { id: 'active', label: 'Actifs', icon: CheckCircle },
  { id: 'suspended', label: 'Suspendus', icon: Ban },
  { id: 'super_admin', label: 'Super Admin', icon: ShieldCheck },
  { id: 'admin', label: 'Admin', icon: UserCog },
];

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-colors',
        accent
          ? 'border-ricash-brand/30 bg-gradient-to-br from-ricash-brand/10 to-background'
          : 'border-border/60 bg-card',
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1 text-2xl font-bold tabular-nums',
          accent ? 'text-ricash-brand' : 'text-foreground',
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function AdminsView() {
  const navigate = useRouterStore((s) => s.navigate);
  const admins = useUsersStore((s) => s.admins);
  const updateAdminStatus = useUsersStore((s) => s.updateAdminStatus);
  const createAdmin = useUsersStore((s) => s.createAdmin);

  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<AdminQuickFilter>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    action: 'suspend' | 'reactivate';
    label: string;
  } | null>(null);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<Role>('admin');

  const stats = useMemo(() => computeAdminStats(admins), [admins]);

  const filteredAdmins = useMemo(
    () => filterAdmins(admins, searchQuery, quickFilter),
    [admins, searchQuery, quickFilter],
  );

  const {
    paginatedItems: paginatedAdmins,
    pagination,
    onPageChange,
    resetPage,
  } = useTablePagination(filteredAdmins, PER_PAGE);

  const filterCounts = useMemo(
    () => ({
      all: admins.length,
      active: admins.filter((a) => a.status === 'ACTIVE').length,
      suspended: admins.filter((a) => a.status === 'SUSPENDED').length,
      super_admin: admins.filter((a) => a.role === 'super_admin').length,
      admin: admins.filter((a) => a.role === 'admin').length,
    }),
    [admins],
  );

  const handleQuickFilter = (id: AdminQuickFilter) => {
    setQuickFilter(id);
    resetPage();
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    resetPage();
  };

  const resetForm = () => {
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewRole('admin');
  };

  const handleCreateAdmin = () => {
    if (!newName.trim() || !newEmail.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    createAdmin({
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim() || undefined,
      role: newRole,
      status: 'ACTIVE',
      lastLogin: undefined,
    });

    toast.success('Administrateur créé avec succès');
    setShowCreateDialog(false);
    resetForm();
  };

  const handleToggleStatus = useCallback((admin: Admin) => {
    if (admin.status === 'ACTIVE') {
      setConfirmAction({
        id: admin.id,
        action: 'suspend',
        label: 'Suspendre cet administrateur',
      });
    } else if (admin.status === 'SUSPENDED') {
      setConfirmAction({
        id: admin.id,
        action: 'reactivate',
        label: 'Réactiver cet administrateur',
      });
    }
    setConfirmOpen(true);
  }, []);

  const handleConfirmAction = useCallback(() => {
    if (!confirmAction) return;
    if (confirmAction.action === 'suspend') {
      updateAdminStatus(confirmAction.id, 'SUSPENDED');
      toast.success('Administrateur suspendu');
    } else {
      updateAdminStatus(confirmAction.id, 'ACTIVE');
      toast.success('Administrateur réactivé');
    }
    setConfirmOpen(false);
    setConfirmAction(null);
  }, [confirmAction, updateAdminStatus]);

  const handleExportCSV = useCallback(() => {
    if (filteredAdmins.length === 0) return;
    const headers = ['ID', 'Nom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Dernière connexion'].join(
      ',',
    );
    const rows = filteredAdmins.map((a) =>
      [
        a.id,
        `"${a.name}"`,
        a.email,
        a.phone ?? '',
        a.role === 'super_admin' ? 'Super Admin' : 'Admin',
        a.status,
        a.lastLogin ?? '',
      ].join(','),
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admins-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV généré');
  }, [filteredAdmins]);

  const formatDateSafe = (dateStr?: string) => {
    if (!dateStr) return 'Jamais';
    return formatDateTime(dateStr);
  };

  const tableData = useMemo(
    () =>
      paginatedAdmins.map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        phone: a.phone,
        role: a.role,
        status: a.status,
        lastLogin: a.lastLogin,
        createdAt: a.createdAt,
      })),
    [paginatedAdmins],
  );

  const columns = [
    {
      key: 'name',
      label: 'Administrateur',
      sortable: true,
      render: (_value: unknown, row: Record<string, unknown>) => {
        const admin = row as { id: string; name: string; email: string };
        return (
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{admin.name}</p>
            <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
          </div>
        );
      },
    },
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: '110px',
      render: (value: unknown) => (
        <span className="font-mono text-xs text-muted-foreground">{value as string}</span>
      ),
    },
    {
      key: 'role',
      label: 'Rôle',
      sortable: true,
      width: '130px',
      render: (_value: unknown, row: Record<string, unknown>) => {
        const role = row.role as Role;
        return (
          <Badge variant={role === 'super_admin' ? 'brand' : 'neutral'}>
            {role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      width: '120px',
      render: (value: unknown) => <StatusBadge status={value as string} type="user" />,
    },
    {
      key: 'lastLogin',
      label: 'Dernière connexion',
      sortable: true,
      width: '160px',
      render: (value: unknown) => (
        <span className="text-sm text-muted-foreground">{formatDateSafe(value as string | undefined)}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      width: '56px',
      render: (_value: unknown, row: Record<string, unknown>) => {
        const admin = admins.find((a) => a.id === row.id);
        if (!admin) return null;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() =>
                  navigate(
                    'admin-detail',
                    { id: admin.id },
                    buildBreadcrumb([
                      { label: 'Administration', route: 'admins' },
                      { label: admin.name },
                    ]),
                  )
                }
              >
                <Eye className="size-4 mr-2" />
                Voir profil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {admin.status === 'ACTIVE' && (
                <DropdownMenuItem onClick={() => handleToggleStatus(admin)}>
                  <Ban className="size-4 mr-2 text-orange-600" />
                  Suspendre
                </DropdownMenuItem>
              )}
              {admin.status === 'SUSPENDED' && (
                <DropdownMenuItem onClick={() => handleToggleStatus(admin)}>
                  <CheckCircle className="size-4 mr-2 text-emerald-600" />
                  Réactiver
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const hasActiveFilters = searchQuery.trim() !== '' || quickFilter !== 'all';

  return (
    <RoleGuard
      roles={['super_admin']}
      fallback={
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Accès non autorisé</p>
        </div>
      }
    >
      <div className="space-y-6">
        <PageHeader
          title="Administration"
          subtitle="Gestion des comptes administrateurs — rôles, accès et statuts"
          breadcrumb={[
            { label: 'Tableau de bord', onClick: () => navigate('dashboard') },
            { label: 'Administration' },
          ]}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={filteredAdmins.length === 0}
            className="gap-1.5"
          >
            <Download className="size-4" />
            Exporter
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowCreateDialog(true)}>
            <Plus className="size-4 mr-1.5" />
            Nouvel administrateur
          </Button>
        </PageHeader>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total" value={stats.total} hint="Comptes enregistrés" accent />
          <StatCard label="Actifs" value={stats.active} hint="Accès back-office actif" />
          <StatCard label="Suspendus" value={stats.suspended} hint="Accès révoqué" />
          <StatCard
            label="Super Admin"
            value={stats.superAdmins}
            hint="Droits complets plateforme"
          />
        </div>

        <div className="flex gap-3 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/30">
          <Shield className="size-5 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Zone réservée Super Admin
            </p>
            <p className="mt-0.5 text-xs text-amber-800/90 dark:text-amber-200/80">
              Seuls les Super Admin peuvent créer, suspendre ou réactiver des comptes administrateurs.
              Les Admin standards n&apos;ont pas accès à cette section.
            </p>
          </div>
        </div>

        <Card className="shadow-sm border-border/80 overflow-hidden">
          <CardHeader className="border-b bg-muted/20 pb-4 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base font-semibold">
                Liste des administrateurs
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({filteredAdmins.length})
                </span>
              </CardTitle>
              <div className="relative w-full sm:max-w-xs">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  type="search"
                  placeholder="Rechercher par nom, email ou ID…"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                  aria-label="Rechercher un administrateur"
                />
              </div>
            </div>

            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="Filtrer les administrateurs"
            >
              {QUICK_FILTERS.map(({ id, label, icon: Icon }) => {
                const count = filterCounts[id];
                const isActive = quickFilter === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleQuickFilter(id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                      isActive
                        ? 'border-ricash-brand/40 bg-ricash-brand/10 text-ricash-brand shadow-sm'
                        : 'border-border bg-card text-muted-foreground hover:border-ricash-brand/30 hover:text-foreground',
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden />
                    {label}
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0.5 text-[10px] tabular-nums',
                        isActive ? 'bg-ricash-brand/15' : 'bg-muted',
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardHeader>

          <CardContent className="p-0 sm:p-0">
            {filteredAdmins.length === 0 ? (
              <EmptyState
                title={hasActiveFilters ? 'Aucun résultat' : 'Aucun administrateur'}
                description={
                  hasActiveFilters
                    ? 'Modifiez la recherche ou réinitialisez les filtres.'
                    : 'Créez le premier compte administrateur pour commencer.'
                }
                icon={<UserCog className="size-8 text-muted-foreground" />}
                action={
                  hasActiveFilters ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery('');
                        setQuickFilter('all');
                        resetPage();
                      }}
                    >
                      Réinitialiser les filtres
                    </Button>
                  ) : (
                    <Button variant="primary" size="sm" onClick={() => setShowCreateDialog(true)}>
                      <UserPlus className="size-4 mr-1.5" />
                      Créer un administrateur
                    </Button>
                  )
                }
              />
            ) : (
              <DataTable
                columns={columns}
                data={tableData as unknown as Record<string, unknown>[]}
                emptyMessage="Aucun administrateur trouvé"
                pagination={pagination}
                onPageChange={onPageChange}
              />
            )}
          </CardContent>
        </Card>

        <Dialog
          open={showCreateDialog}
          onOpenChange={(open) => {
            setShowCreateDialog(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nouvel administrateur</DialogTitle>
              <DialogDescription>
                Créez un compte avec un rôle et des droits d&apos;accès au back-office Ricash.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="admin-name">Nom complet *</Label>
                  <Input
                    id="admin-name"
                    placeholder="Ex : Aminata Diallo"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email *</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@ricash.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-phone">Téléphone</Label>
                  <Input
                    id="admin-phone"
                    placeholder="+223 70 00 00 00"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Rôle *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Rôle">
                  {(
                    [
                      {
                        value: 'admin' as Role,
                        label: 'Admin',
                        description: 'Gestion opérationnelle : clients, agents, transactions, KYC.',
                        icon: UserCog,
                      },
                      {
                        value: 'super_admin' as Role,
                        label: 'Super Admin',
                        description: 'Accès complet : configuration, système et administration.',
                        icon: ShieldCheck,
                      },
                    ] as const
                  ).map(({ value, label, description, icon: Icon }) => {
                    const selected = newRole === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setNewRole(value)}
                        className={cn(
                          'flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all w-full',
                          'hover:border-ricash-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ricash-brand/30',
                          selected
                            ? 'border-ricash-brand/50 bg-ricash-brand/5 ring-1 ring-ricash-brand/20'
                            : 'border-border bg-card',
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <Icon
                            className={cn(
                              'size-4',
                              selected ? 'text-ricash-brand' : 'text-muted-foreground',
                            )}
                          />
                          <span className="text-sm font-semibold">{label}</span>
                        </span>
                        <span className="text-xs text-muted-foreground leading-relaxed">
                          {description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Annuler
              </Button>
              <Button variant="primary" onClick={handleCreateAdmin}>
                <UserPlus className="size-4 mr-1.5" />
                Créer le compte
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={confirmAction?.label ?? 'Confirmer'}
          description={
            confirmAction?.action === 'suspend'
              ? 'Cet administrateur perdra immédiatement ses accès au back-office.'
              : 'Cet administrateur retrouvera ses accès au back-office.'
          }
          confirmLabel={confirmAction?.action === 'suspend' ? 'Suspendre' : 'Réactiver'}
          variant={confirmAction?.action === 'suspend' ? 'destructive' : 'default'}
          onConfirm={handleConfirmAction}
        />
      </div>
    </RoleGuard>
  );
}
