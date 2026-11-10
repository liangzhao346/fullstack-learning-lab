<script setup lang="ts">
/** 缓存实验结果。按策略显示统计卡片，并在有预热数据时展示保护方案的 TTL 分布。 */
import { computed } from 'vue';
import type { LabResult } from '../../types/domain';

const props = defineProps<{ results: LabResult[] }>();
const ttlBars = computed(() => props.results.find((result) => result.mode === 'guarded')?.seededTtlMs ?? []);

/** 把回源次数换算为可显示的百分比，处理零请求并将柱宽限制在 100% 内。 */
function readPercentage(result: LabResult): number {
  return Math.min(100, result.metrics.dbReads / Math.max(1, result.metrics.requests) * 100);
}
</script>

<template>
  <div v-if="results.length" class="results" aria-live="polite">
    <div v-for="result in results" :key="result.mode" class="result">
      <div class="result-head">
        <h3>{{ result.mode === 'guarded' ? '保护方案' : '原始实现' }}</h3>
        <span>{{ result.elapsedMs }} ms</span>
      </div>
      <div class="result-numbers">
        <div><b>{{ result.metrics.dbReads }}</b><span>数据库回源</span></div>
        <div><b>{{ result.metrics.hits }}</b><span>缓存命中</span></div>
        <div><b>{{ result.failedRequests }}</b><span>失败请求</span></div>
        <div><b>{{ result.metrics.rejected }}</b><span>回源限额拒绝</span></div>
      </div>
      <div class="bar"><i :style="{ width: `${readPercentage(result)}%` }"></i></div>
      <small>缓存错误 {{ result.metrics.cacheErrors }} · 空值命中 {{ result.metrics.negativeHits }} · {{ result.cacheBackend }}</small>
    </div>
  </div>
  <div v-if="ttlBars.length" class="ttl">
    <span>保护方案预热 TTL 分布（越高越晚过期）</span>
    <div>
      <i v-for="(ttl, index) in ttlBars" :key="index" :style="{ height: `${ttl / 16}px` }" :title="`${ttl}ms`"></i>
    </div>
  </div>
</template>
