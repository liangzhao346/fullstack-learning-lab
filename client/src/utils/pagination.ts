import type { Page } from '../types/domain';

export function emptyPage<T>(size = 8): Page<T> {
  return { items: [], total: 0, page: 0, size };
}
