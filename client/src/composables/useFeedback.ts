import { ref } from 'vue';

export function useFeedback() {
  const busy = ref(false);
  const notice = ref('');
  const failure = ref('');

  function clear() {
    notice.value = '';
    failure.value = '';
  }

  function reportError(error: unknown) {
    failure.value = error instanceof Error ? error.message : String(error);
  }

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
