// ============================================================
// Ricash Back-Office — Type Definitions
// ============================================================

// --- Rôles & Auth ---
export type Role = 'super_admin' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

// --- Navigation / Router ---
export type RouteName =
  | 'login'
  | 'dashboard'
  | 'clients'
  | 'client-detail'
  | 'agents'
  | 'agent-detail'
  | 'agent-float'
  | 'admins'
  | 'admin-detail'
  | 'super-admins'
  | 'transactions'
  | 'transaction-detail'
  | 'kyc'
  | 'kyc-detail'
  | 'float'
  | 'config'
  | 'notifications'
  | 'unauthorized'
  | 'not-found';

export interface RouterState {
  currentRoute: RouteName;
  params: Record<string, string>;
  breadcrumb: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  label: string;
  route?: RouteName;
  params?: Record<string, string>;
}

// --- Users / Clients ---
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type KycLevel = 0 | 1 | 2 | 3;

export interface Client {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  country: string;
  status: UserStatus;
  kycLevel: KycLevel;
  balance: number;
  createdAt: string;
  lastLogin?: string;
  email?: string;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  lastLogin?: string;
  phone?: string;
}

// --- Agents ---
export type AgentStatus = 'APPROVED' | 'PENDING' | 'SUSPENDED';

export interface Agent {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  status: AgentStatus;
  floatBalance: number;
  commissionRate: number;
  monthlyTransactions: number;
  kycLevel: KycLevel;
  createdAt: string;
  email?: string;
}

export interface FloatRequest {
  id: string;
  agentId: string;
  agentCode: string;
  agentName: string;
  amount: number;
  justification: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedBy: string;
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  comment?: string;
}

export interface FloatMovement {
  id: string;
  agentId: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  createdBy: string;
  createdAt: string;
}

// --- Transactions ---
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'MERCHANT_PAYMENT' | 'REFUND';
export type TransactionStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED' | 'IN_PROGRESS';
export type Channel = 'APP_MOBILE' | 'USSD' | 'WEB' | 'AGENT';
export type Operator = 'ORANGE_MONEY' | 'MOOV' | 'MTN' | 'WAVE' | 'FREE_MONEY';

export interface Transaction {
  id: string;
  ref: string;
  type: TransactionType;
  channel: Channel;
  amount: number;
  currency: string;
  fees: number;
  status: TransactionStatus;
  clientId: string;
  clientName: string;
  clientPhone: string;
  agentId: string | null;
  agentCode: string | null;
  operator: Operator;
  description?: string;
  createdAt: string;
}

// --- KYC ---
export type KycStatus = 'VERIFIED' | 'PENDING' | 'REJECTED' | 'EXPIRED';
export type DocumentType = 'CIP' | 'CNI' | 'PASSPORT' | 'CARTE_CONSULAIRE' | 'ATTESTATION';

export interface KycRecord {
  id: string;
  clientId: string;
  clientPhone: string;
  clientName: string;
  currentLevel: KycLevel;
  status: KycStatus;
  documentType: DocumentType;
  documentImage: string;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  comment?: string;
  smileIdentityResult?: string;
}

// --- Notifications ---
export type NotificationType = 'FRAUD_ALERT' | 'LOW_FLOAT' | 'KYC_EXPIRED' | 'SYSTEM' | 'TRANSACTION_ALERT';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// --- Config ---
export interface FeeConfig {
  id: string;
  operationType: TransactionType;
  minAmount: number;
  maxAmount: number;
  feePercent: number;
  fixedFee: number;
}

export interface KycLimitConfig {
  level: KycLevel;
  label: string;
  dailyLimit: number;
  monthlyLimit: number;
  maxBalance: number;
}

export interface GeneralConfig {
  currency: string;
  activeCountries: string[];
  activeOperators: Operator[];
}

// --- Dashboard ---
export interface DashboardStats {
  totalTransactions: number;
  totalAmount: number;
  pendingTransactions: number;
  fraudAlerts: number;
  activeAgents: number;
  registeredClients: number;
  globalFloat: number;
}

// --- Table / Pagination ---
export interface PaginationState {
  page: number;
  perPage: number;
  total: number;
}

export interface SortState {
  key: string;
  direction: 'asc' | 'desc';
}

export interface Column<T = unknown> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

// --- Country labels ---
export const COUNTRY_LABELS: Record<string, string> = {
  ML: 'Mali',
  SN: 'Sénégal',
  CI: "Côte d'Ivoire",
  BF: 'Burkina Faso',
  GN: 'Guinée',
  NE: 'Niger',
  TG: 'Togo',
  BJ: 'Bénin',
};

// --- Status labels (French) ---
export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: 'Actif',
  INACTIVE: 'Inactif',
  SUSPENDED: 'Suspendu',
};

export const AGENT_STATUS_LABELS: Record<AgentStatus, string> = {
  APPROVED: 'Approuvé',
  PENDING: 'En attente',
  SUSPENDED: 'Suspendu',
};

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  SUCCESS: 'Réussi',
  FAILED: 'Échoué',
  PENDING: 'En attente',
  CANCELLED: 'Annulé',
  IN_PROGRESS: 'En cours',
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  DEPOSIT: 'Dépôt',
  WITHDRAWAL: 'Retrait',
  TRANSFER: 'Transfert',
  MERCHANT_PAYMENT: 'Paiement marchand',
  REFUND: 'Remboursement',
};

export const KYC_STATUS_LABELS: Record<KycStatus, string> = {
  VERIFIED: 'Vérifié',
  PENDING: 'En attente',
  REJECTED: 'Rejeté',
  EXPIRED: 'Expiré',
};

export const CHANNEL_LABELS: Record<Channel, string> = {
  APP_MOBILE: 'App mobile',
  USSD: 'USSD',
  WEB: 'Web',
  AGENT: 'Agent',
};

export const OPERATOR_LABELS: Record<Operator, string> = {
  ORANGE_MONEY: 'Orange Money',
  MOOV: 'Moov Money',
  MTN: 'MTN Mobile Money',
  WAVE: 'Wave',
  FREE_MONEY: 'Free Money',
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  CIP: 'Carte d\'Identité pour Périmètre',
  CNI: 'Carte Nationale d\'Identité',
  PASSPORT: 'Passeport',
  CARTE_CONSULAIRE: 'Carte Consulaire',
  ATTESTATION: 'Attestation d\'identité',
};
