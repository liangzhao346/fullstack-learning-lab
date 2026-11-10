/** 缓存实验状态。为同一场景和请求量依次执行原始方案与保护方案。 */
import { computed, ref } from 'vue';
import type { LabApi } from '../api/lab';
import { cacheScenarios } from '../config/cacheScenarios';
import type { CacheScenario, LabMode, LabResult } from '../types/domain';
import type { Feedback } from './useFeedback';

export function useCacheLabs(api: LabApi, feedback: Feedback) {
  const scenario = ref<CacheScenario>('penetration');
  const requestCount = ref(24);
  // 实验的运行状态单独管理，实验组件用它锁定场景选择和请求量。
  const running = ref(false);
  const results = ref<LabResult[]>([]);
  const definition = computed(() => cacheScenarios.find((item) => item.id === scenario.value));

  /** 切换场景时清空旧结果，避免把上一场景的指标挂在新标题下。 */
  function selectScenario(value: CacheScenario) {
    scenario.value = value;
    results.value = [];
  }

  /** 固定本轮输入并顺序提交两种策略。后一步失败时保留已返回的结果。 */
  async function run() {
    if (running.value) return;
    running.value = true;
    feedback.clear();
    results.value = [];
    const input = { scenario: scenario.value, requests: requestCount.value };
    // 单个后端实例同一时刻只运行一组实验。等待上一组结束后再提交下一组。
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
