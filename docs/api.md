# HTTP API

统一成功响应为 `{data, requestId}`；错误响应为 `{code,message,requestId,details}`。请求 ID 也在 `X-Request-Id` 响应头中。

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | /api/system | 当前 demo/真实服务配置类型与运行信息 |
| GET | /api/products?page=0&size=8&q= | 商品分页、搜索 |
| GET | /api/products/{id} | 带缓存的商品详情 |
| POST | /api/products | 创建商品 |
| PUT | /api/products/{id} | 带 version 的全字段更新 |
| DELETE | /api/products/{id} | 删除无订单引用的商品 |
| GET | /api/orders?page=0&size=8 | 订单分页 |
| POST | /api/orders | 创建或幂等重放订单 |
| GET | /api/metrics/cache | 当前实例商品详情的缓存计数，不是全部 SQL 计数 |
| POST | /api/labs/cache/run | 有界、隔离的缓存实验 |

商品请求：

```json
{"sku":"BOOK-001","name":"全栈练习本","price":29.90,"stock":10,"version":0}
```

订单请求（productId 使用实际创建或查询得到的 ID）：

```json
{"productId":1,"quantity":1,"requestKey":"a-unique-submission-001"}
```

实验请求：

```json
{"scenario":"penetration","mode":"guarded","requests":24}
```

scenario 支持 penetration、breakdown、avalanche、outage；mode 支持 naive、guarded；requests 范围 8–60。实验中被拒绝的子请求体现在结果计数中；HTTP 200 表示实验完成，不代表所有子请求都成功。

400 是参数或格式错误；404 是不存在；409 是库存、版本、幂等内容或数据约束冲突；429 是已有实验正在运行；503 用于缓存不可用或回源预算不足的读取。没有记录 SQL 或连接串到错误响应中。
