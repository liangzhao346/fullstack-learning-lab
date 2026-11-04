# 前端 TypeScript 与组件拆分

日期：2026-11-04。状态：已完成。

## 目标与约束

用户认为前端代码混乱，要求迁移到 TypeScript，并将 Vue 组件合理拆分，业务不能全部放在入口组件。保留商品、订单、缓存实验、学习地图、请求观察与原有页面布局，后端契约保持兼容。

实际代码目录：`/Users/joyce/project-test/fullstack-learning-lab`。本次由全栈学习项目专属对话直接实施。开始时 Git 为 `main...origin/main`，工作区干净，基线提交 `ba50f48`。

## 已核对与关键决定

- 初始前端只有 App.vue、main.js、全局 CSS 和 Vite JS 配置，所有页面状态与请求逻辑集中在 App.vue。
- TypeScript 使用严格模式；入口、配置、接口契约和业务逻辑迁移为 TS，所有 Vue 组件使用 script setup lang="ts"。
- 分为 views、components、composables、api、types 和配置；页面组合组件，领域 composable 负责状态，请求封装与具体接口分离。
- 应用装配层协调跨页面刷新和共享状态；保持标签切换后的表单与数据状态，明确组件 props / emits 类型。
- 使用 vue-tsc 检查 Vue 模板和 TS，前端构建先检查类型，再执行 Vite 打包。

## 计划与进度

1. 已完成：核对代码、依赖、后端 DTO、现有文档和 Git 状态，查阅 Vue / Vite 官方 TS 文档。
2. 已完成：TS 严格配置、入口 / Vite 配置迁移，类型化 HTTP / DTO、六个状态 composable、四个 View 和布局 / 公共 / 业务组件。App.vue 为 28 行，仅做工作区与页面装配。
3. 已完成：前端生产构建（含 Vue / TS / Node 配置类型检查），项目根目录 typecheck 命令；真实浏览器 19 项正常与异常回归，未捕获页面运行时异常。
4. 已完成：更新架构、使用链路、学习路线、资料来源、验证记录和 README；新增前端组件分层学习说明。最终检查 11 份 Markdown / 107 个本地链接、所有 Vue TS 脚本与依赖锁一致性通过，git diff --check 通过；临时前后端已关闭。

## 验证与下一步

已验证：类型检查、生产构建、分页、表单跨标签保留、创建 / 搜索 / 编辑 / 删除、旧版本 409、缓存读与计数、下单重放、幂等 409、库存不足、外键保护、后端 400、四类缓存实验、HTTP 非 JSON 错误、模拟网络故障、桌面 / 390px 移动端布局。

浏览器为本机 Chrome（Playwright 驱动），使用独立 5179 / 8088 端口、已有后端 jar、H2 内存库 `frontend_refactor` 和独立 local-demo 缓存前缀。没有写入默认 H2 文件数据库。原生浏览器连接工具超时后改用本机无头 Chrome；首次回归的精确 label 定位调整为 combobox 角色定位，未据此修改业务行为。

证据保存在本机忽略目录 `.runtime/proof/frontend-typescript-refactor.json`，桌面 / 移动截图为同目录 `frontend-typescript-desktop.png` / `frontend-typescript-mobile.png`。临时回归脚本在 `.runtime/frontend-check/`。本轮未重跑 Java 单元 / 集成测试，真实 MySQL/Redis 仍未实测。

交付入口：[前端分层学习说明](../learning/frontend-typescript-components.md)、[更新后的架构](../architecture.md)、[验证记录](../verification.md)。本轮临时 5179 / 8088 服务已关闭，默认启动方法保持 README 所列命令。未提交或推送代码。
