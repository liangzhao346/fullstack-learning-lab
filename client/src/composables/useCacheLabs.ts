import { computed, ref } from 'vue';
import type { LabApi } from '../api/lab';
import { cacheScenarios } from '../config/cacheScenarios';
import type { CacheScenario, LabMode, LabResult } from '../types/domain';
import type { Feedback } from './useFeedback';

export function useCacheLabs(api: LabApi, feedback: Feedback) {
  const scenario = ref<CacheScenario>('penetration');
  const requestCount = ref(24);
  const running = ref(false);
  const results = ref<LabResult[]>([]);
  const definition = computed(() => cacheScenarios.find((item) => item.id === scenario.value));

  function selectScenario(value: CacheScenario) {
    scenario.value = value;
    results.value = [];
  }

  async function run() {
    if (running.value) return;
    running.value = true;
    feedback.clear();
    results.value = [];
    const input = { scenario: scenario.value, requests: requestCount.value };
    const modes: LabMode[] = ['naive', 'guarded'];

    try {
      for (const mode of modes) {
        results.value.push(await api.runLab({ ...input, mode }));
      }
    } catch (error: unknown) {
      feedback.reportError(error);
    } finally {
      running.value = false;
    }
  }

  return { scenario, requestCount, running, results, definition, selectScenario, run };
}
