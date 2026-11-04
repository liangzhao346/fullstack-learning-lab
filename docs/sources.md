# 资料来源与实现取舍

核对日期：2026-11-01。以下是实际检索并打开的上游资料，借鉴其技术职责与设计思路，业务代码为本学习项目编写，并未直接复制整个开源仓库。

- [Spring Petclinic REST](https://github.com/spring-petclinic/spring-petclinic-rest)：参考独立 REST 后端和分层、测试的组织方式，未照搬诊所业务或完整依赖栈。
- [Spring MySQL 指南](https://spring.io/guides/gs/accessing-data-mysql/)：确认 Spring 连接 MySQL 的角色。该指南使用 JPA；本项目为便于观察 SQL，选择 JDBC，这是本项目的教学取舍。
- [Spring 事务指南](https://spring.io/guides/gs/managing-transactions/)：参考声明式事务对多条数据库操作的一致性作用。
- [Spring 输入校验](https://spring.io/guides/gs/validating-form-input/)：参考 Jakarta Validation 校验边界。
- [Spring Boot 3.5 运行要求](https://docs.spring.io/spring-boot/3.5/system-requirements.html)：核对所选版本支持本机 Java 17；未将所选版本称为全平台最新版本。
- [Redis cache-aside](https://redis.io/docs/latest/develop/use-cases/cache-aside/)：参考先查缓存、再读数据库、过期和失效的职责。
- [Redis 缓存层故障模式](https://redis.io/blog/cache-layer-architecture-guide/)：参考请求合并、TTL 抖动与缓存故障保护的边界。

H2 与本地缓存是为本机没有 Docker/MySQL/Redis 的环境提供的明确 demo 模式，不是上述真实服务的验证替代。当前单体、无账号系统、有限并发实验的范围由学习目标决定。

2026-11-04 前端 TypeScript 重构另行核对：

- [Vue 的 TypeScript 配置](https://vuejs.org/guide/typescript/overview.html)：使用 vue-tsc 检查 Vue SFC 与模板，独立配置浏览器和 Node 类型环境。
- [Vue Composition API 的类型](https://vuejs.org/guide/typescript/composition-api.html)：组件 props / emits、ref 和 Provide / Inject 的类型边界。
- [Vite 的 TypeScript 支持](https://vite.dev/guide/features.html#typescript)：Vite 转译与独立类型检查分别执行，构建脚本先运行检查再打包。
