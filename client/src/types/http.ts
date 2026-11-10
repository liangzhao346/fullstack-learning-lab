/** 请求客户端使用的 HTTP 选项、响应外壳与观察记录。 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/** 成功响应外壳，T 对应具体领域接口返回的数据。 */
export interface ApiEnvelope<T> {
  data: T;
  requestId: string;
}

/** 后端错误响应。details 按字段名保存校验信息。 */
export interface ApiFailure {
  code: string;
  message: string;
  requestId: string;
  details: Record<string, string>;
}

/** 观察窗快照。响应可能是 JSON、代理返回的文本或网络错误描述。 */
export interface RequestTrace {
  method: HttpMethod;
  url: string;
  status: number | '网络错误';
  elapsedMs: number;
  body: unknown;
  response: unknown;
}

/** 通用请求选项。方法默认 GET，提供 body 时以 JSON 发送。 */
export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  /** 为 true 时跳过观察窗回调，仍向调用方返回数据或错误。 */
  quiet?: boolean;
}
