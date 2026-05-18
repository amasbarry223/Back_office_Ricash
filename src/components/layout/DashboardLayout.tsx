'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useRouterStore } from '@/stores/router-store';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentRoute = useRouterStore((s) => s.currentRoute);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1280;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    if (mobileMenuOpen) {
      requestAnimationFrame(() => setMobileMenuOpen(false));
    }
  }, [currentRoute, mobileMenuOpen]);

  // Scroll to top on route change
  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentRoute]);

  const desktopCollapsed = collapsed && !isMobile;
  const sidebarWidth = desktopCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)';

  const toggleCollapse = useCallback(() => {
    if (isMobile) {
      setMobileMenuOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  }, [isMobile]);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-screen ricash-bg">
        {/* Desktop sidebar */}
        {!isMobile && (
          <AppSidebar collapsed={desktopCollapsed} onToggleCollapse={toggleCollapse} />
        )}

        {/* Mobile sidebar overlay */}
        {isMobile && mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 z-40 transition-opacity"
              onClick={closeMobileMenu}
              aria-hidden="true"
            />
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 z-50">
              <AppSidebar collapsed={false} onToggleCollapse={closeMobileMenu} />
            </div>
          </>
        )}

        <div
          className="flex-1 flex flex-col min-h-screen transition-all duration-200"
          style={isMobile ? { marginLeft: 0 } : { marginLeft: sidebarWidth }}
        >
          <AppHeader onToggleSidebar={toggleCollapse} />
          <main className="flex-1 p-4 sm:p-6">
            {children}
          </main>
          <footer className="shrink-0 border-t border-border/50 px-6 py-3 text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} <span className="font-semibold" style={{ color: 'var(--ricash-primary)' }}>RICASH</span> — Back-Office v4.0 · Tous droits réservés
            </p>
          </footer>
        </div>
      </div>
    </TooltipProvider>
  );
}
