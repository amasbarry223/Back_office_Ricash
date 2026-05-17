import { Agent, FloatRequest, FloatMovement } from '@/types';

export const mockAgents: Agent[] = [
  { id: 'AGT-001', code: 'AG-BKO-001', firstName: 'Modibo', lastName: 'Diarra', phone: '+22370891011', country: 'ML', status: 'APPROVED', floatBalance: 2500000, commissionRate: 1.5, monthlyTransactions: 342, kycLevel: 2, createdAt: '2024-06-15', email: 'modibo.diarra@email.com' },
  { id: 'AGT-002', code: 'AG-DKR-002', firstName: 'Moussa', lastName: 'Ndiaye', phone: '+22176123456', country: 'SN', status: 'APPROVED', floatBalance: 1800000, commissionRate: 1.2, monthlyTransactions: 256, kycLevel: 2, createdAt: '2024-08-20', email: 'moussa.ndiaye@email.com' },
  { id: 'AGT-003', code: 'AG-ABJ-003', firstName: 'Jean', lastName: 'Kouassi', phone: '+22507012345', country: 'CI', status: 'PENDING', floatBalance: 0, commissionRate: 0, monthlyTransactions: 0, kycLevel: 1, createdAt: '2025-07-01', email: 'jean.kouassi@email.com' },
  { id: 'AGT-004', code: 'AG-OUA-004', firstName: 'Issa', lastName: 'Ouédraogo', phone: '+22670234567', country: 'BF', status: 'APPROVED', floatBalance: 950000, commissionRate: 1.0, monthlyTransactions: 189, kycLevel: 2, createdAt: '2024-10-05', email: 'issa.ouedraogo@email.com' },
  { id: 'AGT-005', code: 'AG-CKY-005', firstName: 'Alpha', lastName: 'Condé', phone: '+22462012345', country: 'GN', status: 'SUSPENDED', floatBalance: 0, commissionRate: 1.3, monthlyTransactions: 0, kycLevel: 1, createdAt: '2024-11-12', email: 'alpha.conde@email.com' },
  { id: 'AGT-006', code: 'AG-BKO-006', firstName: 'Fatoumata', lastName: 'Sangaré', phone: '+22370345678', country: 'ML', status: 'APPROVED', floatBalance: 3200000, commissionRate: 1.5, monthlyTransactions: 410, kycLevel: 2, createdAt: '2024-05-10', email: 'fatoumata.sangare@email.com' },
  { id: 'AGT-007', code: 'AG-SLP-007', firstName: 'Babacar', lastName: 'Seck', phone: '+22177234567', country: 'SN', status: 'APPROVED', floatBalance: 1400000, commissionRate: 1.2, monthlyTransactions: 198, kycLevel: 2, createdAt: '2024-09-18', email: 'babacar.seck@email.com' },
  { id: 'AGT-008', code: 'AG-ABJ-008', firstName: 'Aminata', lastName: 'Touré', phone: '+22508345678', country: 'CI', status: 'APPROVED', floatBalance: 2100000, commissionRate: 1.4, monthlyTransactions: 287, kycLevel: 2, createdAt: '2024-07-22', email: 'aminata.toure@email.com' },
  { id: 'AGT-009', code: 'AG-NMY-009', firstName: 'Hamidou', lastName: 'Issaka', phone: '+22780456789', country: 'NE', status: 'PENDING', floatBalance: 0, commissionRate: 0, monthlyTransactions: 0, kycLevel: 1, createdAt: '2025-07-05', email: 'hamidou.issaka@email.com' },
  { id: 'AGT-010', code: 'AG-LME-010', firstName: 'Kodjo', lastName: 'Agbéko', phone: '+22890567890', country: 'TG', status: 'APPROVED', floatBalance: 750000, commissionRate: 1.0, monthlyTransactions: 145, kycLevel: 2, createdAt: '2025-01-10', email: 'kodjo.agbeko@email.com' },
  { id: 'AGT-011', code: 'AG-COT-011', firstName: 'Rachid', lastName: 'Gbadamassi', phone: '+22991678901', country: 'BJ', status: 'APPROVED', floatBalance: 1650000, commissionRate: 1.1, monthlyTransactions: 220, kycLevel: 2, createdAt: '2024-12-01', email: 'rachid.gbadamassi@email.com' },
  { id: 'AGT-012', code: 'AG-BKO-012', firstName: 'Oumar', lastName: 'Sidibé', phone: '+22371567890', country: 'ML', status: 'APPROVED', floatBalance: 2800000, commissionRate: 1.5, monthlyTransactions: 356, kycLevel: 2, createdAt: '2024-04-20', email: 'oumar.sidibe@email.com' },
];

export const mockFloatRequests: FloatRequest[] = [
  { id: 'FLR-001', agentId: 'AGT-001', agentCode: 'AG-BKO-001', agentName: 'Modibo Diarra', amount: 1000000, justification: 'Besoin de liquidité pour les transferts de fin de mois', status: 'PENDING', requestedBy: 'admin@ricash.com', requestedAt: '2025-07-11T10:00:00Z' },
  { id: 'FLR-002', agentId: 'AGT-002', agentCode: 'AG-DKR-002', agentName: 'Moussa Ndiaye', amount: 500000, justification: 'Stock float faible suite à forte activité', status: 'PENDING', requestedBy: 'admin@ricash.com', requestedAt: '2025-07-11T09:30:00Z' },
  { id: 'FLR-003', agentId: 'AGT-004', agentCode: 'AG-OUA-004', agentName: 'Issa Ouédraogo', amount: 750000, justification: 'Recharge float hebdomadaire', status: 'APPROVED', requestedBy: 'admin@ricash.com', requestedAt: '2025-07-09T14:00:00Z', processedAt: '2025-07-09T15:30:00Z', processedBy: 'superadmin@ricash.com', comment: 'Approuvé - montant ajusté' },
  { id: 'FLR-004', agentId: 'AGT-006', agentCode: 'AG-BKO-006', agentName: 'Fatoumata Sangaré', amount: 2000000, justification: 'Augmentation float pour zone à fort volume', status: 'APPROVED', requestedBy: 'admin@ricash.com', requestedAt: '2025-07-08T11:00:00Z', processedAt: '2025-07-08T14:00:00Z', processedBy: 'superadmin@ricash.com' },
  { id: 'FLR-005', agentId: 'AGT-008', agentCode: 'AG-ABJ-008', agentName: 'Aminata Touré', amount: 300000, justification: 'Float insuffisant', status: 'REJECTED', requestedBy: 'admin@ricash.com', requestedAt: '2025-07-07T08:00:00Z', processedAt: '2025-07-07T10:00:00Z', processedBy: 'superadmin@ricash.com', comment: 'Montant trop faible - faire une demande groupée' },
  { id: 'FLR-006', agentId: 'AGT-010', agentCode: 'AG-LME-010', agentName: 'Kodjo Agbéko', amount: 500000, justification: 'Recharge mensuelle', status: 'PENDING', requestedBy: 'admin@ricash.com', requestedAt: '2025-07-10T16:00:00Z' },
  { id: 'FLR-007', agentId: 'AGT-012', agentCode: 'AG-BKO-012', agentName: 'Oumar Sidibé', amount: 1500000, justification: 'Renforcement float zone commerciale', status: 'APPROVED', requestedBy: 'admin@ricash.com', requestedAt: '2025-07-06T09:00:00Z', processedAt: '2025-07-06T11:00:00Z', processedBy: 'superadmin@ricash.com' },
];

export const mockFloatMovements: FloatMovement[] = [
  { id: 'FM-001', agentId: 'AGT-001', type: 'CREDIT', amount: 1000000, description: 'Recharge float initiale', createdBy: 'superadmin@ricash.com', createdAt: '2025-01-15T10:00:00Z' },
  { id: 'FM-002', agentId: 'AGT-001', type: 'CREDIT', amount: 500000, description: 'Recharge float mensuelle', createdBy: 'admin@ricash.com', createdAt: '2025-06-15T14:00:00Z' },
  { id: 'FM-003', agentId: 'AGT-001', type: 'DEBIT', amount: 200000, description: 'Ajustement float - correction', createdBy: 'superadmin@ricash.com', createdAt: '2025-06-20T09:00:00Z' },
  { id: 'FM-004', agentId: 'AGT-001', type: 'CREDIT', amount: 750000, description: 'Recharge float exceptionnelle', createdBy: 'admin@ricash.com', createdAt: '2025-07-01T11:00:00Z' },
  { id: 'FM-005', agentId: 'AGT-002', type: 'CREDIT', amount: 800000, description: 'Recharge float initiale', createdBy: 'superadmin@ricash.com', createdAt: '2025-01-20T10:00:00Z' },
  { id: 'FM-006', agentId: 'AGT-002', type: 'CREDIT', amount: 500000, description: 'Recharge mensuelle', createdBy: 'admin@ricash.com', createdAt: '2025-07-05T15:00:00Z' },
];
