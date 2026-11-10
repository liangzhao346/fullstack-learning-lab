<script setup lang="ts">
/** 操作反馈。failure 用于错误提示，notice 用于状态提示，空字符串对应隐藏。 */
defineProps<{ failure: string; notice: string }>();
</script>

<template>
  <div v-if="failure" class="alert error" role="alert">{{ failure }}</div>
  <div v-if="notice" class="alert success" role="status">{{ notice }}</div>
</template>
