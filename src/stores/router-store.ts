import { create } from 'zustand';
import { RouteName, BreadcrumbItem } from '@/types';

interface RouterStore {
  currentRoute: RouteName;
  params: Record<string, string>;
  breadcrumb: BreadcrumbItem[];
  navigate: (route: RouteName, params?: Record<string, string>, breadcrumb?: BreadcrumbItem[]) => void;
  goBack: () => void;
  history: Array<{ route: RouteName; params: Record<string, string>; breadcrumb: BreadcrumbItem[] }>;
}

export const useRouterStore = create<RouterStore>((set, get) => ({
  currentRoute: 'login',
  params: {},
  breadcrumb: [],
  history: [],

  navigate: (route, params = {}, breadcrumb = []) => {
    const { currentRoute, params: currentParams, breadcrumb: currentBreadcrumb, history } = get();
    // Sauvegarder l'état actuel dans l'historique
    const newHistory = [...history, { route: currentRoute, params: currentParams, breadcrumb: currentBreadcrumb }];
    // Limiter l'historique à 50 entrées
    if (newHistory.length > 50) newHistory.shift();

    set({
      currentRoute: route,
      params,
      breadcrumb,
      history: newHistory,
    });
  },

  goBack: () => {
    const { history } = get();
    if (history.length > 0) {
      const lastEntry = history[history.length - 1];
      set({
        currentRoute: lastEntry.route,
        params: lastEntry.params,
        breadcrumb: lastEntry.breadcrumb,
        history: history.slice(0, -1),
      });
    }
  },
}));

// Helper pour construire les breadcrumbs
export function buildBreadcrumb(items: Array<{ label: string; route?: RouteName; params?: Record<string, string> }>): BreadcrumbItem[] {
  return items.map(item => ({
    label: item.label,
    route: item.route,
    params: item.params,
  }));
}
