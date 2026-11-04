export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export interface ProductInput {
  sku: string;
  name: string;
  price: number;
  stock: number;
  version: number;
}

export interface Product extends ProductInput {
  id: number;
  createdAt: string;
}

export interface OrderInput {
  productId: number;
  quantity: number;
  requestKey: string;
}

export interface PurchaseOrder extends OrderInput {
  id: string;
  unitPrice: number;
  total: number;
  createdAt: string;
}

export interface SystemInfo {
  application: string;
  database: string;
  cache: string;
  java: string;
  scope: string;
}

export interface CacheMetrics {
  requests: number;
  hits: number;
  misses: number;
  dbReads: number;
  negativeHits: number;
  cacheErrors: number;
  rejected: number;
}

export type CacheScenario = 'penetration' | 'breakdown' | 'avalanche' | 'outage';
export type LabMode = 'naive' | 'guarded';

export interface LabInput {
  scenario: CacheScenario;
  mode: LabMode;
  requests: number;
}

export interface LabResult {
  scenario: CacheScenario;
  mode: LabMode;
  cacheBackend: string;
  metrics: CacheMetrics;
  failedRequests: number;
  notFound: number;
  elapsedMs: number;
  seededTtlMs: number[];
  note: string;
}
