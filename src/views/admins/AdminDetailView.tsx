'use client';

import React, { useMemo } from 'react';
import { ArrowLeft, Ban, CheckCircle, Mail, Phone, Calendar, Shield, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import StatusBadge from '@/components/common/StatusBadge';
import PageHeader from '@/components/common/PageHeader';
import RoleGuard from '@/components/common/RoleGuard';
import { useRouterStore, buildBreadcrumb } from '@/stores/router-store';
import { useUsersStore } from '@/stores/users-store';
import { formatDateTimeLong } from '@/lib/format';

export default function AdminDetailView() {
  const params = useRouterStore((s) => s.params);
  const navigate = useRouterStore((s) => s.navigate);
  const goBack = useRouterStore((s) => s.goBack);
  const admins = useUsersStore((s) => s.admins);
  const updateAdminStatus = useUsersStore((s) => s.updateAdminStatus);

  const admin = useMemo(() => admins.find(a => a.id === params.id), [admins, params.id]);

  if (!admin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Administrateur introuvable</p>
        <Button variant="outline" onClick={goBack}>
          <ArrowLeft className="size-4 mr-1.5" />
          Retour
        </Button>
      </div>
    );
  }

  const formatDateSafe = (dateStr?: string) => {
    if (!dateStr) return 'Jamais';
    return formatDateTimeLong(dateStr);
  };

  const handleSuspend = () => {
    updateAdminStatus(admin.id, 'SUSPENDED');
    toast.success('Administrateur suspendu avec succès');
  };

  const handleReactivate = () => {
    updateAdminStatus(admin.id, 'ACTIVE');
    toast.success('Administrateur réactivé avec succès');
  };

  const detailItems = [
    {
      icon: Hash,
      label: 'ID',
      value: admin.id,
    },
    {
      icon: Mail,
      label: 'Email',
      value: admin.email,
    },
    {
      icon: Phone,
      label: 'Téléphone',
      value: admin.phone || 'Non renseigné',
    },
    {
      icon: Shield,
      label: 'Rôle',
      value: (
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
      ),
    },
    {
      icon: undefined,
      label: 'Statut',
      value: <StatusBadge status={admin.status} type="user" />,
    },
    {
      icon: Calendar,
      label: 'Date de création',
      value: formatDateSafe(admin.createdAt),
    },
    {
      icon: Calendar,
      label: 'Dernière connexion',
      value: formatDateSafe(admin.lastLogin),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground -ml-2"
        onClick={goBack}
      >
        <ArrowLeft className="size-4 mr-1.5" />
        Retour
      </Button>

      <PageHeader
        title={admin.name}
        subtitle={`${admin.role === 'super_admin' ? 'Super Admin' : 'Admin'} — ${admin.email}`}
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
        <div className="flex items-center gap-2">
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
          <StatusBadge status={admin.status} type="user" />
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informations de l&apos;administrateur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detailItems.map((item, index) => (
              <React.Fragment key={item.label}>
                <div className="flex items-start gap-3 py-3">
                  {item.icon && (
                    <div className="flex items-center justify-center size-8 rounded-lg bg-muted shrink-0">
                      <item.icon className="size-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                    <div className="text-sm font-medium text-foreground">
                      {typeof item.value === 'string' ? (
                        <span>{item.value}</span>
                      ) : (
                        item.value
                      )}
                    </div>
                  </div>
                </div>
                {index === Math.floor(detailItems.length / 2) - 1 && (
                  <Separator className="md:hidden col-span-full" />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions — Super Admin only */}
      <RoleGuard roles={['super_admin']}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {admin.status === 'ACTIVE' && (
                <Button
                  variant="outline"
                  className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                  onClick={handleSuspend}
                >
                  <Ban className="size-4 mr-1.5" />
                  Suspendre
                </Button>
              )}
              {admin.status === 'SUSPENDED' && (
                <Button
                  variant="outline"
                  className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                  onClick={handleReactivate}
                >
                  <CheckCircle className="size-4 mr-1.5" />
                  Réactiver
                </Button>
              )}
              {admin.status === 'INACTIVE' && (
                <Button
                  variant="outline"
                  className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                  onClick={handleReactivate}
                >
                  <CheckCircle className="size-4 mr-1.5" />
                  Activer
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </RoleGuard>
    </div>
  );
}
