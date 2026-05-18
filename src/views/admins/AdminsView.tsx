'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Eye, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import SearchBar from '@/components/common/SearchBar';
import PageHeader from '@/components/common/PageHeader';
import RoleGuard from '@/components/common/RoleGuard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useRouterStore, buildBreadcrumb } from '@/stores/router-store';
import { useUsersStore } from '@/stores/users-store';
import { USER_STATUS_LABELS, type Role, type Admin } from '@/types';
import { formatDateTime } from '@/lib/format';

export default function AdminsView() {
  const navigate = useRouterStore((s) => s.navigate);
  const admins = useUsersStore((s) => s.admins);
  const updateAdminStatus = useUsersStore((s) => s.updateAdminStatus);
  const createAdmin = useUsersStore((s) => s.createAdmin);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [page, setPage] = useState(1);

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'suspend' | 'reactivate'; label: string } | null>(null);

  // Create admin form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<Role>('admin');

  // Filter admins
  const filteredAdmins = useMemo(() => {
    let result = [...admins];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q)
      );
    }

    if (activeFilters.status) {
      result = result.filter((a) => a.status === activeFilters.status);
    }

    if (activeFilters.role) {
      result = result.filter((a) => a.role === activeFilters.role);
    }

    return result;
  }, [admins, searchQuery, activeFilters]);

  const handleSearch = (query: string, filters: Record<string, unknown>) => {
    setSearchQuery(query);
    setActiveFilters(filters);
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

  const resetForm = () => {
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewRole('admin');
  };

  const formatDateSafe = (dateStr?: string) => {
    if (!dateStr) return 'Jamais';
    return formatDateTime(dateStr);
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: '110px',
    },
    {
      key: 'name',
      label: 'Nom',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'role',
      label: 'Rôle',
      sortable: true,
      render: (_value: unknown, row: Record<string, unknown>) => {
        const admin = row as unknown as Admin;
        return (
          <Badge
            variant="outline"
            className={
              admin.role === 'super_admin'
                ? 'bg-[var(--ricash-primary)]/10 text-[var(--ricash-primary)] border-[var(--ricash-primary)]/20 font-medium text-xs'
                : 'bg-[var(--ricash-accent)]/10 text-[var(--ricash-accent)] border-[var(--ricash-accent)]/20 font-medium text-xs'
            }
          >
            {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (_value: unknown, row: Record<string, unknown>) => {
        const admin = row as unknown as Admin;
        return <StatusBadge status={admin.status} type="user" />;
      },
    },
    {
      key: 'lastLogin',
      label: 'Dernière connexion',
      sortable: true,
      render: (_value: unknown, row: Record<string, unknown>) => {
        const admin = row as unknown as Admin;
        return <span className="text-sm text-muted-foreground">{formatDateSafe(admin.lastLogin)}</span>;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '220px',
      render: (_value: unknown, row: Record<string, unknown>) => {
        const admin = row as unknown as Admin;
        return (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-[var(--ricash-primary)] hover:text-[var(--ricash-primary)]/80"
              onClick={() =>
                navigate('admin-detail', { id: admin.id }, buildBreadcrumb([
                  { label: 'Administration', route: 'admins' },
                  { label: admin.name },
                ]))
              }
            >
              <Eye className="size-3.5 mr-1" />
              Voir profil
            </Button>
            <RoleGuard roles={['super_admin']}>
              {admin.status === 'ACTIVE' ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  onClick={() => {
                    setConfirmAction({ id: admin.id, action: 'suspend', label: 'Suspendre cet administrateur' });
                    setConfirmOpen(true);
                  }}
                >
                  <Ban className="size-3.5 mr-1" />
                  Suspendre
                </Button>
              ) : admin.status === 'SUSPENDED' ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  onClick={() => {
                    setConfirmAction({ id: admin.id, action: 'reactivate', label: 'Réactiver cet administrateur' });
                    setConfirmOpen(true);
                  }}
                >
                  <CheckCircle className="size-3.5 mr-1" />
                  Activer
                </Button>
              ) : null}
            </RoleGuard>
          </div>
        );
      },
    },
  ];

  const filterConfig = [
    {
      key: 'status',
      label: 'Statut',
      type: 'select' as const,
      options: Object.entries(USER_STATUS_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      key: 'role',
      label: 'Rôle',
      type: 'select' as const,
      options: [
        { value: 'super_admin', label: 'Super Admin' },
        { value: 'admin', label: 'Admin' },
      ],
    },
  ];

  return (
    <RoleGuard
      roles={['super_admin']}
      fallback={
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Accès non autorisé</p>
        </div>
      }
    >
      <div className="space-y-4">
        <PageHeader
          title="Administration"
          subtitle="Gestion des administrateurs de la plateforme"
          breadcrumb={[
            { label: 'Tableau de bord', onClick: () => navigate('dashboard') },
            { label: 'Administration' },
          ]}
        >
          <RoleGuard roles={['super_admin']}>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-[var(--ricash-primary)] hover:bg-[var(--ricash-primary)]/90 text-white"
            >
              <Plus className="size-4 mr-1.5" />
              Créer un Admin
            </Button>
          </RoleGuard>
        </PageHeader>

        <SearchBar
          placeholder="Rechercher un administrateur…"
          filters={filterConfig}
          onSearch={handleSearch}
        />

        <DataTable
          columns={columns}
          data={filteredAdmins as unknown as Record<string, unknown>[]}
          emptyMessage="Aucun administrateur trouvé"
          pagination={{
            page,
            perPage: 10,
            total: filteredAdmins.length,
          }}
          onPageChange={setPage}
        />

        {/* Create Admin Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un administrateur</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour créer un nouvel administrateur.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="admin-name">Nom *</Label>
                <Input
                  id="admin-name"
                  placeholder="Nom complet"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email *</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="email@ricash.com"
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
              <div className="space-y-2">
                <Label htmlFor="admin-role">Rôle</Label>
                <Select value={newRole} onValueChange={(val) => setNewRole(val as Role)}>
                  <SelectTrigger id="admin-role">
                    <SelectValue placeholder="Sélectionner un rôle…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleCreateAdmin}
                className="bg-[var(--ricash-primary)] hover:bg-[var(--ricash-primary)]/90 text-white"
              >
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation dialog */}
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={confirmAction?.label ?? 'Confirmer'}
          description={
            confirmAction?.action === 'suspend'
              ? 'Êtes-vous sûr de vouloir suspendre cet administrateur ? Il perdra ses accès au back-office.'
              : 'Êtes-vous sûr de vouloir réactiver cet administrateur ?'
          }
          confirmLabel={confirmAction?.action === 'suspend' ? 'Suspendre' : 'Réactiver'}
          variant={confirmAction?.action === 'suspend' ? 'destructive' : 'default'}
          onConfirm={() => {
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
          }}
        />
      </div>
    </RoleGuard>
  );
}
