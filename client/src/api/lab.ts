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
    system: () => client.request<SystemInfo>('/system', { quiet: true }),
    metrics: () => client.request<CacheMetrics>('/metrics/cache', { quiet: true }),
    products: {
      list(page: number, size: number, query = '', quiet = true) {
        const params = new URLSearchParams({ page: String(page), size: String(size), q: query });
        return client.request<Page<Product>>(`/products?${params}`, { quiet });
      },
      detail: (id: number) => client.request<Product>(`/products/${id}`),
      create: (input: ProductInput) => client.request<Product>('/products', { method: 'POST', body: input }),
      update: (id: number, input: ProductInput) =>
        client.request<Product>(`/products/${id}`, { method: 'PUT', body: input }),
      remove: (id: number) => client.request<{ deleted: number }>(`/products/${id}`, { method: 'DELETE' }),
    },
    orders: {
      list: (page: number, size: number) =>
        client.request<Page<PurchaseOrder>>(`/orders?page=${page}&size=${size}`, { quiet: true }),
      create: (input: OrderInput) => client.request<PurchaseOrder>('/orders', { method: 'POST', body: input }),
    },
    runLab: (input: LabInput) => client.request<LabResult>('/labs/cache/run', { method: 'POST', body: input }),
  };
}

export type LabApi = ReturnType<typeof createLabApi>;
