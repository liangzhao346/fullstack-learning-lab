<script setup lang="ts">
/** 侧栏导航。activeTab 来自工作区，select 事件携带用户选择的标签 ID。 */
import { navigationItems } from '../../config/navigation';
import type { TabId } from '../../types/navigation';

defineProps<{ activeTab: TabId }>();
defineEmits<{ select: [tab: TabId] }>();
</script>

<template>
  <aside>
    <a class="brand" href="#">
      <span class="brand-mark">FL</span>
      <span>Fullstack Lab<small>从界面到数据</small></span>
    </a>
    <div class="nav-label">LEARNING WORKSPACE</div>
    <nav aria-label="学习模块">
      <button
        v-for="item in navigationItems"
        :key="item.id"
        type="button"
        :class="{ active: activeTab === item.id }"
        :aria-current="activeTab === item.id ? 'page' : undefined"
        @click="$emit('select', item.id)"
      >
        <span>{{ item.number }}</span>{{ item.label }}<b>↗</b>
      </button>
    </nav>
    <div class="side-note">
      <span class="dot"></span>为理解而构建
      <p>一个业务链路，四层知识。<br>先观察，再修改，最后验证。</p>
    </div>
    <div class="stack">VUE 3 · TYPESCRIPT · SPRING BOOT<br>SQL · CACHE · TRANSACTION</div>
  </aside>
</template>
