<script setup lang="ts">
import { ref, watch } from 'vue';
import type { ProductInput } from '../../types/domain';
import PanelHeading from '../common/PanelHeading.vue';

const props = defineProps<{
  initialValue: ProductInput;
  selectedId: number | null;
  busy: boolean;
}>();
const emit = defineEmits<{ save: [input: ProductInput]; reset: [] }>();
const draft = ref<ProductInput>({ ...props.initialValue });

watch(() => props.initialValue, (value) => { draft.value = { ...value }; });

function submit() {
  emit('save', { ...draft.value, price: Number(draft.value.price), stock: Number(draft.value.stock) });
}
</script>

<template>
  <article class="panel">
    <PanelHeading
      :title="selectedId !== null ? '编辑商品' : '创建商品'"
      description="后端会再次校验输入，不能只依赖页面。"
    />
    <form class="editor" @submit.prevent="submit">
      <label>SKU<input v-model="draft.sku" required pattern="[A-Za-z0-9-]{2,40}" placeholder="例如 BOOK-001"></label>
      <label>商品名称<input v-model="draft.name" required maxlength="120" placeholder="输入商品名称"></label>
      <div class="form-grid">
        <label>价格<input v-model.number="draft.price" type="number" min="0.01" max="99999999" step="0.01" required></label>
        <label>库存<input v-model.number="draft.stock" type="number" min="0" max="1000000" step="1" required></label>
      </div>
      <div v-if="selectedId !== null" class="hint">
        提交版本：{{ draft.version }}。另一个页面修改后，本次提交会因版本过期而被拒绝。
      </div>
      <button class="primary" :disabled="busy">{{ selectedId !== null ? '保存修改' : '创建商品' }} ↗</button>
      <button type="button" class="text-button" :disabled="busy" @click="emit('reset')">重置表单</button>
    </form>
  </article>
</template>
