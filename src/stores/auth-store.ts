import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser, Role } from '@/types';

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  canAccess: (allowedRoles: Role[]) => boolean;
}

const MOCK_USERS = [
  { id: 'ADM-001', email: 'superadmin@ricash.com', password: 'ricash2025', role: 'super_admin' as Role, name: 'Moussa Konaté', avatar: null },
  { id: 'ADM-002', email: 'admin@ricash.com', password: 'ricash2025', role: 'admin' as Role, name: 'Aminata Diallo', avatar: null },
];

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 800));

        const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password);

        if (mockUser) {
          const { password: _, ...userData } = mockUser;
          set({
            user: userData as AuthUser,
            token: `mock-jwt-${Date.now()}`,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          set({
            isLoading: false,
            error: 'Identifiants incorrects. Veuillez réessayer.',
          });
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      isSuperAdmin: () => get().user?.role === 'super_admin',

      isAdmin: () => {
        const role = get().user?.role;
        return role === 'admin' || role === 'super_admin';
      },

      canAccess: (allowedRoles: Role[]) => {
        const userRole = get().user?.role;
        return userRole ? allowedRoles.includes(userRole) : false;
      },
    }),
    {
      name: 'ricash-auth',
    }
  )
);
