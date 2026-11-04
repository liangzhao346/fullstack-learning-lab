export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface ApiEnvelope<T> {
  data: T;
  requestId: string;
}

export interface ApiFailure {
  code: string;
  message: string;
  requestId: string;
  details: Record<string, string>;
}

export interface RequestTrace {
  method: HttpMethod;
  url: string;
  status: number | '网络错误';
  elapsedMs: number;
  body: unknown;
  response: unknown;
}

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  quiet?: boolean;
}
