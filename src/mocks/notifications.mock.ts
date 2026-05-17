import { Notification } from '@/types';

export const mockNotifications: Notification[] = [
  { id: 'NOT-001', type: 'FRAUD_ALERT', title: 'Alerte Fraude', message: 'Transaction suspecte détectée - 3 retraits consécutifs en 5 minutes pour le client CLI-010', read: false, createdAt: '2025-07-11T15:30:00Z' },
  { id: 'NOT-002', type: 'LOW_FLOAT', title: 'Float Bas', message: 'Agent AG-OUA-004 (Issa Ouédraogo) - Float restant: 95 000 XOF', read: false, createdAt: '2025-07-11T14:00:00Z' },
  { id: 'NOT-003', type: 'KYC_EXPIRED', title: 'KYC Expiré', message: 'Le document KYC du client Awa Diallo (CLI-008) a expiré', read: false, createdAt: '2025-07-11T10:00:00Z' },
  { id: 'NOT-004', type: 'TRANSACTION_ALERT', title: 'Transaction Élevée', message: 'Transfert de 500 000 XOF par le client Aboubacar Sawadogo (CLI-020)', read: true, createdAt: '2025-07-09T13:15:00Z' },
  { id: 'NOT-005', type: 'SYSTEM', title: 'Maintenance Système', message: 'Maintenance planifiée le 15 juillet 2025 de 02h00 à 04h00 GMT', read: true, createdAt: '2025-07-08T09:00:00Z' },
  { id: 'NOT-006', type: 'LOW_FLOAT', title: 'Float Bas', message: 'Agent AG-LME-010 (Kodjo Agbéko) - Float restant: 75 000 XOF', read: true, createdAt: '2025-07-07T16:30:00Z' },
  { id: 'NOT-007', type: 'FRAUD_ALERT', title: 'Alerte Fraude', message: 'Tentative de dépôt au-delà du plafond KYC pour le client CLI-009', read: true, createdAt: '2025-07-06T11:00:00Z' },
  { id: 'NOT-008', type: 'KYC_EXPIRED', title: 'KYC Expiré', message: '3 documents KYC arrivent à expiration dans les 30 prochains jours', read: true, createdAt: '2025-07-05T08:00:00Z' },
  { id: 'NOT-009', type: 'SYSTEM', title: 'Nouvelle Version', message: 'La version 4.0 du back-office est disponible', read: true, createdAt: '2025-07-04T10:00:00Z' },
  { id: 'NOT-010', type: 'TRANSACTION_ALERT', title: 'Échec Transaction', message: '5 transactions ont échoué au cours des dernières 24h', read: true, createdAt: '2025-07-03T18:00:00Z' },
];
