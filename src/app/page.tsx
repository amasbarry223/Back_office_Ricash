'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouterStore } from '@/stores/router-store';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Views (all default exports)
import LoginView from '@/views/auth/LoginView';
import DashboardView from '@/views/dashboard/DashboardView';
import UsersView from '@/views/users/UsersView';
import UserDetailView from '@/views/users/UserDetailView';
import AgentsView from '@/views/agents/AgentsView';
import AgentDetailView from '@/views/agents/AgentDetailView';
import AgentFloatView from '@/views/agents/AgentFloatView';
import AdminsView from '@/views/admins/AdminsView';
import AdminDetailView from '@/views/admins/AdminDetailView';
import TransactionsView from '@/views/transactions/TransactionsView';
import TransactionDetailView from '@/views/transactions/TransactionDetailView';
import KycView from '@/views/kyc/KycView';
import KycDetailView from '@/views/kyc/KycDetailView';
import FloatRequestsView from '@/views/float/FloatRequestsView';
import ConfigView from '@/views/config/ConfigView';
import NotificationsView from '@/views/notifications/NotificationsView';
import UnauthorizedView from '@/views/errors/UnauthorizedView';
import NotFoundView from '@/views/errors/NotFoundView';

// Route access control map
const ROUTE_ROLES: Record<string, Array<'super_admin' | 'admin'>> = {
  dashboard: ['super_admin', 'admin'],
  clients: ['super_admin', 'admin'],
  'client-detail': ['super_admin', 'admin'],
  agents: ['super_admin', 'admin'],
  'agent-detail': ['super_admin', 'admin'],
  'agent-float': ['super_admin', 'admin'],
  admins: ['super_admin'],
  'admin-detail': ['super_admin'],
  transactions: ['super_admin', 'admin'],
  'transaction-detail': ['super_admin', 'admin'],
  kyc: ['super_admin', 'admin'],
  'kyc-detail': ['super_admin', 'admin'],
  float: ['super_admin', 'admin'],
  config: ['super_admin'],
  notifications: ['super_admin', 'admin'],
};

function RouteRenderer() {
  const { currentRoute } = useRouterStore();
  const { isAuthenticated, canAccess } = useAuthStore();

  // If not authenticated, show login
  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Check route access
  const allowedRoles = ROUTE_ROLES[currentRoute];
  if (allowedRoles && !canAccess(allowedRoles)) {
    return (
      <DashboardLayout>
        <UnauthorizedView />
      </DashboardLayout>
    );
  }

  // Render the appropriate view
  const renderView = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <DashboardView />;
      case 'clients':
        return <UsersView />;
      case 'client-detail':
        return <UserDetailView />;
      case 'agents':
        return <AgentsView />;
      case 'agent-detail':
        return <AgentDetailView />;
      case 'agent-float':
        return <AgentFloatView />;
      case 'admins':
        return <AdminsView />;
      case 'admin-detail':
        return <AdminDetailView />;
      case 'transactions':
        return <TransactionsView />;
      case 'transaction-detail':
        return <TransactionDetailView />;
      case 'kyc':
        return <KycView />;
      case 'kyc-detail':
        return <KycDetailView />;
      case 'float':
        return <FloatRequestsView />;
      case 'config':
        return <ConfigView />;
      case 'notifications':
        return <NotificationsView />;
      case 'unauthorized':
        return <UnauthorizedView />;
      default:
        return <NotFoundView />;
    }
  };

  // Error pages don't use the dashboard layout
  if (currentRoute === 'unauthorized' || currentRoute === 'not-found') {
    return renderView();
  }

  return (
    <DashboardLayout>
      {renderView()}
    </DashboardLayout>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const { navigate, currentRoute } = useRouterStore();

  // Auto-navigate to dashboard if authenticated and on login route
  useEffect(() => {
    if (isAuthenticated && currentRoute === 'login') {
      navigate('dashboard');
    }
    if (!isAuthenticated && currentRoute !== 'login') {
      navigate('login');
    }
  }, [isAuthenticated, currentRoute, navigate]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F7FB' }}>
      <RouteRenderer />
    </div>
  );
}
