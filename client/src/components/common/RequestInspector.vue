<script setup lang="ts">
/** 请求观察窗。展示最近一次被记录的请求和响应，初始 trace 为 null。 */
import type { RequestTrace } from '../../types/http';
import PanelHeading from './PanelHeading.vue';

defineProps<{ trace: RequestTrace | null }>();
</script>

<template>
  <article class="panel inspector">
    <PanelHeading
      title="请求观察窗"
      description="把页面操作与实际 HTTP 响应对应起来。"
      :badge="trace ? `${trace.method} ${trace.status}` : 'WAITING'"
    />
    <pre v-if="trace">{{ JSON.stringify(trace, null, 2) }}</pre>
    <div v-else class="empty">点击「读缓存」、提交表单或运行实验，观察请求与响应。</div>
  </article>
</template>
