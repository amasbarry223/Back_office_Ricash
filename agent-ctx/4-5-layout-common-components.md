# Task 4-5: Layout & Common Components Builder

## Agent: Layout & Common Components Builder
## Status: COMPLETED

## Work Done
Created 10 components (3 layout + 7 common) for the Ricash back-office dashboard.

### Files Created
1. `src/components/layout/AppSidebar.tsx` — Fixed sidebar with RBAC nav, badges, collapse
2. `src/components/layout/AppHeader.tsx` — Sticky header with breadcrumb, notifications, user menu
3. `src/components/layout/DashboardLayout.tsx` — Main layout wrapper
4. `src/components/common/StatusBadge.tsx` — Status badge component
5. `src/components/common/StatCard.tsx` — KPI metric card
6. `src/components/common/DataTable.tsx` — Data table with sort/pagination/export
7. `src/components/common/SearchBar.tsx` — Search with filters
8. `src/components/common/PageHeader.tsx` — Page header with breadcrumb
9. `src/components/common/RoleGuard.tsx` — RBAC guard
10. `src/components/common/EmptyState.tsx` — Empty state display

### Store Dependencies
- auth-store: canAccess(), user, logout
- router-store: currentRoute, navigate, breadcrumb
- notifications-store: getUnreadCount()
- kyc-store: getPendingCount()
- agents-store: getPendingRequestsCount()

### Lint: PASSED
### Dev Server: Compiling successfully
