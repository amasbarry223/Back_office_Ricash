import { create } from 'zustand';
import { Agent, AgentStatus, FloatRequest, FloatMovement } from '@/types';
import { mockAgents, mockFloatRequests, mockFloatMovements } from '@/mocks/agents.mock';

// Valid status transitions for agents
const VALID_AGENT_TRANSITIONS: Record<AgentStatus, AgentStatus[]> = {
  PENDING: ['APPROVED'],
  APPROVED: ['SUSPENDED'],
  SUSPENDED: ['APPROVED'],
};

interface AgentsStore {
  agents: Agent[];
  floatRequests: FloatRequest[];
  floatMovements: FloatMovement[];
  // Actions agents
  updateAgentStatus: (id: string, status: AgentStatus) => void;
  approveAgent: (id: string, commissionRate: number) => void;
  getAgentById: (id: string) => Agent | undefined;
  updateAgentFloat: (id: string, amount: number) => void;
  // Actions float requests
  approveFloatRequest: (id: string, processedBy: string) => void;
  rejectFloatRequest: (id: string, processedBy: string, comment: string) => void;
  createFloatRequest: (request: Omit<FloatRequest, 'id' | 'status' | 'requestedAt'>) => void;
  // Actions float movements
  addFloatMovement: (movement: Omit<FloatMovement, 'id' | 'createdAt'>) => void;
  getMovementsByAgent: (agentId: string) => FloatMovement[];
  getRequestsByAgent: (agentId: string) => FloatRequest[];
  getPendingRequestsCount: () => number;
}

export const useAgentsStore = create<AgentsStore>((set, get) => ({
  agents: [...mockAgents],
  floatRequests: [...mockFloatRequests],
  floatMovements: [...mockFloatMovements],

  updateAgentStatus: (id, status) => {
    const agent = get().agents.find(a => a.id === id);
    if (!agent) return;
    // Guard: validate status transition
    const allowed = VALID_AGENT_TRANSITIONS[agent.status];
    if (!allowed || !allowed.includes(status)) return;

    set(state => ({
      agents: state.agents.map(a => a.id === id ? { ...a, status } : a),
    }));
  },

  approveAgent: (id, commissionRate) => {
    const agent = get().agents.find(a => a.id === id);
    // Guard: only PENDING agents can be approved
    if (!agent || agent.status !== 'PENDING') return;
    // Guard: commission rate must be between 0.1 and 100
    if (commissionRate < 0.1 || commissionRate > 100) return;

    set(state => ({
      agents: state.agents.map(a =>
        a.id === id ? { ...a, status: 'APPROVED' as AgentStatus, commissionRate } : a
      ),
    }));
  },

  getAgentById: (id) => {
    return get().agents.find(a => a.id === id);
  },

  updateAgentFloat: (id, amount) => {
    set(state => ({
      agents: state.agents.map(a =>
        a.id === id ? { ...a, floatBalance: Math.max(0, a.floatBalance + amount) } : a
      ),
    }));
  },

  approveFloatRequest: (id, processedBy) => {
    const request = get().floatRequests.find(r => r.id === id);
    // Guard: only PENDING requests can be approved (prevents double-approval)
    if (!request || request.status !== 'PENDING') return;

    // Single atomic set: update request + credit agent + add movement all at once
    set(state => {
      const agent = state.agents.find(a => a.id === request.agentId);
      if (!agent) return state;

      return {
        floatRequests: state.floatRequests.map(r =>
          r.id === id ? { ...r, status: 'APPROVED' as const, processedAt: new Date().toISOString(), processedBy } : r
        ),
        agents: state.agents.map(a =>
          a.id === request.agentId ? { ...a, floatBalance: Math.max(0, a.floatBalance + request.amount) } : a
        ),
        floatMovements: [
          ...state.floatMovements,
          {
            id: `FM-${String(state.floatMovements.length + 1).padStart(3, '0')}`,
            agentId: request.agentId,
            type: 'CREDIT' as const,
            amount: request.amount,
            description: `Approbation demande float ${id}`,
            createdBy: processedBy,
            createdAt: new Date().toISOString(),
          },
        ],
      };
    });
  },

  rejectFloatRequest: (id, processedBy, comment) => {
    const request = get().floatRequests.find(r => r.id === id);
    // Guard: only PENDING requests can be rejected
    if (!request || request.status !== 'PENDING') return;

    set(state => ({
      floatRequests: state.floatRequests.map(r =>
        r.id === id ? { ...r, status: 'REJECTED' as const, processedAt: new Date().toISOString(), processedBy, comment } : r
      ),
    }));
  },

  createFloatRequest: (requestData) => {
    // Guard: amount must be positive
    if (!requestData.amount || requestData.amount <= 0) return;

    const newRequest: FloatRequest = {
      ...requestData,
      id: `FLR-${String(get().floatRequests.length + 1).padStart(3, '0')}`,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
    };
    set(state => ({ floatRequests: [...state.floatRequests, newRequest] }));
  },

  addFloatMovement: (movementData) => {
    const newMovement: FloatMovement = {
      ...movementData,
      id: `FM-${String(get().floatMovements.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };
    set(state => ({ floatMovements: [...state.floatMovements, newMovement] }));
  },

  getMovementsByAgent: (agentId) => {
    return get().floatMovements.filter(m => m.agentId === agentId);
  },

  getRequestsByAgent: (agentId) => {
    return get().floatRequests.filter(r => r.agentId === agentId);
  },

  getPendingRequestsCount: () => {
    return get().floatRequests.filter(r => r.status === 'PENDING').length;
  },
}));
