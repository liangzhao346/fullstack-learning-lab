/** 工作区装配。为每个应用实例创建共享状态，并协调导航、初始化和跨页面操作。 */
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
  // 请求客户端通过回调写入 trace，布局中的观察窗消费这份状态。
  const client = createApiClient((value) => { trace.value = value; });
  const api = createLabApi(client);
  const feedback = useFeedback();
  const system = useSystem(api);
  const products = useProducts(api, feedback, system.loadMetrics);
  const orders = useOrders(api, feedback, () => products.load());
  const labs = useCacheLabs(api, feedback);

  // 候选加载后为尚未选商品的订单表单设置默认项。
  watch(products.options, (options) => {
    const first = options[0];
    if (first) orders.setDefaultProduct(first.id);
  });

  /** 切换页面并清掉上一页的操作提示。 */
  function selectTab(value: TabId) {
    tab.value = value;
    feedback.clear();
  }

  /** 从商品行带入下单初值，再打开订单页。提交由订单表单发起。 */
  function startOrder(product: Product) {
    orders.selectProduct(product);
    selectTab('orders');
  }

  /** 启动和手动刷新共用这条链路。先确认环境，再依次加载业务列表和指标。 */
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

/** 由根组件在 setup 中调用，向布局和各页面提供同一份工作区。 */
export function provideLabWorkspace(): LabWorkspace {
  const workspace = createLabWorkspace();
  provide(workspaceKey, workspace);
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;
  let attempts = 0;

  // 后端启动可能较慢。系统信息仍为空时，每隔 1.5 秒重试，最多追加 12 次。
  async function connect() {
    await workspace.refresh();
    if (!stopped && !workspace.system.info.value && attempts < 12) {
      attempts += 1;
      retryTimer = setTimeout(() => { void connect(); }, 1500);
    }
  }

  onMounted(() => { void connect(); });
  // 卸载时取消已排队的重试，并阻止仍在等待的请求结束后再启动定时器。
  onBeforeUnmount(() => {
    stopped = true;
    if (retryTimer !== undefined) clearTimeout(retryTimer);
  });

  return workspace;
}

/** 页面与布局在 setup 中读取工作区。缺少根组件提供的实例属于装配错误。 */
export function useLabWorkspace(): LabWorkspace {
  const workspace = inject(workspaceKey);
  if (!workspace) throw new Error('学习工作区尚未初始化');
  return workspace;
}
