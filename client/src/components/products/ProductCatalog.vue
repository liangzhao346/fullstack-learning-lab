<script setup lang="ts">
import type { Page, Product } from '../../types/domain';
import { formatMoney } from '../../utils/format';
import PaginationControls from '../common/PaginationControls.vue';
import PanelHeading from '../common/PanelHeading.vue';

defineProps<{ products: Page<Product>; busy: boolean }>();
const query = defineModel<string>('query', { required: true });
defineEmits<{
  search: [];
  pageChange: [page: number];
  detail: [product: Product];
  edit: [product: Product];
  order: [product: Product];
  remove: [product: Product];
}>();
</script>

<template>
  <article class="panel">
    <PanelHeading title="商品目录" description="增删改查、分页与版本冲突，从这里开始。" badge="CATALOG" />
    <form class="search" @submit.prevent="$emit('search')">
      <input v-model="query" aria-label="搜索商品" placeholder="搜索商品名或 SKU" maxlength="80">
      <button class="secondary" :disabled="busy">搜索</button>
    </form>
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>商品 / SKU</th><th>价格</th><th>库存</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="product in products.items" :key="product.id">
            <td><b>{{ product.name }}</b><small>{{ product.sku }} · v{{ product.version }}</small></td>
            <td>{{ formatMoney(product.price) }}</td>
            <td><span class="stock" :class="{ low: product.stock < 5 }">{{ product.stock }}</span></td>
            <td class="actions">
              <button type="button" :disabled="busy" @click="$emit('detail', product)">读缓存</button>
              <button type="button" :disabled="busy" @click="$emit('edit', product)">编辑</button>
              <button type="button" :disabled="busy" @click="$emit('order', product)">下单</button>
              <button type="button" class="danger" :disabled="busy" @click="$emit('remove', product)">删除</button>
            </td>
          </tr>
          <tr v-if="!products.items.length">
            <td colspan="4" class="empty">暂无数据，先确认 API 已连接，或创建第一个商品。</td>
          </tr>
        </tbody>
      </table>
    </div>
    <PaginationControls
      :page="products.page"
      :size="products.size"
      :total="products.total"
      :busy="busy"
      @change="$emit('pageChange', $event)"
    />
  </article>
</template>
