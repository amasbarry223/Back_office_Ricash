import type { Agent } from '@/types';

/** Seuil float bas (XOF) — aligné avec l'affichage tableau */
export const LOW_FLOAT_THRESHOLD = 200_000;

export type AgentQuickFilter = 'all' | 'approved' | 'pending' | 'suspended' | 'low_float';

export interface AgentStats {
  total: number;
  approved: number;
  pending: number;
  suspended: number;
  lowFloat: number;
}

export function computeAgentStats(agents: Agent[]): AgentStats {
  return {
    total: agents.length,
    approved: agents.filter((a) => a.status === 'APPROVED').length,
    pending: agents.filter((a) => a.status === 'PENDING').length,
    suspended: agents.filter((a) => a.status === 'SUSPENDED').length,
    lowFloat: agents.filter((a) => a.floatBalance < LOW_FLOAT_THRESHOLD).length,
  };
}

export function filterAgents(
  agents: Agent[],
  query: string,
  quickFilter: AgentQuickFilter,
): Agent[] {
  let result = [...agents];

  switch (quickFilter) {
    case 'approved':
      result = result.filter((a) => a.status === 'APPROVED');
      break;
    case 'pending':
      result = result.filter((a) => a.status === 'PENDING');
      break;
    case 'suspended':
      result = result.filter((a) => a.status === 'SUSPENDED');
      break;
    case 'low_float':
      result = result.filter((a) => a.floatBalance < LOW_FLOAT_THRESHOLD);
      break;
    default:
      break;
  }

  const q = query.trim().toLowerCase();
  if (!q) return result;

  return result.filter(
    (a) =>
      a.code.toLowerCase().includes(q) ||
      a.firstName.toLowerCase().includes(q) ||
      a.lastName.toLowerCase().includes(q) ||
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
      a.phone.toLowerCase().includes(q),
  );
}
