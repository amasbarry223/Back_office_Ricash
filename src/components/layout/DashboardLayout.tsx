'use client';

import React, { useState, useEffect } from 'react';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import { TooltipProvider } from '@/components/ui/tooltip';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1280);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const effectiveCollapsed = collapsed || isMobile;
  const sidebarWidth = effectiveCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)';

  const toggleCollapse = () => setCollapsed((prev) => !prev);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-screen ricash-bg">
        <AppSidebar collapsed={effectiveCollapsed} onToggleCollapse={toggleCollapse} />
        <div
          className="flex-1 flex flex-col min-h-screen transition-all duration-200"
          style={{ marginLeft: sidebarWidth }}
        >
          <AppHeader onToggleSidebar={toggleCollapse} />
          <main className="flex-1 p-4 sm:p-6" style={{ paddingTop: 'calc(var(--header-height, 64px) + 24px)' }}>
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
