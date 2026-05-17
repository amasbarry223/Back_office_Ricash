'use client';

import React from 'react';
import { useAuthStore } from '@/stores/auth-store';
import type { Role } from '@/types';

interface RoleGuardProps {
  roles: Role[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export default function RoleGuard({ roles, fallback = null, children }: RoleGuardProps) {
  const userRole = useAuthStore((s) => s.user?.role);
  const canAccess = userRole ? roles.includes(userRole) : false;

  if (!canAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
