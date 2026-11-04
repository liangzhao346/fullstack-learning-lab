<script setup lang="ts">
withDefaults(defineProps<{
  page: number;
  size: number;
  total: number;
  busy: boolean;
  showPage?: boolean;
}>(), { showPage: true });

defineEmits<{ change: [page: number] }>();
</script>

<template>
  <div class="pagination">
    <span><template v-if="showPage">第 {{ page + 1 }} 页 · </template>共 {{ total }} 条</span>
    <div>
      <button type="button" aria-label="上一页" :disabled="busy || page === 0" @click="$emit('change', page - 1)">←</button>
      <button
        type="button"
        aria-label="下一页"
        :disabled="busy || (page + 1) * size >= total"
        @click="$emit('change', page + 1)"
      >→</button>
    </div>
  </div>
</template>
