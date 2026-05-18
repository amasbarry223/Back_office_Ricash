'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
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

// All colors now use CSS custom property tokens — dark mode compatible
const USER_COLORS: Record<UserStatus, string> = {
  ACTIVE: 'bg-ricash-success-bg text-ricash-success border-ricash-success-border',
  INACTIVE: 'bg-ricash-neutral-bg text-ricash-neutral border-ricash-neutral-border',
  SUSPENDED: 'bg-ricash-warning-bg text-ricash-warning border-ricash-warning-border',
};

const TRANSACTION_COLORS: Record<TransactionStatus, string> = {
  SUCCESS: 'bg-ricash-success-bg text-ricash-success border-ricash-success-border',
  FAILED: 'bg-ricash-danger-bg text-ricash-danger border-ricash-danger-border',
  PENDING: 'bg-ricash-warning-bg text-ricash-warning border-ricash-warning-border',
  CANCELLED: 'bg-ricash-neutral-bg text-ricash-neutral border-ricash-neutral-border',
  IN_PROGRESS: 'bg-ricash-info-bg text-ricash-info border-ricash-info-border',
};

const KYC_COLORS: Record<KycStatus, string> = {
  VERIFIED: 'bg-ricash-success-bg text-ricash-success border-ricash-success-border',
  PENDING: 'bg-ricash-warning-bg text-ricash-warning border-ricash-warning-border',
  REJECTED: 'bg-ricash-danger-bg text-ricash-danger border-ricash-danger-border',
  EXPIRED: 'bg-ricash-neutral-bg text-ricash-neutral border-ricash-neutral-border',
};

const AGENT_COLORS: Record<AgentStatus, string> = {
  APPROVED: 'bg-ricash-success-bg text-ricash-success border-ricash-success-border',
  PENDING: 'bg-ricash-warning-bg text-ricash-warning border-ricash-warning-border',
  SUSPENDED: 'bg-ricash-warning-bg text-ricash-warning border-ricash-warning-border',
};

const FLOAT_REQUEST_COLORS: Record<string, string> = {
  PENDING: 'bg-ricash-warning-bg text-ricash-warning border-ricash-warning-border',
  APPROVED: 'bg-ricash-success-bg text-ricash-success border-ricash-success-border',
  REJECTED: 'bg-ricash-danger-bg text-ricash-danger border-ricash-danger-border',
};

const STATUS_DOT_COLORS: Record<string, string> = {
  ACTIVE: 'bg-ricash-success',
  INACTIVE: 'bg-ricash-neutral',
  SUSPENDED: 'bg-ricash-warning',
  SUCCESS: 'bg-ricash-success',
  FAILED: 'bg-ricash-danger',
  PENDING: 'bg-ricash-warning',
  CANCELLED: 'bg-ricash-neutral',
  IN_PROGRESS: 'bg-ricash-info',
  VERIFIED: 'bg-ricash-success',
  REJECTED: 'bg-ricash-danger',
  EXPIRED: 'bg-ricash-neutral',
  APPROVED: 'bg-ricash-success',
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

function getColorClass(status: string, type: StatusBadgeProps['type']): string {
  const fallback = 'bg-ricash-neutral-bg text-ricash-neutral border-ricash-neutral-border';
  switch (type) {
    case 'user':
      return USER_COLORS[status as UserStatus] ?? fallback;
    case 'transaction':
      return TRANSACTION_COLORS[status as TransactionStatus] ?? fallback;
    case 'kyc':
      return KYC_COLORS[status as KycStatus] ?? fallback;
    case 'agent':
      return AGENT_COLORS[status as AgentStatus] ?? fallback;
    case 'float_request':
      return FLOAT_REQUEST_COLORS[status] ?? fallback;
    default:
      return fallback;
  }
}

export default function StatusBadge({ status, type }: StatusBadgeProps) {
  const label = getLabel(status, type);
  const colorClass = getColorClass(status, type);
  const dotColor = STATUS_DOT_COLORS[status] ?? 'bg-ricash-neutral';

  return (
    <Badge variant="outline" className={`${colorClass} font-medium text-xs gap-1.5 border`}>
      <span className={`size-1.5 rounded-full ${dotColor} shrink-0`} />
      {label}
    </Badge>
  );
}
