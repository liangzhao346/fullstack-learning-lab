<script setup lang="ts">
/** 公共分页。依据父组件传入的页码、容量和总数计算按钮状态。 */
withDefaults(defineProps<{
  /** 接口页码从 0 开始，界面显示时加 1。 */
  page: number;
  size: number;
  total: number;
  busy: boolean;
  /** 可隐藏当前页码，保留记录总数和翻页按钮。 */
  showPage?: boolean;
}>(), { showPage: true });

/** change 携带目标接口页码，父组件收到后负责加载。 */
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
