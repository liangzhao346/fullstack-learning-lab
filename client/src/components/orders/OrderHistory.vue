<script setup lang="ts">
import type { Page, PurchaseOrder } from '../../types/domain';
import { formatMoney } from '../../utils/format';
import PaginationControls from '../common/PaginationControls.vue';
import PanelHeading from '../common/PanelHeading.vue';

defineProps<{ orders: Page<PurchaseOrder>; busy: boolean }>();
defineEmits<{ pageChange: [page: number] }>();
</script>

<template>
  <article class="panel">
    <PanelHeading title="订单记录" description="价格来自数据库，页面不提交订单金额。" />
    <div v-for="order in orders.items" :key="order.id" class="order-card">
      <div><b>商品 #{{ order.productId }} × {{ order.quantity }}</b><strong>{{ formatMoney(order.total) }}</strong></div>
      <small>{{ order.id }}</small>
      <small>幂等标识：{{ order.requestKey }}</small>
    </div>
    <div v-if="!orders.items.length" class="empty">还没有订单。</div>
    <PaginationControls
      :page="orders.page"
      :size="orders.size"
      :total="orders.total"
      :busy="busy"
      :show-page="false"
      @change="$emit('pageChange', $event)"
    />
  </article>
</template>
