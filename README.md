# Fullstack Learning Lab

一个为「从前端走向全栈」设计的商品与订单学习项目。通过页面操作、真实 HTTP 请求、SQL 事务和缓存对照实验，理解每一层在做什么。

## 先运行，再沿链路阅读

要求：Java 17+、Node 20.19+（或 22.12+）、Python 3。当前构建使用 Spring Boot 3.5.16、Vue 3.5.44、TypeScript 5.9.3、Vite 8.3.5。第一次运行需要网络下载依赖；Maven 启动脚本自动下载并校验固定版本到用户缓存，不修改系统 Java。

```bash
cd fullstack-learning-lab
npm run setup
npm run dev
```

前端默认 http://127.0.0.1:5178，后端默认 http://127.0.0.1:8087。首次 Java 编译较慢，等后端出现 Started 日志后刷新页面。前端 `/api` 代理到后端，不把数据库暴露给浏览器。

项目默认是 **demo：真实 Spring Boot + H2 SQL 数据库 + 可过期本地缓存**。数据库保存在 `server/.runtime/`；有初始学习商品，后续启动不清空已有数据。界面会明确显示当前数据库与缓存类型。

## 学什么

| 日常业务 | 可观察的异常与保护 |
| --- | --- |
| 商品创建、搜索、分页、编辑、删除 | 字段校验 400、商品不存在 404、SKU 重复或外键冲突 409 |
| 版本字段与编辑 | 旧版本提交被拒绝，避免静默覆盖 |
| 创建订单与扣减库存 | 库存不足、并发防超卖、失败事务回滚 |
| 同一订单重复发送 | requestKey 唯一约束、相同内容重放、不同内容冲突 |
| 商品详情缓存 | Cache-aside、命中、回源、写入后提交阶段失效 |
| 缓存对照实验 | 穿透、击穿、雪崩、缓存故障与有界回源 |

这是单应用、本地教学切片，没有登录权限、支付、退款或生产运维方案。金额和库存从数据库读取，订单不依赖缓存的库存快照。

## 两种环境

1. `demo`：当前机器无需安装 MySQL、Redis 或 Docker即可学习业务和 SQL。缓存行为由明确标注的本地实现演示。
2. `mysql-redis`：代码接入真实 MySQL 和 Redis。需要准备 Docker 与 Compose，或指定自己的独立学习实例。

```bash
# 创建仅绑定本机的学习服务，保留各自的数据卷
npm run infra:up
SPRING_PROFILES_ACTIVE=mysql-redis npm run dev
# 结束后停止容器，保留数据
npm run infra:down
```

Compose 默认 MySQL 3307、Redis 6387，数据库 `learning_lab`，开发账户 `lab`，默认学习密码 `learning-only`。这些是独立学习环境的公开默认值。连接配置可用 `LAB_DB_URL`、`LAB_DB_USER`、`LAB_DB_PASSWORD`、`LAB_REDIS_HOST`、`LAB_REDIS_PORT` 覆盖。启动会在目标库运行 Flyway 迁移，勿指向已有业务数据库。

API 端口用 `LAB_API_PORT` 调整；同时给前端设置匹配的 `LAB_API_URL`。不要让两个学习实例争用同一组端口。

## 导航

- [学习路线](docs/learning-path.md)：从页面请求读到 SQL 和缓存，包含练习与预期结果。
- [技术架构图](docs/architecture.md)：技术模块总图与清单、业务组件调用、数据库与缓存、数据表关系及环境配置。
- [使用链路与模块学习说明](docs/learning/project-architecture-and-usage.md)：页面如何操作、对应哪些接口、商品详情和订单的完整时序。
- [前端 TypeScript 与组件分层](docs/learning/frontend-typescript-components.md)：页面、组件、状态、接口和类型的职责，以及一条完整的前端调用链。
- [缓存实验手册](docs/cache-labs.md)：触发方式、指标、修复方案和局限。
- [API 说明](docs/api.md)：请求体、响应与错误状态。
- [资料来源](docs/sources.md)：实际查阅的官方指南和开源示例，说明借鉴范围。
- [验证结果](docs/verification.md)：自动化测试、HTTP 与界面验证，区分本地和真实服务。
- [架构与使用图整理记录](docs/tasks/2026-11-04-architecture-usage-diagrams.md)：本次源码核对、产物与验证边界。
- [前端 TS 重构记录](docs/tasks/2026-11-04-frontend-typescript-refactor.md)：组件拆分、类型检查和交互回归范围。

## 常用命令

```bash
npm test                    # Java 集成与并发测试，独立 H2 内存库
npm run typecheck           # Vue 模板 / TS 业务代码 / Vite 配置的严格类型检查
npm run build               # 后端 verify + 前端类型检查及构建
npm --prefix client run build # 只检查并构建前端
npm run dev:server          # 只启动后端
npm run dev:client          # 只启动前端
```

前端从 `client/src/main.ts` 启动，`App.vue` 只装配布局和页面。`views/` 组合业务组件，`components/` 负责界面与交互事件，`composables/` 管理状态与操作，`api/` 封装有类型的 HTTP 接口，`types/` 定义后端 DTO 和组件共用契约。

前端依赖锁在 `client/package-lock.json`；Java 依赖由固定 Spring Boot BOM 管理。首次 Maven 下载使用官方来源和固定 SHA-512；下载程序默认直连官方仓库，若环境必须使用代理，可设置 `LAB_DOWNLOAD_USE_PROXY=1` 使用已有代理配置。个人代理曾造成下载截断，校验会拒绝损坏包，不跳过校验。
# fullstack-learning-lab
