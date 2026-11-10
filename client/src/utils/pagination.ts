/** 列表初始化。用空记录和零基页码建立可在首个请求前渲染的分页对象。 */
import type { Page } from '../types/domain';

/** 每次创建独立的分页对象，商品和订单可以分别更新。 */
export function emptyPage<T>(size = 8): Page<T> {
  return { items: [], total: 0, page: 0, size };
}
