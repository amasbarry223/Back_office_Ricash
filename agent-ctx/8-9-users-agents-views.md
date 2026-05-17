# Task 8-9: Users & Agents Views Builder

## Agent: Users & Agents Views Builder
## Status: COMPLETED

## Work Done
Created 5 view components for the Users (Clients) and Agents sections of the Ricash back-office.

### Files Created
1. `src/views/users/UsersView.tsx` — Clients list page with search, filters, DataTable, and actions dropdown
2. `src/views/users/UserDetailView.tsx` — Client detail full page with 5 tabs (Info, Wallet, Transactions, KYC, Activity)
3. `src/views/agents/AgentsView.tsx` — Agents list page with search, status filter, DataTable, and actions dropdown
4. `src/views/agents/AgentDetailView.tsx` — Agent detail full page with 4 tabs (Profile, Float, Transactions, KYC)
5. `src/views/agents/AgentFloatView.tsx` — Agent float management full page with recap, request form, request history, movement history

### Store Dependencies
- users-store: getClientById, updateClientStatus, updateClientKyc
- agents-store: getAgentById, updateAgentStatus, approveAgent, floatMovements, floatRequests, createFloatRequest
- transactions-store: transactions (filtered by clientId/agentId)
- kyc-store: records (filtered by clientId)
- auth-store: user (for requestedBy in float requests)
- router-store: navigate, goBack, params

### Key Rules Followed
- ALL UI text in FRENCH
- NEVER shows "Supprimer" (delete) — only Suspend/Activate/Reactivate/Approve
- NEVER uses "Tous" as default filter — descriptive placeholders
- Detail pages are FULL PAGES (not modals) — use router store navigate()
- RoleGuard on ALL sensitive actions (admin+ roles)
- No geographic filter for agents list (per specification rules)

### Lint: PASSED (0 errors, 0 warnings)
### Dev Server: Compiling successfully
