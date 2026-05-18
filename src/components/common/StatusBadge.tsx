'use client';

import React from 'react';
import { Badge, StatusDot } from '@/components/ui/badge';
import {
  USER_STATUS_LABELS,
  AGENT_STATUS_LABELS,
  TRANSACTION_STATUS_LABELS,
  KYC_STATUS_LABELS,
  FLOAT_REQUEST_STATUS_LABELS,
  type UserStatus,
  type AgentStatus,
  type TransactionStatus,
  type KycStatus,
  type FloatRequest,
} from '@/types';

interface StatusBadgeProps {
  status: string;
  type: 'user' | 'transaction' | 'kyc' | 'agent' | 'float_request';
}

// Map status values to semantic badge variant names
const USER_VARIANT: Record<UserStatus, 'success' | 'neutral' | 'warning'> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  SUSPENDED: 'warning',
};

const TRANSACTION_VARIANT: Record<TransactionStatus, 'success' | 'error' | 'warning' | 'neutral' | 'info'> = {
  SUCCESS: 'success',
  FAILED: 'error',
  PENDING: 'warning',
  CANCELLED: 'neutral',
  IN_PROGRESS: 'info',
};

const KYC_VARIANT: Record<KycStatus, 'success' | 'warning' | 'error' | 'neutral'> = {
  VERIFIED: 'success',
  PENDING: 'warning',
  REJECTED: 'error',
  EXPIRED: 'neutral',
};

const AGENT_VARIANT: Record<AgentStatus, 'success' | 'warning' | 'warning'> = {
  APPROVED: 'success',
  PENDING: 'warning',
  SUSPENDED: 'warning',
};

const FLOAT_VARIANT: Record<string, 'warning' | 'success' | 'error'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};

function getLabel(status: string, type: StatusBadgeProps['type']): string {
  switch (type) {
    case 'user':
      return USER_STATUS_LABELS[status as UserStatus] ?? status;
    case 'transaction':
      return TRANSACTION_STATUS_LABELS[status as TransactionStatus] ?? status;
    case 'kyc':
      return KYC_STATUS_LABELS[status as KycStatus] ?? status;
    case 'agent':
      return AGENT_STATUS_LABELS[status as AgentStatus] ?? status;
    case 'float_request':
      return FLOAT_REQUEST_STATUS_LABELS[status as FloatRequest['status']] ?? status;
    default:
      return status;
  }
}

function getVariant(status: string, type: StatusBadgeProps['type']): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  const fallback: 'neutral' = 'neutral';
  switch (type) {
    case 'user':
      return USER_VARIANT[status as UserStatus] ?? fallback;
    case 'transaction':
      return TRANSACTION_VARIANT[status as TransactionStatus] ?? fallback;
    case 'kyc':
      return KYC_VARIANT[status as KycStatus] ?? fallback;
    case 'agent':
      return AGENT_VARIANT[status as AgentStatus] ?? fallback;
    case 'float_request':
      return FLOAT_VARIANT[status] ?? fallback;
    default:
      return fallback;
  }
}

export default function StatusBadge({ status, type }: StatusBadgeProps) {
  const label = getLabel(status, type);
  const variant = getVariant(status, type);

  return (
    <Badge variant={variant} className="font-medium">
      <StatusDot color={variant} />
      {label}
    </Badge>
  );
}
