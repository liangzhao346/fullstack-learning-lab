<script setup lang="ts">
import type { CacheMetrics } from '../../types/domain';

defineProps<{
  productTotal: number;
  orderTotal: number;
  metrics: CacheMetrics;
}>();
</script>

<template>
  <section class="metrics" aria-label="业务与缓存指标">
    <div><span>商品记录</span><strong>{{ productTotal }}</strong><small>SQL 分页与持久化</small></div>
    <div><span>有效订单</span><strong>{{ orderTotal }}</strong><small>事务 + 幂等提交</small></div>
    <div><span>商品详情缓存命中</span><strong>{{ metrics.hits }}</strong><small>包含空值缓存命中</small></div>
    <div><span>详情请求回源</span><strong>{{ metrics.dbReads }}</strong><small>不含列表和写入 SQL</small></div>
  </section>
</template>
