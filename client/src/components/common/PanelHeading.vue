<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  badge?: string;
}>();
</script>

<template>
  <div class="panel-title">
    <div>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </div>
    <span v-if="badge" class="chip">{{ badge }}</span>
  </div>
</template>
