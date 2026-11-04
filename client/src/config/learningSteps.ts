interface LearningStep {
  title: string;
  description: string;
  source: string;
}

export const learningSteps: LearningStep[] = [
  {
    title: '先看 HTTP',
    description: '在商品列表点「读缓存」，查看下方请求方法、地址、响应和 requestId。',
    source: 'ProductsView → useProducts → api/lab.ts → api/client.ts',
  },
  {
    title: '理解 Spring Boot',
    description: '应用入口负责启动内嵌服务；Controller 接收请求，校验 DTO，调用 Service。',
    source: 'LabApplication → ApiController → ProductService',
  },
  {
    title: '读懂数据库',
    description: '对照迁移 SQL 和 Repository，观察表、主键、唯一键、外键、分页查询与参数绑定。',
    source: 'V1__catalog_and_orders.sql → ProductRepository',
  },
  {
    title: '验证事务与并发',
    description: '用库存为 1 的商品下两次订单；用同一 requestKey 重发，再修改内容观察冲突。',
    source: 'OrderService → OrderTransaction → conditional UPDATE',
  },
  {
    title: '观察缓存异常',
    description: '同一批请求，比较原始实现与保护方案的数据库读取次数，不只看响应时间。',
    source: 'CacheReader → CacheStore → LabService',
  },
  {
    title: '切到真实服务',
    description: '本地模式是 H2 + 可过期本地缓存；准备 Docker 后按 README 切换 MySQL/Redis。',
    source: 'compose.yml → mysql-redis profile',
  },
];
