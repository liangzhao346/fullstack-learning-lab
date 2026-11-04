import type { CacheScenario } from '../types/domain';

interface ScenarioDefinition {
  id: CacheScenario;
  title: string;
  problem: string;
  solution: string;
}

export const cacheScenarios: ScenarioDefinition[] = [
  {
    id: 'penetration',
    title: '缓存穿透',
    problem: '不断请求数据库里也不存在的数据。',
    solution: '短期缓存空值，让相同的无效请求不再反复查库。',
  },
  {
    id: 'breakdown',
    title: '缓存击穿',
    problem: '热门商品缓存过期，同时涌入大量请求。',
    solution: '同一个进程内合并同一 key 的回源请求，等待首个请求填充缓存。',
  },
  {
    id: 'avalanche',
    title: '缓存雪崩',
    problem: '许多商品缓存集中失效，数据库同时承受回源。',
    solution: '对 TTL 增加抖动，让失效时间分散；全缓存故障另需限流或降级。',
  },
  {
    id: 'outage',
    title: '缓存故障',
    problem: '模拟缓存读取不可用，观察请求是否全部失败。',
    solution: '有界回源，限制数据库并发，超过预算的请求明确拒绝。',
  },
];
