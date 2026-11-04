import { ref } from 'vue';
import type { LabApi } from '../api/lab';
import type { Page, Product, ProductInput } from '../types/domain';
import { emptyPage } from '../utils/pagination';
import type { Feedback } from './useFeedback';

function emptyDraft(): ProductInput {
  return { sku: '', name: '', price: 49.9, stock: 20, version: 0 };
}

export function useProducts(api: LabApi, feedback: Feedback, refreshMetrics: () => Promise<void>) {
  const page = ref<Page<Product>>(emptyPage());
  const options = ref<Product[]>([]);
  const query = ref('');
  const selectedId = ref<number | null>(null);
  const initialDraft = ref<ProductInput>(emptyDraft());

  async function load(nextPage = page.value.page, quiet = true) {
    page.value = await api.products.list(nextPage, page.value.size, query.value, quiet);
    options.value = (await api.products.list(0, 50)).items;
  }

  function resetDraft() {
    selectedId.value = null;
    initialDraft.value = emptyDraft();
  }

  function edit(product: Product) {
    selectedId.value = product.id;
    initialDraft.value = {
      sku: product.sku,
      name: product.name,
      price: product.price,
      stock: product.stock,
      version: product.version,
    };
  }

  function save(input: ProductInput) {
    return feedback.run(async () => {
      const editingId = selectedId.value;
      if (editingId !== null) {
        await api.products.update(editingId, input);
      } else {
        await api.products.create(input);
      }

      feedback.notice.value = editingId !== null
        ? '修改已保存。旧版本再次提交会返回 409。'
        : '商品已创建。';
      resetDraft();
      await load();
    });
  }

  async function remove(product: Product) {
    if (!window.confirm(`删除 ${product.name}？有订单引用的商品会返回 409。`)) return;
    await feedback.run(async () => {
      await api.products.remove(product.id);
      feedback.notice.value = '商品已删除';
      await load();
    });
  }

  function detail(product: Product) {
    return feedback.run(async () => {
      await api.products.detail(product.id);
      await refreshMetrics();
      feedback.notice.value = '商品详情请求已完成。再点一次，观察缓存命中与回源计数。';
    });
  }

  function search() {
    return feedback.run(() => load(0, false));
  }

  function changePage(nextPage: number) {
    return feedback.run(() => load(nextPage));
  }

  return { page, options, query, selectedId, initialDraft, load, resetDraft, edit, save, remove, detail, search, changePage };
}
