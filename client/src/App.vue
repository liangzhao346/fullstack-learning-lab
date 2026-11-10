<script setup lang="ts">
/** 应用装配入口。创建共享工作区，把当前标签对应的页面放入公共布局。 */
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
// Record 要求每个 TabId 都有对应的页面，新增标签时编译器会检查这里。
const views: Record<TabId, Component> = {
  products: ProductsView,
  orders: OrdersView,
  labs: CacheLabsView,
  learn: LearningMapView,
};
// 模板中的 KeepAlive 保留已打开页面的组件实例和未提交表单。
const activeView = computed(() => views[tab.value]);
</script>

<template>
  <LabShell>
    <KeepAlive>
      <component :is="activeView" />
    </KeepAlive>
  </LabShell>
</template>
