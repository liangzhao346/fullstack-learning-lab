<script setup lang="ts">
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
