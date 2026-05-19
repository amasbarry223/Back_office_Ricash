'use client';

import dynamic from 'next/dynamic';
import ViewSkeleton from '@/components/common/ViewSkeleton';

const loading = () => <ViewSkeleton />;

export const DashboardView = dynamic(() => import('@/views/dashboard/DashboardView'), { loading });
export const UsersView = dynamic(() => import('@/views/users/UsersView'), { loading });
export const UserDetailView = dynamic(() => import('@/views/users/UserDetailView'), { loading });
export const AgentsView = dynamic(() => import('@/views/agents/AgentsView'), { loading });
export const AgentDetailView = dynamic(() => import('@/views/agents/AgentDetailView'), { loading });
export const AgentFloatView = dynamic(() => import('@/views/agents/AgentFloatView'), { loading });
export const AdminsView = dynamic(() => import('@/views/admins/AdminsView'), { loading });
export const AdminDetailView = dynamic(() => import('@/views/admins/AdminDetailView'), { loading });
export const TransactionsView = dynamic(() => import('@/views/transactions/TransactionsView'), { loading });
export const TransactionDetailView = dynamic(
  () => import('@/views/transactions/TransactionDetailView'),
  { loading },
);
export const KycView = dynamic(() => import('@/views/kyc/KycView'), { loading });
export const KycDetailView = dynamic(() => import('@/views/kyc/KycDetailView'), { loading });
export const FloatRequestsView = dynamic(() => import('@/views/float/FloatRequestsView'), { loading });
export const SettingsView = dynamic(() => import('@/views/settings/SettingsView'), { loading });
export const NotificationsView = dynamic(() => import('@/views/notifications/NotificationsView'), {
  loading,
});
export const UnauthorizedView = dynamic(() => import('@/views/errors/UnauthorizedView'), { loading });
export const NotFoundView = dynamic(() => import('@/views/errors/NotFoundView'), { loading });
