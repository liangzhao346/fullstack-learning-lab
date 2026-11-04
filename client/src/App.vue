<script setup lang="ts">
import { computed } from 'vue';
import type { Component } from 'vue';
import LabShell from './components/layout/LabShell.vue';
import { provideLabWorkspace } from './composables/useLabWorkspace';
import type { TabId } from './types/navigation';
import CacheLabsView from './views/CacheLabsView.vue';
import LearningMapView from './views/LearningMapView.vue';
import OrdersView from './views/OrdersView.vue';
import ProductsView from './views/ProductsView.vue';

const { tab } = provideLabWorkspace();
const views: Record<TabId, Component> = {
  products: ProductsView,
  orders: OrdersView,
  labs: CacheLabsView,
  learn: LearningMapView,
};
const activeView = computed(() => views[tab.value]);
</script>

<template>
  <LabShell>
    <KeepAlive>
      <component :is="activeView" />
    </KeepAlive>
  </LabShell>
</template>
