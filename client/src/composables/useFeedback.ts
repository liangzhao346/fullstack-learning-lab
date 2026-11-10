/** 共享操作反馈。维护忙碌状态、成功提示与错误提示。 */
import { ref } from 'vue';

export function useFeedback() {
  const busy = ref(false);
  const notice = ref('');
  const failure = ref('');

  /** 页面切换或操作开始时清理上一次提示。 */
  function clear() {
    notice.value = '';
    failure.value = '';
  }

  /** 把捕获的异常转为全局提示可显示的文本。 */
  function reportError(error: unknown) {
    failure.value = error instanceof Error ? error.message : String(error);
  }

  /**
   * 包裹共用 busy 状态的操作，忙碌时跳过新的调用。
   * 异常通过 failure 展示，finally 确保成功或失败后都能恢复按钮。
   */
  async function run(action: () => Promise<void>): Promise<void> {
    if (busy.value) return;
    busy.value = true;
    clear();

    try {
      await action();
    } catch (error: unknown) {
      reportError(error);
    } finally {
      busy.value = false;
    }
  }

  return { busy, notice, failure, clear, reportError, run };
}

export type Feedback = ReturnType<typeof useFeedback>;
