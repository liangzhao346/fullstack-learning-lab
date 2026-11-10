# 前端 TypeScript 与 Vue 组件分层

更新：2026-11-04。目标：让入口负责装配，让页面、组件、业务状态和 HTTP 各自有清晰职责，能够从一次点击读懂整条前端链路。

## 项目结构与职责

```text
client/
├── vite.config.ts             Vite 开发服务、Vue 编译与 API 代理
├── tsconfig.json              浏览器 TS / Vue 模板的严格类型规则
├── tsconfig.node.json         Vite 配置的 Node 类型环境
└── src/
    ├── main.ts                创建并挂载 Vue 应用，加载公共样式
    ├── App.vue                初始化工作区，装配布局和四个页面
    ├── views/                 Products / Orders / CacheLabs / LearningMap
    ├── components/
    │   ├── layout/            外壳、侧栏导航、顶部环境状态
    │   ├── common/            面板标题、分页、提示、指标、请求观察窗
    │   ├── products/          商品目录、商品编辑表单
    │   ├── orders/            订单表单、订单记录
    │   └── labs/              缓存场景选择、实验结果
    ├── composables/           工作区装配、商品 / 订单 / 缓存实验状态与操作
    ├── api/                   具体业务接口 lab.ts、通用客户端 client.ts
    ├── types/                 领域 DTO、分页、HTTP、导航类型
    ├── config/                导航、实验场景和学习卡片配置
    ├── utils/                 金额展示、空分页数据
    └── style.css              共享布局、组件视觉样式与响应式规则
```

[App.vue](../../client/src/App.vue) 只选择当前 View 并放进布局，不承担商品 CRUD、订单提交或实验逻辑。四个 View 负责把数据和事件连接到业务组件；组件文件按业务归类，公共组件在真实复用处使用。

| 层 | 做什么 | 代码入口 |
| --- | --- | --- |
| 页面 | 组合表格、表单和结果，绑定领域状态与事件 | [ProductsView](../../client/src/views/ProductsView.vue)、[OrdersView](../../client/src/views/OrdersView.vue) |
| 业务组件 | 显示数据、维护本地表单、发出有类型的事件 | [ProductCatalog](../../client/src/components/products/ProductCatalog.vue)、[ProductEditor](../../client/src/components/products/ProductEditor.vue)、[OrderForm](../../client/src/components/orders/OrderForm.vue) |
| 领域逻辑 | 保存商品 / 订单 / 实验状态，执行操作与刷新 | [useProducts](../../client/src/composables/useProducts.ts)、[useOrders](../../client/src/composables/useOrders.ts)、[useCacheLabs](../../client/src/composables/useCacheLabs.ts) |
| 应用装配 | 创建 API、提示、各领域状态，协调跨页面下单和初始化 | [useLabWorkspace](../../client/src/composables/useLabWorkspace.ts) |
| 接口 | 定义路径、方法和输入输出 DTO | [api/lab.ts](../../client/src/api/lab.ts) |
| HTTP 传输 | 发送请求、校验响应外壳、提取 data、格式化错误、记录 trace | [api/client.ts](../../client/src/api/client.ts) |
| 类型 | 对齐 Java DTO，约束组件、状态和请求的形状 | [领域类型](../../client/src/types/domain.ts)、[HTTP 类型](../../client/src/types/http.ts) |

## 组件怎样通信、状态放在哪里

商品目录通过 props 接收分页数据，通过 emits 发出 detail、edit、order、remove 和 pageChange 等事件。商品编辑表单复制 initialValue 到自己的 draft，提交时发出 ProductInput，重置时发出 reset；它不会直接调用 fetch 或修改传入的 props。

跨页面共享的是商品与订单列表、统计计数、反馈和最后一次请求记录。它们由各自 composable 创建，工作区以带 InjectionKey 的 Provide / Inject 传递给页面与布局。每个应用实例有自己的工作区，不使用模块级共享单例。通用按钮、表单和分页组件使用 props / emits，避免依赖整个工作区。

App 用 KeepAlive 保留已经打开的 View：切换到订单、实验或学习地图，再返回时，本地未提交表单、筛选条件和实验结果仍保留。选中另一个商品或重置表单时，领域逻辑给出新的 initialValue，表单通过 watch 明确更新草稿。

`useLabWorkspace` 只装配依赖和跨领域刷新。商品操作在 `useProducts`、订单操作在 `useOrders`、缓存实验在 `useCacheLabs`，通用 busy / 成功 / 失败提示在 `useFeedback`，环境和详情缓存指标在 `useSystem`。

## 从「读缓存」走完一条前端请求

1. `ProductCatalog.vue` 点击按钮，发出 `detail(product)` 事件。
2. `ProductsView.vue` 将事件连接到 `useProducts.detail(product)`。
3. 领域逻辑经 `useFeedback.run` 管理 busy 与错误，再调用 `api.products.detail(id)`。
4. `api/lab.ts` 定义返回 `Product`，`api/client.ts` 执行 `GET /api/products/{id}`，经 Vite 转到后端。
5. 客户端检查 HTTP 状态和 `{data, requestId}` 外壳；成功得到 Product，失败抛出带业务 code 和字段详情的错误。
6. 成功后 `useSystem.loadMetrics` 读取最新计数；布局中的 `MetricsOverview` 更新，`RequestInspector` 显示本次非静默请求的状态、请求体和响应。

下单使用相同组织方式：`OrderForm → OrdersView → useOrders.place → api.orders.create → client.request`。成功后刷新商品和订单列表，表单保留 requestKey，支持用户重放。商品行「下单」先由工作区填入商品、生成新标识并切换页面，点击提交后才发送 POST。

## 怎样沿源码注释阅读

每个前端源码模块的开头有中文职责说明。先看组件的 props、事件和表单草稿，再沿 View 的事件绑定进入 composable，最后对照 API 请求和 DTO。样式文件按布局、公共组件和业务页面标出分区。

以订单重放为例，先读 `submit` 和 `newOrderKey`，区分沿用标识与生成新标识的时机。再读 `place`，看下单成功后如何刷新商品库存和订单记录。[订单表单](../../client/src/components/orders/OrderForm.vue)、[订单逻辑](../../client/src/composables/useOrders.ts)

排查请求时，从客户端的错误处理和 `quiet` 选项入手，跟踪响应如何进入观察窗以及后台刷新如何保留原记录。[请求客户端](../../client/src/api/client.ts)

## TypeScript 实际检查什么

所有业务脚本、入口和 Vite 配置使用 `.ts`；所有有脚本的 Vue 组件使用 `<script setup lang="ts">`。`strict`、`noUncheckedIndexedAccess` 和未使用变量检查约束空值、数组访问和组件间的数据传递。浏览器和 Node 的类型环境分别配置。

前端命令与依赖锁见 [package.json](../../client/package.json) 和 [package-lock.json](../../client/package-lock.json)。Vite 的 TS 支持负责转译，Vue 官方建议使用 vue-tsc 检查 SFC 和模板，因此生产构建先运行类型检查再打包。[Vue TypeScript 文档](https://vuejs.org/guide/typescript/overview.html)、[Vite 文档](https://vite.dev/guide/features.html#typescript)。

从项目根目录执行：

```bash
npm run setup                 # 按锁文件安装前端依赖
npm run typecheck             # Vue / TS 与 Vite 配置类型检查
npm --prefix client run build # 类型检查 + 前端生产打包
npm run dev                  # 启动默认前后端
```

类型描述编译期的后端契约；`request<Product>` 不会在运行时逐字段校验任意外部 JSON。客户端会检查统一响应外壳并区分 HTTP 错误、非 JSON 响应和网络错误；后端继续负责业务输入校验。

## 验证与后续练习

本次严格类型检查和前端生产构建已经通过，交互回归结果按实际执行更新至[验证记录](../verification.md)。浏览器回归使用独立 5179 / 8088 端口、H2 内存数据库与 local-demo，不写入默认文件数据库；真实 MySQL/Redis 不在本次验证范围。

学习时先改一项局部行为，例如商品列表的金额展示：找到 ProductCatalog、formatMoney 和 Product 类型，解释改动会影响哪些组件，再执行类型检查和前端构建。新增字段时，先与后端 DTO 对齐，再调整类型、表单和接口调用；通过请求观察窗验证真实传输，避免只修改界面。
