<script setup lang="ts">
import ProductCatalog from '../components/products/ProductCatalog.vue';
import ProductEditor from '../components/products/ProductEditor.vue';
import { useLabWorkspace } from '../composables/useLabWorkspace';

const workspace = useLabWorkspace();
const { busy } = workspace.feedback;
const { page, query, initialDraft, selectedId, search, changePage, detail, edit, remove, save, resetDraft } = workspace.products;
</script>

<template>
  <section class="two-column">
    <ProductCatalog
      v-model:query="query"
      :products="page"
      :busy="busy"
      @search="search"
      @page-change="changePage"
      @detail="detail"
      @edit="edit"
      @order="workspace.startOrder"
      @remove="remove"
    />
    <ProductEditor
      :initial-value="initialDraft"
      :selected-id="selectedId"
      :busy="busy"
      @save="save"
      @reset="resetDraft"
    />
  </section>
</template>
