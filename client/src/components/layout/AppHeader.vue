<script setup lang="ts">
import type { SystemInfo } from '../../types/domain';

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
