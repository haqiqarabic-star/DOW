/**
 * Safe API request helper to prevent raw SyntaxError JSON parsing crashes
 * like "Unexpected token 'T', 'The page c'... is not valid JSON".
 */

export interface SafeFetchResult<T = any> {
  ok: boolean;
  status: number;
  data: T;
}

export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit,
  timeoutMs = 30000
): Promise<SafeFetchResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timer);

    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();

    let data: any = null;
    if (text && text.trim()) {
      try {
        data = JSON.parse(text);
      } catch {
        // Response was not JSON (e.g. proxy HTML, 502/503/504, or Cloud Run wake-up screen)
        if (
          text.includes('The page') ||
          text.includes('502 Bad Gateway') ||
          text.includes('503 Service') ||
          text.includes('504 Gateway') ||
          text.includes('<html') ||
          text.includes('<!DOCTYPE')
        ) {
          throw new Error('السيرفر قيد إعادة التشغيل أو في مرحلة الاستيقاظ المؤقت. يرجى الانتظار بضع ثوانٍ ثم الضغط مجدداً.');
        }
        throw new Error('تعذر معالجة استجابة السيرفر بشكل صحيح. يرجى إعادة المحاولة.');
      }
    }

    return {
      ok: res.ok,
      status: res.status,
      data: data as T
    };
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error('استغرقت الاستجابة وقتاً أطول من المعتاد. يرجى التأكد من اتصال الإنترنت وإعادة المحاولة.');
    }
    throw err;
  }
}
