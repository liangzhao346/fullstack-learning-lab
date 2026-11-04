<script setup lang="ts">
defineProps<{ failure: string; notice: string }>();
</script>

<template>
  <div v-if="failure" class="alert error" role="alert">{{ failure }}</div>
  <div v-if="notice" class="alert success" role="status">{{ notice }}</div>
</template>
