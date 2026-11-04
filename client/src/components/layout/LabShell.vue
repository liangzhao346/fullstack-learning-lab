<script setup lang="ts">
import { useLabWorkspace } from '../../composables/useLabWorkspace';
import FeedbackMessages from '../common/FeedbackMessages.vue';
import MetricsOverview from '../common/MetricsOverview.vue';
import RequestInspector from '../common/RequestInspector.vue';
import AppHeader from './AppHeader.vue';
import SidebarNav from './SidebarNav.vue';

const workspace = useLabWorkspace();
const { tab, title, trace, selectTab, refresh } = workspace;
const { busy, failure, notice } = workspace.feedback;
const { info, metrics } = workspace.system;
const { page: products } = workspace.products;
const { page: orders } = workspace.orders;
</script>

<template>
  <div class="shell">
    <SidebarNav :active-tab="tab" @select="selectTab" />
    <main>
      <AppHeader :title="title" :system="info" :busy="busy" @refresh="refresh" />
      <div v-if="info?.cache === 'local-demo'" class="mode-banner">
        <b>本地学习模式</b>
        <span>真实 Spring Boot + H2 SQL 数据库；缓存由本地可过期存储演示。切换真实 MySQL/Redis 的步骤见项目 README。</span>
      </div>
      <FeedbackMessages :failure="failure" :notice="notice" />
      <MetricsOverview :product-total="products.total" :order-total="orders.total" :metrics="metrics" />
      <slot />
      <RequestInspector :trace="trace" />
      <footer>
        FULLSTACK LAB / Learning by tracing one complete request.
        <span>本地学习应用 · 无登录、支付或生产部署配置</span>
      </footer>
    </main>
  </div>
</template>
