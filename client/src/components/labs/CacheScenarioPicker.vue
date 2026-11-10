<script setup lang="ts">
/** 缓存场景选择器。展示选中项，实验运行期间锁定选择，select 携带场景 ID。 */
import { cacheScenarios } from '../../config/cacheScenarios';
import type { CacheScenario } from '../../types/domain';

defineProps<{ selected: CacheScenario; busy: boolean }>();
defineEmits<{ select: [scenario: CacheScenario] }>();
</script>

<template>
  <div class="scenario-grid">
    <button
      v-for="item in cacheScenarios"
      :key="item.id"
      type="button"
      class="scenario"
      :class="{ selected: selected === item.id }"
      :aria-pressed="selected === item.id"
      :disabled="busy"
      @click="$emit('select', item.id)"
    >
      <span>{{ item.id.toUpperCase() }}</span>
      <h2>{{ item.title }}</h2>
      <p>{{ item.problem }}</p>
    </button>
  </div>
</template>
