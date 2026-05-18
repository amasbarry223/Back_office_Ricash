'use client';

import React, { Component, useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouterStore } from '@/stores/router-store';
import { type RouteName, type Role } from '@/types';
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
import SettingsView from '@/views/settings/SettingsView';
import NotificationsView from '@/views/notifications/NotificationsView';
import UnauthorizedView from '@/views/errors/UnauthorizedView';
import NotFoundView from '@/views/errors/NotFoundView';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Route access control map — properly typed with RouteName
const ROUTE_ROLES: Partial<Record<RouteName, Role[]>> = {
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
  settings: ['super_admin', 'admin'],
  notifications: ['super_admin', 'admin'],
};

// Error boundary component
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
          <AlertTriangle className="size-12 text-orange-500" />
          <h2 className="text-xl font-bold text-foreground">Une erreur est survenue</h2>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {this.state.error?.message || 'Erreur inattendue. Veuillez réessayer.'}
          </p>
          <Button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="bg-[var(--ricash-primary)] hover:bg-[var(--ricash-primary)]/90 text-white"
          >
            <RefreshCw className="size-4 mr-2" />
            Réessayer
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

function RouteRenderer() {
  const currentRoute = useRouterStore((s) => s.currentRoute);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userRole = useAuthStore((s) => s.user?.role);

  // If not authenticated, show login
  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Check route access
  const allowedRoles = ROUTE_ROLES[currentRoute];
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
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
      case 'settings':
        return <SettingsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'unauthorized':
        return <UnauthorizedView />;
      default:
        return <NotFoundView />;
    }
  };

  return (
    <DashboardLayout>
      <ErrorBoundary>
        {renderView()}
      </ErrorBoundary>
    </DashboardLayout>
  );
}

export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useRouterStore((s) => s.navigate);
  const currentRoute = useRouterStore((s) => s.currentRoute);
  // Wait for Zustand persist hydration to avoid SSR mismatch
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame to avoid synchronous setState in effect
    requestAnimationFrame(() => {
      setHydrated(true);
    });
  }, []);

  // Auto-navigate based on auth state
  useEffect(() => {
    if (!hydrated) return;
    if (isAuthenticated && currentRoute === 'login') {
      navigate('dashboard');
    }
    if (!isAuthenticated && currentRoute !== 'login') {
      navigate('login');
    }
  }, [isAuthenticated, currentRoute, navigate, hydrated]);

  // Show nothing during hydration to prevent SSR mismatch
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--ricash-bg, #F4F7FB)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="shimmer size-12 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--ricash-bg, #F4F7FB)' }}>
      <RouteRenderer />
    </div>
  );
}
