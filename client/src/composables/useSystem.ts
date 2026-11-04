import { ref } from 'vue';
import type { LabApi } from '../api/lab';
import type { CacheMetrics, SystemInfo } from '../types/domain';

export function useSystem(api: LabApi) {
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

  async function load() {
    info.value = await api.system();
  }

  async function loadMetrics() {
    metrics.value = await api.metrics();
  }

  return { info, metrics, load, loadMetrics };
}
