import { create } from 'zustand';
import { Client, Admin, UserStatus, KycLevel } from '@/types';
import { mockClients, mockAdmins } from '@/mocks/users.mock';

interface UsersStore {
  clients: Client[];
  admins: Admin[];
  // Actions clients
  updateClientStatus: (id: string, status: UserStatus) => void;
  updateClientKyc: (id: string, level: KycLevel) => void;
  getClientById: (id: string) => Client | undefined;
  // Actions admins
  updateAdminStatus: (id: string, status: UserStatus) => void;
  getAdminById: (id: string) => Admin | undefined;
  createAdmin: (admin: Omit<Admin, 'id' | 'createdAt'>) => void;
}

export const useUsersStore = create<UsersStore>((set, get) => ({
  clients: [...mockClients],
  admins: [...mockAdmins],

  updateClientStatus: (id, status) => {
    set(state => ({
      clients: state.clients.map(c => c.id === id ? { ...c, status } : c),
    }));
  },

  updateClientKyc: (id, level) => {
    set(state => ({
      clients: state.clients.map(c => c.id === id ? { ...c, kycLevel: level } : c),
    }));
  },

  getClientById: (id) => {
    return get().clients.find(c => c.id === id);
  },

  updateAdminStatus: (id, status) => {
    set(state => ({
      admins: state.admins.map(a => a.id === id ? { ...a, status } : a),
    }));
  },

  getAdminById: (id) => {
    return get().admins.find(a => a.id === id);
  },

  createAdmin: (adminData) => {
    const newAdmin: Admin = {
      ...adminData,
      id: `ADM-${String(get().admins.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    set(state => ({ admins: [...state.admins, newAdmin] }));
  },
}));
