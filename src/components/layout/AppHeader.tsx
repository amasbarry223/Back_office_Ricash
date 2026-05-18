'use client';

import React, { useMemo } from 'react';
import { Menu, Bell, LogOut, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouterStore } from '@/stores/router-store';
import { useNotificationsStore } from '@/stores/notifications-store';
import { getInitials, roleLabel } from '@/lib/common';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppHeaderProps {
  onToggleSidebar?: () => void;
}

export default function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const breadcrumb = useRouterStore((s) => s.breadcrumb);
  const notifications = useNotificationsStore((s) => s.notifications);
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const navigate = useRouterStore((s) => s.navigate);

  return (
    <header
      className="sticky top-0 z-[100] h-16 ricash-header border-b border-border/50 flex items-center px-4 lg:px-6"
      style={{ backdropFilter: 'blur(8px)' }}
    >
      {/* Left side: Hamburger + Breadcrumb */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <Menu className="size-5" />
        </Button>

        {/* Breadcrumb */}
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Fil d&apos;Ariane" className="flex items-center gap-1 text-sm min-w-0">
            {breadcrumb.map((item, index) => (
              <React.Fragment key={`breadcrumb-${index}-${item.label}`}>
                {index > 0 && <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />}
                {item.route && index < breadcrumb.length - 1 ? (
                  <button
                    onClick={() => navigate(item.route!, item.params)}
                    className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[150px]"
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className="text-foreground font-medium truncate max-w-[200px]">
                    {item.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>

      {/* Right side: Notifications + User dropdown */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('notifications')}
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-[var(--ricash-danger)] text-white hover:bg-[var(--ricash-danger)] text-[10px] px-1 py-0 h-4 min-w-[16px] justify-center border-0">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* User Dropdown */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-accent/50">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-[var(--ricash-primary)] text-white text-xs font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium leading-tight">{user.name}</span>
                  <span className="text-[11px] text-muted-foreground leading-tight">{roleLabel(user.role)}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <Badge variant="secondary" className="w-fit text-[10px] mt-1">
                    {roleLabel(user.role)}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-[var(--ricash-danger)] focus:text-[var(--ricash-danger)] cursor-pointer"
              >
                <LogOut className="size-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
