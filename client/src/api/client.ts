/** HTTP 传输层。统一 API 路径、JSON 处理、错误提示和请求观察记录。 */
import type { ApiEnvelope, RequestOptions, RequestTrace } from '../types/http';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** 尽量保留后端错误码、字段详情和 requestId，缺少结构化内容时使用 HTTP 状态。 */
function failureMessage(value: unknown, status: number): string {
  if (!isRecord(value)) return `请求失败 [${status}]`;

  const message = typeof value.message === 'string' ? value.message : '请求失败';
  const code = typeof value.code === 'string' ? value.code : status;
  const requestId = typeof value.requestId === 'string' ? value.requestId : '';
  const details = isRecord(value.details)
    ? Object.entries(value.details)
        .map(([field, detail]) => `${field}: ${String(detail)}`)
        .join('；')
    : '';

  return `${message}${details ? ` · ${details}` : ''} [${code}]${requestId ? ` · ${requestId}` : ''}`;
}

/**
 * 创建供领域接口共用的客户端。
 * @param onTrace 观察窗回调。quiet 请求仍执行 HTTP 检查和解包，观察记录由非静默请求更新。
 */
export function createApiClient(onTrace: (trace: RequestTrace) => void) {
  /** path 以斜杠开头，由客户端统一添加 /api。成功时返回响应外壳中的 data。 */
  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, quiet = false } = options;
    const url = `/api${path}`;
    const startedAt = performance.now();
    const elapsedMs = () => Math.round(performance.now() - startedAt);
    let response: Response;
    let payload: unknown;

    try {
      response = await fetch(url, {
        method,
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (error: unknown) {
      // fetch 未取得响应时没有 HTTP 状态码，观察窗单独标记网络错误。
      if (!quiet) {
        onTrace({ method, url, status: '网络错误', elapsedMs: elapsedMs(), body: body ?? null, response: String(error) });
      }
      throw new Error('无法连接 API。请确认 Spring Boot 已启动，且代理地址与后端端口一致。');
    }

    // 保留非 JSON 响应的真实 HTTP 状态，避免把代理错误误报成网络错误。
    const text = await response.text();
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = text;
    }

    if (!quiet) {
      onTrace({ method, url, status: response.status, elapsedMs: elapsedMs(), body: body ?? null, response: payload });
    }

    // 先记录响应再抛错，让失败请求也能在观察窗中回看。
    if (!response.ok) throw new Error(failureMessage(payload, response.status));
    if (!isRecord(payload) || !('data' in payload) || typeof payload.requestId !== 'string') {
      throw new Error(`API 响应格式不正确 [${response.status}]`);
    }

    // 泛型描述后端 DTO 契约；此处只校验统一响应外壳，不替代 DTO 的运行时校验。
    return (payload as unknown as ApiEnvelope<T>).data;
  }

  return { request };
}

export type ApiClient = ReturnType<typeof createApiClient>;
