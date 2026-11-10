/** 环境信息与商品详情指标。给页眉和顶部统计卡提供共享数据。 */
import { ref } from 'vue';
import type { LabApi } from '../api/lab';
import type { CacheMetrics, SystemInfo } from '../types/domain';

export function useSystem(api: LabApi) {
  // 初次读取前，页眉显示连接提示，指标卡以零值呈现。
  const info = ref<SystemInfo | null>(null);
  const metrics = ref<CacheMetrics>({
    requests: 0,
    hits: 0,
    misses: 0,
    dbReads: 0,
    negativeHits: 0,
    cacheErrors: 0,
    rejected: 0,
  });

  /** 读取后端报告的数据库和缓存模式。 */
  async function load() {
    info.value = await api.system();
  }

  /** 更新业务详情缓存统计。实验响应自带独立计数。 */
  async function loadMetrics() {
    metrics.value = await api.metrics();
  }

  return { info, metrics, load, loadMetrics };
}
