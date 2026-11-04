import { ref } from 'vue';
import type { LabApi } from '../api/lab';
import type { OrderInput, Page, Product, PurchaseOrder } from '../types/domain';
import { emptyPage } from '../utils/pagination';
import type { Feedback } from './useFeedback';

export function useOrders(api: LabApi, feedback: Feedback, refreshProducts: () => Promise<void>) {
  const page = ref<Page<PurchaseOrder>>(emptyPage());
  const selectedProduct = ref<Product | null>(null);
  const initialOrder = ref<OrderInput>({ productId: 0, quantity: 1, requestKey: crypto.randomUUID() });

  async function load(nextPage = page.value.page) {
    page.value = await api.orders.list(nextPage, page.value.size);
  }

  function selectProduct(product: Product) {
    selectedProduct.value = product;
    initialOrder.value = { productId: product.id, quantity: 1, requestKey: crypto.randomUUID() };
  }

  function setDefaultProduct(productId: number) {
    if (!initialOrder.value.productId) {
      initialOrder.value = { ...initialOrder.value, productId };
    }
  }

  function place(input: OrderInput) {
    return feedback.run(async () => {
      const order = await api.orders.create(input);
      feedback.notice.value = `订单 ${order.id} 已返回；同一标识与内容重复发送会返回同一订单。`;
      await refreshProducts();
      await load();
    });
  }

  function changePage(nextPage: number) {
    return feedback.run(() => load(nextPage));
  }

  return { page, selectedProduct, initialOrder, load, selectProduct, setDefaultProduct, place, changePage };
}
