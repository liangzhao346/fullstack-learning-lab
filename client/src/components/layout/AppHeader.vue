<script setup lang="ts">
/** 页面页眉。展示标题和后端环境，并向布局报告手动刷新操作。 */
import type { SystemInfo } from '../../types/domain';

/** system 为空时显示连接提示，busy 期间禁用刷新。refresh 由布局处理。 */
defineProps<{ title: string; system: SystemInfo | null; busy: boolean }>();
defineEmits<{ refresh: [] }>();
</script>

<template>
  <header>
    <div>
      <span class="eyebrow">YOUR FULLSTACK JOURNEY</span>
      <h1>{{ title }}</h1>
    </div>
    <div class="mode">
      <span class="dot" :class="{ offline: !system }"></span>
      {{ system ? `${system.database} / ${system.cache}` : 'API 未连接' }}
      <button type="button" :disabled="busy" @click="$emit('refresh')">↻ 刷新</button>
    </div>
  </header>
</template>
