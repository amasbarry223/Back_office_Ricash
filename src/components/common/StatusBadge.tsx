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

const USER_COLORS: Record<UserStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  INACTIVE: 'bg-gray-100 text-gray-600 border-gray-200',
  SUSPENDED: 'bg-orange-100 text-orange-700 border-orange-200',
};

const TRANSACTION_COLORS: Record<TransactionStatus, string> = {
  SUCCESS: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  FAILED: 'bg-red-100 text-red-700 border-red-200',
  PENDING: 'bg-orange-100 text-orange-700 border-orange-200',
  CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
  IN_PROGRESS: 'bg-sky-100 text-sky-700 border-sky-200',
};

const KYC_COLORS: Record<KycStatus, string> = {
  VERIFIED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  PENDING: 'bg-orange-100 text-orange-700 border-orange-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
  EXPIRED: 'bg-gray-100 text-gray-600 border-gray-200',
};

const AGENT_COLORS: Record<AgentStatus, string> = {
  APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  PENDING: 'bg-orange-100 text-orange-700 border-orange-200',
  SUSPENDED: 'bg-red-100 text-red-700 border-red-200',
};

const FLOAT_REQUEST_COLORS: Record<string, string> = {
  PENDING: 'bg-orange-100 text-orange-700 border-orange-200',
  APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_DOT_COLORS: Record<string, string> = {
  // User
  ACTIVE: 'bg-emerald-500',
  INACTIVE: 'bg-gray-400',
  SUSPENDED: 'bg-orange-500',
  // Transaction
  SUCCESS: 'bg-emerald-500',
  FAILED: 'bg-red-500',
  PENDING: 'bg-orange-500',
  CANCELLED: 'bg-gray-400',
  IN_PROGRESS: 'bg-sky-500',
  // KYC
  VERIFIED: 'bg-emerald-500',
  REJECTED: 'bg-red-500',
  EXPIRED: 'bg-gray-400',
  // Agent
  APPROVED: 'bg-emerald-500',
  // Float request
  PENDING: 'bg-orange-500',
  APPROVED: 'bg-emerald-500',
  REJECTED: 'bg-red-500',
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
  switch (type) {
    case 'user':
      return USER_COLORS[status as UserStatus] ?? 'bg-gray-100 text-gray-600 border-gray-200';
    case 'transaction':
      return TRANSACTION_COLORS[status as TransactionStatus] ?? 'bg-gray-100 text-gray-600 border-gray-200';
    case 'kyc':
      return KYC_COLORS[status as KycStatus] ?? 'bg-gray-100 text-gray-600 border-gray-200';
    case 'agent':
      return AGENT_COLORS[status as AgentStatus] ?? 'bg-gray-100 text-gray-600 border-gray-200';
    case 'float_request':
      return FLOAT_REQUEST_COLORS[status] ?? 'bg-gray-100 text-gray-600 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

export default function StatusBadge({ status, type }: StatusBadgeProps) {
  const label = getLabel(status, type);
  const colorClass = getColorClass(status, type);
  const dotColor = STATUS_DOT_COLORS[status] ?? 'bg-gray-400';

  return (
    <Badge variant="outline" className={`${colorClass} font-medium text-xs gap-1.5 border`}>
      <span className={`size-1.5 rounded-full ${dotColor} shrink-0`} />
      {label}
    </Badge>
  );
}
