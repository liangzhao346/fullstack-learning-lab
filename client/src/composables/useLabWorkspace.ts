import { computed, inject, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue';
import type { InjectionKey } from 'vue';
import { createApiClient } from '../api/client';
import { createLabApi } from '../api/lab';
import { navigationItems } from '../config/navigation';
import type { Product } from '../types/domain';
import type { RequestTrace } from '../types/http';
import type { TabId } from '../types/navigation';
import { useCacheLabs } from './useCacheLabs';
import { useFeedback } from './useFeedback';
import { useOrders } from './useOrders';
import { useProducts } from './useProducts';
import { useSystem } from './useSystem';

function createLabWorkspace() {
  const tab = ref<TabId>('products');
  const trace = ref<RequestTrace | null>(null);
  const title = computed(() => navigationItems.find((item) => item.id === tab.value)?.label ?? 'Fullstack Lab');
  const client = createApiClient((value) => { trace.value = value; });
  const api = createLabApi(client);
  const feedback = useFeedback();
  const system = useSystem(api);
  const products = useProducts(api, feedback, system.loadMetrics);
  const orders = useOrders(api, feedback, () => products.load());
  const labs = useCacheLabs(api, feedback);

  watch(products.options, (options) => {
    const first = options[0];
    if (first) orders.setDefaultProduct(first.id);
  });

  function selectTab(value: TabId) {
    tab.value = value;
    feedback.clear();
  }

  function startOrder(product: Product) {
    orders.selectProduct(product);
    selectTab('orders');
  }

  function refresh() {
    return feedback.run(async () => {
      await system.load();
      await products.load();
      await orders.load();
      await system.loadMetrics();
    });
  }

  return { tab, title, trace, feedback, system, products, orders, labs, selectTab, startOrder, refresh };
}

type LabWorkspace = ReturnType<typeof createLabWorkspace>;
const workspaceKey: InjectionKey<LabWorkspace> = Symbol('lab-workspace');

export function provideLabWorkspace(): LabWorkspace {
  const workspace = createLabWorkspace();
  provide(workspaceKey, workspace);
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;
  let attempts = 0;

  async function connect() {
    await workspace.refresh();
    if (!stopped && !workspace.system.info.value && attempts < 12) {
      attempts += 1;
      retryTimer = setTimeout(() => { void connect(); }, 1500);
    }
  }

  onMounted(() => { void connect(); });
  onBeforeUnmount(() => {
    stopped = true;
    if (retryTimer !== undefined) clearTimeout(retryTimer);
  });

  return workspace;
}

export function useLabWorkspace(): LabWorkspace {
  const workspace = inject(workspaceKey);
  if (!workspace) throw new Error('学习工作区尚未初始化');
  return workspace;
}
