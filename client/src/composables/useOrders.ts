/** 订单状态与操作。管理分页记录、跨页面带入的商品和下单初值。 */
import { ref } from 'vue';
import type { LabApi } from '../api/lab';
import type { OrderInput, Page, Product, PurchaseOrder } from '../types/domain';
import { emptyPage } from '../utils/pagination';
import type { Feedback } from './useFeedback';

export function useOrders(api: LabApi, feedback: Feedback, refreshProducts: () => Promise<void>) {
  const page = ref<Page<PurchaseOrder>>(emptyPage());
  // 商品目录带来的选中项可能超出下拉候选范围，订单页需要这份数据补齐选项。
  const selectedProduct = ref<Product | null>(null);
  const initialOrder = ref<OrderInput>({ productId: 0, quantity: 1, requestKey: crypto.randomUUID() });

  /** 拉取目标页，默认刷新当前页。订单列表请求采用静默模式。 */
  async function load(nextPage = page.value.page) {
    page.value = await api.orders.list(nextPage, page.value.size);
  }

  /** 从商品行开启一次新的下单，默认数量为 1，并生成新的 requestKey。 */
  function selectProduct(product: Product) {
    selectedProduct.value = product;
    initialOrder.value = { productId: product.id, quantity: 1, requestKey: crypto.randomUUID() };
  }

  /** 候选首次可用时补默认商品，保留已经带入的选择。 */
  function setDefaultProduct(productId: number) {
    if (!initialOrder.value.productId) {
      initialOrder.value = { ...initialOrder.value, productId };
    }
  }

  /** 按表单传入的 requestKey 下单。响应成功后刷新商品库存和当前订单页。 */
  function place(input: OrderInput) {
    return feedback.run(async () => {
      const order = await api.orders.create(input);
      feedback.notice.value = `订单 ${order.id} 已返回；同一标识与内容重复发送会返回同一订单。`;
      await refreshProducts();
      await load();
    });
  }

  /** 通过共享 busy 和错误反馈加载目标订单页。 */
  function changePage(nextPage: number) {
    return feedback.run(() => load(nextPage));
  }

  return { page, selectedProduct, initialOrder, load, selectProduct, setDefaultProduct, place, changePage };
}
