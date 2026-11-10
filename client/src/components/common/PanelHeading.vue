<script setup lang="ts">
/** 公用面板标题。title 和 description 提供内容，badge 用于可选的分类或状态标记。 */
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
