import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser, Role } from '@/types';

const MOCK_USERS = [
  { id: 'ADM-001', email: 'superadmin@ricash.com', role: 'super_admin' as Role, name: 'Moussa Konaté', avatar: null },
  { id: 'ADM-002', email: 'admin@ricash.com', role: 'admin' as Role, name: 'Aminata Diallo', avatar: null },
];

const DEFAULT_PASSWORDS: Record<string, string> = {
  'superadmin@ricash.com': 'ricash2025',
  'admin@ricash.com': 'ricash2025',
};

const RESET_CODE_TTL_MS = 15 * 60 * 1000;

export interface PasswordResetRequest {
  email: string;
  code: string;
  expiresAt: number;
}

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  mockPasswords: Record<string, string>;
  passwordReset: PasswordResetRequest | null;
  forgotPasswordLoading: boolean;
  forgotPasswordError: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  requestPasswordReset: (email: string) => Promise<boolean>;
  confirmPasswordReset: (email: string, code: string, newPassword: string) => Promise<boolean>;
  clearForgotPasswordFlow: () => void;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  canAccess: (allowedRoles: Role[]) => boolean;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function generateResetCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getPasswordForEmail(email: string, mockPasswords: Record<string, string>): string | undefined {
  const key = normalizeEmail(email);
  return mockPasswords[key] ?? DEFAULT_PASSWORDS[key];
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      mockPasswords: { ...DEFAULT_PASSWORDS },
      passwordReset: null,
      forgotPasswordLoading: false,
      forgotPasswordError: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        await new Promise((resolve) => setTimeout(resolve, 800));

        const normalizedEmail = normalizeEmail(email);
        const mockUser = MOCK_USERS.find((u) => u.email === normalizedEmail);
        const expectedPassword = getPasswordForEmail(normalizedEmail, get().mockPasswords);

        if (mockUser && expectedPassword === password) {
          set({
            user: mockUser as AuthUser,
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

      requestPasswordReset: async (email: string) => {
        const normalizedEmail = normalizeEmail(email);
        set({ forgotPasswordLoading: true, forgotPasswordError: null });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const userExists = MOCK_USERS.some((u) => u.email === normalizedEmail);

        if (!userExists) {
          set({
            forgotPasswordLoading: false,
            forgotPasswordError: 'Aucun compte administrateur associé à cette adresse email.',
          });
          return false;
        }

        const code = generateResetCode();
        set({
          passwordReset: {
            email: normalizedEmail,
            code,
            expiresAt: Date.now() + RESET_CODE_TTL_MS,
          },
          forgotPasswordLoading: false,
          forgotPasswordError: null,
        });
        return true;
      },

      confirmPasswordReset: async (email: string, code: string, newPassword: string) => {
        const normalizedEmail = normalizeEmail(email);
        const trimmedCode = code.trim();
        set({ forgotPasswordLoading: true, forgotPasswordError: null });

        await new Promise((resolve) => setTimeout(resolve, 800));

        const { passwordReset, mockPasswords } = get();

        if (!passwordReset || passwordReset.email !== normalizedEmail) {
          set({
            forgotPasswordLoading: false,
            forgotPasswordError: 'Demande expirée ou invalide. Veuillez recommencer.',
          });
          return false;
        }

        if (Date.now() > passwordReset.expiresAt) {
          set({
            passwordReset: null,
            forgotPasswordLoading: false,
            forgotPasswordError: 'Le code a expiré. Demandez un nouveau code.',
          });
          return false;
        }

        if (passwordReset.code !== trimmedCode) {
          set({
            forgotPasswordLoading: false,
            forgotPasswordError: 'Code de vérification incorrect.',
          });
          return false;
        }

        if (newPassword.length < 8) {
          set({
            forgotPasswordLoading: false,
            forgotPasswordError: 'Le mot de passe doit contenir au moins 8 caractères.',
          });
          return false;
        }

        set({
          mockPasswords: {
            ...mockPasswords,
            [normalizedEmail]: newPassword,
          },
          passwordReset: null,
          forgotPasswordLoading: false,
          forgotPasswordError: null,
        });
        return true;
      },

      clearForgotPasswordFlow: () => {
        set({
          passwordReset: null,
          forgotPasswordLoading: false,
          forgotPasswordError: null,
        });
      },

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
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        mockPasswords: state.mockPasswords,
      }),
    }
  )
);
