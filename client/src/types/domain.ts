/** 业务接口 DTO。字段与后端 Domain、系统信息和缓存实验响应对应。 */

/** 列表分页响应。total 为符合当前查询的记录总数。 */
export interface Page<T> {
  items: T[];
  total: number;
  /** 从 0 开始的接口页码。 */
  page: number;
  size: number;
}

/** 新建和更新商品共用的请求体。 */
export interface ProductInput {
  sku: string;
  name: string;
  price: number;
  stock: number;
  /** 新建表单初值为 0，编辑时携带读取商品时的版本。 */
  version: number;
}

/** 后端返回的商品，包含记录 ID 和创建时间。 */
export interface Product extends ProductInput {
  id: number;
  createdAt: string;
}

/** 下单请求体。金额由服务端按商品价格计算。 */
export interface OrderInput {
  productId: number;
  quantity: number;
  /** 同一次下单的重放应沿用此标识与原请求内容。 */
  requestKey: string;
}

/** 已创建或重放返回的订单，unitPrice 和 total 来自服务端。 */
export interface PurchaseOrder extends OrderInput {
  id: string;
  unitPrice: number;
  total: number;
  createdAt: string;
}

/** 当前后端进程提供的运行环境信息。 */
export interface SystemInfo {
  application: string;
  database: string;
  cache: string;
  java: string;
  scope: string;
}

/** CacheReader 计数。业务指标与单组实验分别维护各自的一份。 */
export interface CacheMetrics {
  requests: number;
  /** 包含命中缺失标记和等锁后再次读取时的命中。 */
  hits: number;
  /** 首次缓存查询返回空的次数，后续可能等到其他线程填充。 */
  misses: number;
  /** 进入数据库回源分支的次数，实验预热查询另计。 */
  dbReads: number;
  /** 命中「商品不存在」标记的次数，已计入 hits。 */
  negativeHits: number;
  /** 捕获的缓存相关异常次数，业务缓存还统计提交后的删除异常。 */
  cacheErrors: number;
  /** 缓存故障时，因回源并发预算耗尽而拒绝的次数。 */
  rejected: number;
}

/** 后端接收的场景 ID，展示文案由 cacheScenarios 提供。 */
export type CacheScenario = 'penetration' | 'breakdown' | 'avalanche' | 'outage';
/** 原始策略和保护策略的接口取值。 */
export type LabMode = 'naive' | 'guarded';

/** 单组实验参数，requests 是本组发起的读取次数。 */
export interface LabInput {
  scenario: CacheScenario;
  mode: LabMode;
  requests: number;
}

/** 单组实验的响应，用于对比两种策略的指标。 */
export interface LabResult {
  scenario: CacheScenario;
  mode: LabMode;
  cacheBackend: string;
  metrics: CacheMetrics;
  /** 捕获到业务异常的读取次数。 */
  failedRequests: number;
  /** 查询结束后未找到商品的次数，与异常失败分别统计。 */
  notFound: number;
  elapsedMs: number;
  /** 雪崩场景的预热 TTL 列表，单位为毫秒。其他场景返回空数组。 */
  seededTtlMs: number[];
  note: string;
}
