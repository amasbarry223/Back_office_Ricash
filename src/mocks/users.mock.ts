import { Client, Admin } from '@/types';

export const mockClients: Client[] = [
  { id: 'CLI-001', phone: '+22370123456', firstName: 'Amadou', lastName: 'Traoré', country: 'ML', status: 'ACTIVE', kycLevel: 1, balance: 125000, createdAt: '2025-01-15', lastLogin: '2025-07-10T08:30:00Z' },
  { id: 'CLI-002', phone: '+22175987654', firstName: 'Fatou', lastName: 'Ndiaye', country: 'SN', status: 'SUSPENDED', kycLevel: 0, balance: 0, createdAt: '2025-02-20', lastLogin: '2025-06-15T14:22:00Z' },
  { id: 'CLI-003', phone: '+22507654321', firstName: 'Kouadio', lastName: 'Yao', country: 'CI', status: 'ACTIVE', kycLevel: 2, balance: 450000, createdAt: '2025-03-10', lastLogin: '2025-07-11T09:15:00Z' },
  { id: 'CLI-004', phone: '+22670891234', firstName: 'Mariam', lastName: 'Ouédraogo', country: 'BF', status: 'ACTIVE', kycLevel: 1, balance: 78000, createdAt: '2025-01-22', lastLogin: '2025-07-09T17:45:00Z' },
  { id: 'CLI-005', phone: '+22462134567', firstName: 'Ibrahima', lastName: 'Condé', country: 'GN', status: 'INACTIVE', kycLevel: 0, balance: 0, createdAt: '2025-04-05', lastLogin: '2025-05-20T10:00:00Z' },
  { id: 'CLI-006', phone: '+22371234567', firstName: 'Aïssata', lastName: 'Maïga', country: 'ML', status: 'ACTIVE', kycLevel: 2, balance: 230000, createdAt: '2025-02-14', lastLogin: '2025-07-11T07:20:00Z' },
  { id: 'CLI-007', phone: '+22176345678', firstName: 'Mamadou', lastName: 'Sow', country: 'SN', status: 'ACTIVE', kycLevel: 1, balance: 56000, createdAt: '2025-03-28', lastLogin: '2025-07-10T12:30:00Z' },
  { id: 'CLI-008', phone: '+22505234567', firstName: 'Awa', lastName: 'Diallo', country: 'CI', status: 'SUSPENDED', kycLevel: 1, balance: 12000, createdAt: '2025-01-30', lastLogin: '2025-06-28T16:40:00Z' },
  { id: 'CLI-009', phone: '+22780345678', firstName: 'Abdou', lastName: 'Moumouni', country: 'NE', status: 'ACTIVE', kycLevel: 0, balance: 35000, createdAt: '2025-05-12', lastLogin: '2025-07-08T09:55:00Z' },
  { id: 'CLI-010', phone: '+22890456789', firstName: 'Kofi', lastName: 'Agbéko', country: 'TG', status: 'ACTIVE', kycLevel: 2, balance: 670000, createdAt: '2025-02-08', lastLogin: '2025-07-11T11:10:00Z' },
  { id: 'CLI-011', phone: '+22991567890', firstName: 'Rachida', lastName: 'Adjo', country: 'BJ', status: 'ACTIVE', kycLevel: 1, balance: 145000, createdAt: '2025-04-18', lastLogin: '2025-07-10T15:25:00Z' },
  { id: 'CLI-012', phone: '+22372345678', firstName: 'Seydou', lastName: 'Keïta', country: 'ML', status: 'ACTIVE', kycLevel: 2, balance: 890000, createdAt: '2024-12-01', lastLogin: '2025-07-11T06:45:00Z' },
  { id: 'CLI-013', phone: '+22177456789', firstName: 'Ousmane', lastName: 'Fall', country: 'SN', status: 'INACTIVE', kycLevel: 0, balance: 0, createdAt: '2025-06-01', lastLogin: '2025-06-10T08:00:00Z' },
  { id: 'CLI-014', phone: '+22506345678', firstName: 'Yao', lastName: 'Kouamé', country: 'CI', status: 'ACTIVE', kycLevel: 1, balance: 210000, createdAt: '2025-03-15', lastLogin: '2025-07-09T14:30:00Z' },
  { id: 'CLI-015', phone: '+22671456789', firstName: 'Paul', lastName: 'Zoungrana', country: 'BF', status: 'ACTIVE', kycLevel: 2, balance: 340000, createdAt: '2025-01-05', lastLogin: '2025-07-11T10:00:00Z' },
  { id: 'CLI-016', phone: '+22463245678', firstName: 'Lansiné', lastName: 'Touré', country: 'GN', status: 'ACTIVE', kycLevel: 1, balance: 95000, createdAt: '2025-05-20', lastLogin: '2025-07-10T18:15:00Z' },
  { id: 'CLI-017', phone: '+22373456789', firstName: 'Djénéba', lastName: 'Sissoko', country: 'ML', status: 'SUSPENDED', kycLevel: 0, balance: 0, createdAt: '2025-04-10', lastLogin: '2025-05-30T20:00:00Z' },
  { id: 'CLI-018', phone: '+22178567890', firstName: 'Thierno', lastName: 'Ba', country: 'SN', status: 'ACTIVE', kycLevel: 2, balance: 520000, createdAt: '2024-11-20', lastLogin: '2025-07-11T13:50:00Z' },
  { id: 'CLI-019', phone: '+22507456789', firstName: 'Affoué', lastName: 'Koné', country: 'CI', status: 'ACTIVE', kycLevel: 1, balance: 76000, createdAt: '2025-06-15', lastLogin: '2025-07-10T07:30:00Z' },
  { id: 'CLI-020', phone: '+22672567890', firstName: 'Aboubacar', lastName: 'Sawadogo', country: 'BF', status: 'ACTIVE', kycLevel: 2, balance: 410000, createdAt: '2025-02-28', lastLogin: '2025-07-11T09:05:00Z' },
];

export const mockAdmins: Admin[] = [
  { id: 'ADM-001', email: 'superadmin@ricash.com', name: 'Moussa Konaté', role: 'super_admin', status: 'ACTIVE', createdAt: '2024-01-01', lastLogin: '2025-07-11T08:00:00Z', phone: '+22370000001' },
  { id: 'ADM-002', email: 'admin@ricash.com', name: 'Aminata Diallo', role: 'admin', status: 'ACTIVE', createdAt: '2024-03-15', lastLogin: '2025-07-11T07:30:00Z', phone: '+22176000001' },
  { id: 'ADM-003', email: 'admin2@ricash.com', name: 'Bakary Cissé', role: 'admin', status: 'ACTIVE', createdAt: '2024-06-20', lastLogin: '2025-07-10T16:45:00Z', phone: '+22370000002' },
  { id: 'ADM-004', email: 'admin3@ricash.com', name: 'Mariama Sow', role: 'admin', status: 'SUSPENDED', createdAt: '2024-09-10', lastLogin: '2025-05-15T10:20:00Z', phone: '+22176000002' },
  { id: 'ADM-005', email: 'superadmin2@ricash.com', name: 'Ibrahim Touré', role: 'super_admin', status: 'ACTIVE', createdAt: '2024-02-01', lastLogin: '2025-07-10T14:00:00Z', phone: '+22370000003' },
];
