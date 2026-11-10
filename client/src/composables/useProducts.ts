/** 商品状态与操作。维护筛选、分页、订单候选和表单初值，集中处理商品接口调用。 */
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
  // selectedId 决定保存时调用创建还是更新，initialDraft 用于初始化组件内的草稿。
  const selectedId = ref<number | null>(null);
  const initialDraft = ref<ProductInput>(emptyDraft());

  /**
   * 加载目标商品页。订单下拉候选另取未筛选列表的前 50 条。
   * quiet 控制列表请求是否覆盖观察窗，订单候选请求始终静默。
   */
  async function load(nextPage = page.value.page, quiet = true) {
    page.value = await api.products.list(nextPage, page.value.size, query.value, quiet);
    options.value = (await api.products.list(0, 50)).items;
  }

  /** 退出编辑并传入新的初值对象，触发表单重置。 */
  function resetDraft() {
    selectedId.value = null;
    initialDraft.value = emptyDraft();
  }

  /** 用当前行初始化编辑，携带服务端版本供更新接口检查。 */
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

  /** 保存成功后重置表单并刷新列表。写入失败时保留用户输入供修正。 */
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

  /** 用户确认后请求删除，订单引用冲突由后端返回。 */
  async function remove(product: Product) {
    if (!window.confirm(`删除 ${product.name}？有订单引用的商品会返回 409。`)) return;
    await feedback.run(async () => {
      await api.products.remove(product.id);
      feedback.notice.value = '商品已删除';
      await load();
    });
  }

  /** 读取商品详情以观察缓存行为，成功后静默刷新顶部指标。 */
  function detail(product: Product) {
    return feedback.run(async () => {
      await api.products.detail(product.id);
      await refreshMetrics();
      feedback.notice.value = '商品详情请求已完成。再点一次，观察缓存命中与回源计数。';
    });
  }

  /** 新搜索从第一页开始，并把这次主动查询放进观察窗。 */
  function search() {
    return feedback.run(() => load(0, false));
  }

  /** 使用分页组件提供的零基页码，沿用当前搜索词。 */
  function changePage(nextPage: number) {
    return feedback.run(() => load(nextPage));
  }

  return { page, options, query, selectedId, initialDraft, load, resetDraft, edit, save, remove, detail, search, changePage };
}
