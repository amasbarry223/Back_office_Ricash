---
Task ID: 1
Agent: Main Agent
Task: Refonte des composants de base - Button, Input, Card, Badge, Sidebar

Work Log:
- Explored entire codebase structure (47 UI components, 8 common components, 19 views)
- Read all existing component implementations
- Refactored Button component with 8 variants (primary, secondary, ghost, danger, outline, link + legacy default/destructive), 7 sizes (xs, sm, md, lg, icon, icon-sm, icon-xs), loading state with spinner, hover/active micro-interactions
- Refactored Input component with icon slots (iconLeft/iconRight), error state, FormField wrapper with label/helper/error text
- Refactored Card component with interactive variant (hover lift + shadow animation), proper padding structure
- Refactored Badge component with 6 semantic variants (success, warning, error, info, neutral, brand), pill shape, StatusDot component
- Refactored AppSidebar with animated active indicator bar, better hover states, ChevronLeft/Right toggle, ring on avatar
- Updated StatusBadge to use new Badge semantic variants
- Updated StatCard to use Card component with interactive prop and ring border
- Updated SearchBar to use Input iconLeft/iconRight props and Badge neutral variant
- Updated ConfirmDialog to use Button danger/primary variants and loading prop
- Updated DataTable pagination to use Button xs/primary/outline variants
- Updated AppHeader to use icon-sm, Badge error/brand variants
- Updated page.tsx error boundary button to use primary variant
- Updated all 15+ view files (LoginView, SettingsView, AdminsView, AdminDetailView, UnauthorizedView, NotFoundView, FloatRequestsView, ConfigView, AgentFloatView, AgentsView, AgentDetailView, UsersView, UserDetailView, DashboardView, TransactionsView, TransactionDetailView, KycView, KycDetailView, NotificationsView) to replace old button/badge patterns with new variants
- Fixed React.useId conditional hook lint error
- All lint checks pass, dev server compiles successfully

Stage Summary:
- 5 core components refactored: Button, Input, Card, Badge, Sidebar
- 3 common components updated: StatusBadge, StatCard, SearchBar
- 2 layout components updated: AppSidebar, AppHeader
- 2 utility components updated: ConfirmDialog, DataTable
- 15+ view files updated with new variant system
- New features: Button loading state, Input icon slots, Card interactive mode, Badge semantic variants, StatusDot, FormField
- Zero lint errors, zero compilation errors
