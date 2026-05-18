'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Shield,
  UserCheck,
  Users,
  ArrowLeftRight,
  IdCard,
  Wallet,
  Settings,
  Cog,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouterStore } from '@/stores/router-store';
import { useKycStore } from '@/stores/kyc-store';
import { useAgentsStore } from '@/stores/agents-store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Role, RouteName } from '@/types';
import { getInitials, roleLabel, MOBILE_BREAKPOINT } from '@/lib/common';

// ─── Navigation Configuration ───────────────────────────────

interface NavItem {
  icon: React.ElementType;
  label: string;
  route: RouteName;
  roles: Role[];
  badge?: () => number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'NAVIGATION',
    items: [
      {
        icon: LayoutDashboard,
        label: 'Tableau de bord',
        route: 'dashboard',
        roles: ['super_admin', 'admin'],
      },
    ],
  },
  {
    title: 'UTILISATEURS',
    items: [
      {
        icon: Shield,
        label: 'Administration',
        route: 'admins',
        roles: ['super_admin'],
      },
      {
        icon: UserCheck,
        label: 'Agents',
        route: 'agents',
        roles: ['super_admin', 'admin'],
      },
      {
        icon: Users,
        label: 'Clients',
        route: 'clients',
        roles: ['super_admin', 'admin'],
      },
    ],
  },
  {
    title: 'OPÉRATIONS',
    items: [
      {
        icon: ArrowLeftRight,
        label: 'Transactions',
        route: 'transactions',
        roles: ['super_admin', 'admin'],
      },
      {
        icon: IdCard,
        label: 'KYC & Conformité',
        route: 'kyc',
        roles: ['super_admin', 'admin'],
        badge: () => useKycStore.getState().getPendingCount(),
      },
      {
        icon: Wallet,
        label: 'Gestion Float',
        route: 'float',
        roles: ['super_admin', 'admin'],
        badge: () => useAgentsStore.getState().getPendingRequestsCount(),
      },
    ],
  },
  {
    title: 'SYSTÈME',
    items: [
      {
        icon: Settings,
        label: 'Configuration',
        route: 'config',
        roles: ['super_admin'],
      },
      {
        icon: Bell,
        label: 'Notifications',
        route: 'notifications',
        roles: ['super_admin', 'admin'],
      },
    ],
  },
  {
    title: 'COMPTE',
    items: [
      {
        icon: Cog,
        label: 'Paramètres',
        route: 'settings',
        roles: ['super_admin', 'admin'],
      },
    ],
  },
];

// ─── Component ──────────────────────────────────────────────

interface AppSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function AppSidebar({ collapsed = false, onToggleCollapse }: AppSidebarProps) {
  const user = useAuthStore((s) => s.user);
  const canAccess = useAuthStore((s) => s.canAccess);
  const logout = useAuthStore((s) => s.logout);
  const currentRoute = useRouterStore((s) => s.currentRoute);
  const navigate = useRouterStore((s) => s.navigate);
  const kycRecords = useKycStore((s) => s.records);
  const floatRequests = useAgentsStore((s) => s.floatRequests);
  const kycPending = useMemo(() => kycRecords.filter(r => r.status === 'PENDING').length, [kycRecords]);
  const floatPending = useMemo(() => floatRequests.filter(r => r.status === 'PENDING').length, [floatRequests]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const effectiveCollapsed = collapsed || isMobile;
  const sidebarWidth = effectiveCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)';

  const handleNavigate = (route: RouteName) => {
    navigate(route);
  };

  const getBadgeCount = (item: NavItem): number => {
    if (!item.badge) return 0;
    if (item.route === 'kyc') return kycPending;
    if (item.route === 'float') return floatPending;
    return item.badge();
  };

  return (
    <aside
      className="fixed left-0 top-0 h-screen overflow-y-auto overflow-x-hidden ricash-sidebar ricash-sidebar-shadow ricash-scroll z-40 flex flex-col transition-all duration-300 ease-out"
      style={{ width: sidebarWidth }}
    >
      {/* ─── Logo Section ─── */}
      <div className="flex items-center h-16 px-4 shrink-0">
        {!effectiveCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-9 rounded-lg bg-white/10 ring-1 ring-white/10">
              <span className="text-ricash-accent font-bold text-lg">R</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg leading-tight tracking-wide">RICASH</span>
              <span className="text-white/40 text-[10px] leading-tight font-medium">v4.0</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <div className="flex items-center justify-center size-9 rounded-lg bg-white/10 ring-1 ring-white/10">
              <span className="text-ricash-accent font-bold text-lg">R</span>
            </div>
          </div>
        )}
      </div>

      <Separator className="bg-white/10 mx-3" />

      {/* ─── Navigation ─── */}
      <nav className="flex-1 py-4 px-2 space-y-5">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => canAccess(item.roles));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title}>
              {/* Group Header */}
              {!effectiveCollapsed && (
                <p className="px-3 mb-2 text-[10px] font-semibold text-white/35 uppercase tracking-[0.1em]">
                  {group.title}
                </p>
              )}

              {/* Nav Items */}
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentRoute === item.route;
                  const badgeCount = getBadgeCount(item);

                  const navButton = (
                    <button
                      key={`${item.label}-${item.route}`}
                      onClick={() => handleNavigate(item.route)}
                      className={`
                        group relative flex items-center w-full rounded-lg
                        transition-all duration-150 ease-out
                        ${effectiveCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}
                        ${
                          isActive
                            ? 'bg-white/[0.12] text-white'
                            : 'text-white/55 hover:text-white/90 hover:bg-white/[0.06]'
                        }
                      `}
                    >
                      {/* Active left accent bar */}
                      <span
                        className={`
                          absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full
                          transition-all duration-200 ease-out
                          ${isActive ? 'h-5 bg-ricash-accent indicator-slide-in' : 'h-0 bg-transparent'}
                        `}
                      />

                      {/* Icon */}
                      <Icon
                        className={`shrink-0 transition-colors duration-150
                          ${effectiveCollapsed ? 'size-5' : 'size-[18px] mr-3'}
                          ${isActive ? 'text-ricash-accent' : 'text-white/45 group-hover:text-white/80'}
                        `}
                      />

                      {/* Label + Badge */}
                      {!effectiveCollapsed && (
                        <>
                          <span className={`flex-1 text-left text-[13px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                            {item.label}
                          </span>
                          {badgeCount > 0 && (
                            <Badge
                              variant="brand"
                              className="text-[10px] px-1.5 py-0 h-5 min-w-[20px] justify-center font-semibold bg-ricash-accent text-white border-ricash-accent/80 hover:bg-ricash-accent/90"
                            >
                              {badgeCount}
                            </Badge>
                          )}
                        </>
                      )}

                      {/* Collapsed badge dot */}
                      {effectiveCollapsed && badgeCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-ricash-accent ring-2 ring-[var(--ricash-sidebar-bg)] dot-pulse" />
                      )}
                    </button>
                  );

                  if (effectiveCollapsed) {
                    return (
                      <div key={`${item.label}-${item.route}`} className="relative">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {navButton}
                          </TooltipTrigger>
                          <TooltipContent side="right" sideOffset={8} className="font-medium">
                            {item.label}
                            {badgeCount > 0 && (
                              <Badge className="ml-2 bg-ricash-accent text-white hover:bg-ricash-accent/90 text-[10px] px-1.5 py-0 h-5 border-0">
                                {badgeCount}
                              </Badge>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    );
                  }

                  return (
                    <div key={`${item.label}-${item.route}`} className="relative">
                      {navButton}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ─── Collapse Toggle (desktop only) ─── */}
      {!isMobile && (
        <div className="px-2 mb-2">
          <button
            onClick={onToggleCollapse}
            className="flex items-center justify-center w-full py-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all duration-150"
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>
        </div>
      )}

      {/* ─── User Profile (pinned to bottom) ─── */}
      {user && (
        <>
          <Separator className="bg-white/10 mx-3" />
          <div className={`shrink-0 p-3 ${effectiveCollapsed ? 'flex flex-col items-center' : 'flex items-center gap-3'}`}>
            <Avatar className="size-9 shrink-0 ring-2 ring-white/10">
              <AvatarFallback className="bg-ricash-accent text-white text-xs font-bold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            {!effectiveCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                <p className="text-white/40 text-xs truncate">{roleLabel(user.role)}</p>
              </div>
            )}
            {!effectiveCollapsed && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={logout}
                className="text-white/30 hover:text-white hover:bg-white/10 shrink-0"
              >
                <LogOut className="size-4" />
              </Button>
            )}
            {effectiveCollapsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={logout}
                    className="text-white/30 hover:text-white hover:bg-white/10 mt-2"
                  >
                    <LogOut className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>Déconnexion</TooltipContent>
              </Tooltip>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
