'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  children?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, breadcrumb, children }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {/* Breadcrumb trail */}
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Fil d&apos;Ariane" className="flex items-center gap-1.5 text-sm mb-2">
          {breadcrumb.map((item, index) => (
            <React.Fragment key={`ph-bc-${index}-${item.label}`}>
              {index > 0 && <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />}
              {item.onClick && index < breadcrumb.length - 1 ? (
                <button
                  onClick={item.onClick}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </button>
              ) : (
                <span
                  className={
                    index === breadcrumb.length - 1
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                  }
                >
                  {item.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
      </div>
    </div>
  );
}
