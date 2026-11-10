<script setup lang="ts">
/** 订单表单。根据商品候选和初值管理草稿，submit 事件携带 OrderInput。 */
import { ref, watch } from 'vue';
import type { OrderInput, Product } from '../../types/domain';
import PanelHeading from '../common/PanelHeading.vue';

const props = defineProps<{ initialValue: OrderInput; products: Product[]; busy: boolean }>();
const emit = defineEmits<{ submit: [input: OrderInput] }>();
// 本地草稿独立于父组件。initialValue 更新时重新带入商品、数量和提交标识。
const draft = ref<OrderInput>({ ...props.initialValue });

watch(() => props.initialValue, (value) => { draft.value = { ...value }; });

function submit() {
  // 沿用草稿中的 requestKey，支持用户用同样的内容重放订单请求。
  emit('submit', { ...draft.value, productId: Number(draft.value.productId), quantity: Number(draft.value.quantity) });
}

/** 生成一次新下单使用的幂等标识，保留已填的商品和数量。 */
function newOrderKey() {
  draft.value.requestKey = crypto.randomUUID();
}
</script>

<template>
  <article class="panel">
    <PanelHeading
      title="创建与重放订单"
      description="库存扣减和订单创建在同一数据库事务内完成。"
      badge="TRANSACTION"
    />
    <form class="editor" @submit.prevent="submit">
      <label>商品
        <select v-model.number="draft.productId" required>
          <option v-for="product in products" :key="product.id" :value="product.id">
            {{ product.name }} · 库存 {{ product.stock }}
          </option>
        </select>
      </label>
      <label>数量<input v-model.number="draft.quantity" type="number" min="1" max="1000" required></label>
      <label>本次提交标识<input v-model="draft.requestKey" required minlength="8" maxlength="80" pattern="[A-Za-z0-9-]{8,80}"></label>
      <div class="hint">保持标识与订单内容不变再次提交，观察返回的订单 ID 和库存。修改内容但沿用标识会返回 409。</div>
      <button class="primary" :disabled="busy || !draft.productId">提交 / 重放同一订单 ↗</button>
      <button type="button" class="text-button" :disabled="busy" @click="newOrderKey">生成新订单标识</button>
    </form>
  </article>
</template>
