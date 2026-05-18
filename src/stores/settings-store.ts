import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  NotificationPreferences,
  AppearanceSettings,
  SystemSettings,
  AdminAgentSettings,
  AdminLimitSettings,
} from '@/types';

interface SettingsStore {
  // Notification preferences
  notifications: NotificationPreferences;
  updateNotifications: (updates: Partial<NotificationPreferences>) => void;

  // Appearance
  appearance: AppearanceSettings;
  updateAppearance: (updates: Partial<AppearanceSettings>) => void;

  // System settings (super_admin only)
  system: SystemSettings;
  updateSystem: (updates: Partial<SystemSettings>) => void;

  // Admin agent settings (admin only)
  adminAgent: AdminAgentSettings;
  updateAdminAgent: (updates: Partial<AdminAgentSettings>) => void;

  // Admin limit settings (admin only)
  adminLimits: AdminLimitSettings;
  updateAdminLimits: (updates: Partial<AdminLimitSettings>) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      // Notification preferences
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        inAppNotifications: true,
        fraudAlerts: true,
        lowFloatAlerts: true,
        kycExpiryAlerts: true,
        transactionAlerts: false,
        systemAlerts: true,
      },

      updateNotifications: (updates) => {
        set((state) => ({
          notifications: { ...state.notifications, ...updates },
        }));
      },

      // Appearance
      appearance: {
        theme: 'light',
        language: 'fr',
        compactMode: false,
      },

      updateAppearance: (updates) => {
        set((state) => ({
          appearance: { ...state.appearance, ...updates },
        }));
      },

      // System settings (super_admin only)
      system: {
        maintenanceMode: false,
        sessionTimeoutMinutes: 30,
        maxLoginAttempts: 5,
        autoLogoutMinutes: 15,
        auditLogEnabled: true,
        auditLogRetentionDays: 90,
      },

      updateSystem: (updates) => {
        set((state) => ({
          system: { ...state.system, ...updates },
        }));
      },

      // Admin agent settings (admin only)
      adminAgent: {
        defaultCommissionRate: 1.5,
        autoApproveFloat: false,
        autoApproveMaxAmount: 50000,
        floatAlertThreshold: 100000,
        notifyNewAgent: true,
      },

      updateAdminAgent: (updates) => {
        set((state) => ({
          adminAgent: { ...state.adminAgent, ...updates },
        }));
      },

      // Admin limit settings (admin only)
      adminLimits: {
        maxTransactionApproval: 2000000,
        maxDailyApproval: 10000000,
        maxFloatApproval: 500000,
        requireSecondApproval: true,
        secondApprovalThreshold: 500000,
      },

      updateAdminLimits: (updates) => {
        set((state) => ({
          adminLimits: { ...state.adminLimits, ...updates },
        }));
      },
    }),
    {
      name: 'ricash-settings',
    }
  )
);
