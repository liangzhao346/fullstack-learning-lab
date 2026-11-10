<script setup lang="ts">
/** 顶部指标卡。展示布局传入的分页总数与商品详情缓存统计。 */
import type { CacheMetrics } from '../../types/domain';

defineProps<{
  productTotal: number;
  orderTotal: number;
  /** 商品详情缓存的业务计数。单次实验结果由 LabResults 展示。 */
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
