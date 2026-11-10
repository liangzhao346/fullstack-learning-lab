<script setup lang="ts">
/** 订单页。把商品候选、下单草稿与分页记录交给对应组件展示。 */
import { computed } from 'vue';
import OrderForm from '../components/orders/OrderForm.vue';
import OrderHistory from '../components/orders/OrderHistory.vue';
import { useLabWorkspace } from '../composables/useLabWorkspace';

const workspace = useLabWorkspace();
const { busy } = workspace.feedback;
const { page, initialOrder, selectedProduct, place, changePage } = workspace.orders;
const { options } = workspace.products;

// 商品行带入的选择也必须出现在下拉项中，即使它不在前 50 条候选里。
const productOptions = computed(() => {
  const selected = selectedProduct.value;
  return selected && !options.value.some((product) => product.id === selected.id)
    ? [...options.value, selected]
    : options.value;
});
</script>

<template>
  <section class="two-column">
    <OrderForm :initial-value="initialOrder" :products="productOptions" :busy="busy" @submit="place" />
    <OrderHistory :orders="page" :busy="busy" @page-change="changePage" />
  </section>
</template>
