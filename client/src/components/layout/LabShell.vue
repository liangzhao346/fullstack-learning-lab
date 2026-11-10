<script setup lang="ts">
/** 公共布局。承载导航、环境状态、全局反馈、指标与请求观察窗，默认插槽放置当前页面。 */
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
// 顶部记录数取自当前分页响应的 total，商品搜索时会随筛选条件变化。
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
