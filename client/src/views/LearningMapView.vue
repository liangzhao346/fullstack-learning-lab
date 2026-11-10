<script setup lang="ts">
/** 学习地图。按 learningSteps 的顺序展示练习步骤与对应源码入口。 */
import { learningSteps } from '../config/learningSteps';
</script>

<template>
  <section class="learning-grid">
    <article v-for="(step, index) in learningSteps" :key="step.title" class="panel lesson">
      <span class="lesson-number">{{ String(index + 1).padStart(2, '0') }}</span>
      <h2>{{ step.title }}</h2>
      <p>{{ step.description }}</p>
      <code>{{ step.source }}</code>
    </article>
  </section>
</template>
