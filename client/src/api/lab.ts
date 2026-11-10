/** 领域 API。为商品、订单、实验和环境查询绑定路径、方法与 DTO。 */
import type { ApiClient } from './client';
import type {
  CacheMetrics,
  LabInput,
  LabResult,
  OrderInput,
  Page,
  Product,
  ProductInput,
  PurchaseOrder,
  SystemInfo,
} from '../types/domain';

export function createLabApi(client: ApiClient) {
  return {
    // 布局的环境与指标查询在后台执行，保留用户主动操作的观察记录。
    system: () => client.request<SystemInfo>('/system', { quiet: true }),
    metrics: () => client.request<CacheMetrics>('/metrics/cache', { quiet: true }),
    products: {
      /** 页码从 0 开始。URLSearchParams 负责对用户输入的搜索词编码。 */
      list(page: number, size: number, query = '', quiet = true) {
        const params = new URLSearchParams({ page: String(page), size: String(size), q: query });
        return client.request<Page<Product>>(`/products?${params}`, { quiet });
      },
      detail: (id: number) => client.request<Product>(`/products/${id}`),
      create: (input: ProductInput) => client.request<Product>('/products', { method: 'POST', body: input }),
      /** 商品 ID 用于定位记录，input.version 用于并发更新检查。 */
      update: (id: number, input: ProductInput) =>
        client.request<Product>(`/products/${id}`, { method: 'PUT', body: input }),
      remove: (id: number) => client.request<{ deleted: number }>(`/products/${id}`, { method: 'DELETE' }),
    },
    orders: {
      list: (page: number, size: number) =>
        client.request<Page<PurchaseOrder>>(`/orders?page=${page}&size=${size}`, { quiet: true }),
      /** 使用调用方传入的 requestKey，重复提交时由后端判断能否重放。 */
      create: (input: OrderInput) => client.request<PurchaseOrder>('/orders', { method: 'POST', body: input }),
    },
    /** 每次调用执行一组实验，场景、策略与请求量由调用方指定。 */
    runLab: (input: LabInput) => client.request<LabResult>('/labs/cache/run', { method: 'POST', body: input }),
  };
}

export type LabApi = ReturnType<typeof createLabApi>;
