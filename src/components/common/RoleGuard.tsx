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
  const canAccess = useAuthStore((s) => s.canAccess(roles));

  if (!canAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
