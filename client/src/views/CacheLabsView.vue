<script setup lang="ts">
import PanelHeading from '../components/common/PanelHeading.vue';
import CacheScenarioPicker from '../components/labs/CacheScenarioPicker.vue';
import LabResults from '../components/labs/LabResults.vue';
import { useLabWorkspace } from '../composables/useLabWorkspace';

const workspace = useLabWorkspace();
const { info } = workspace.system;
const { scenario, requestCount, running, results, definition, selectScenario, run } = workspace.labs;
</script>

<template>
  <section>
    <CacheScenarioPicker :selected="scenario" :busy="running" @select="selectScenario" />
    <article class="panel lab">
      <PanelHeading
        :title="`${definition?.title ?? '缓存实验'} · 对照实验`"
        :description="definition?.solution ?? ''"
        badge="CONTROLLED EXPERIMENT"
      />
      <div class="lab-controls">
        <label>请求数量 <b>{{ requestCount }}</b>
          <input v-model.number="requestCount" type="range" min="8" max="60" step="4" :disabled="running">
        </label>
        <button type="button" class="primary" :disabled="running || !info" @click="run">
          {{ running ? '正在执行两组实验…' : '运行原始与保护方案' }} ↗
        </button>
      </div>
      <p class="hint">
        实验使用真实 SQL 读取，最多 8 个并发工作线程。短 TTL 和 35ms 延迟用于放大现象；预热不计入回源计数。
        每次独立缓存命名空间，不清空业务缓存。
      </p>
      <LabResults :results="results" />
    </article>
  </section>
</template>
