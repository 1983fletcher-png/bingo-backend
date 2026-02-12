/**
 * Ensure a backend base URL has a scheme so fetch() hits the real host.
 * If the value is "example.up.railway.app", returns "https://example.up.railway.app".
 * In dev, logs a warning when url is empty so you know to set VITE_SOCKET_URL or VITE_API_URL.
 */
export function normalizeBackendUrl(url: string): string {
  const raw = (url || '').trim();
  const u = raw.replace(/\/$/, '');
  if (!u) {
    if (import.meta.env?.DEV && typeof console !== 'undefined') {
      console.warn(
        '[safeFetch] Backend URL is empty. Set VITE_SOCKET_URL or VITE_API_URL so share links and API calls work.'
      );
    }
    return '';
  }
  if (/^https?:\/\//i.test(u)) return u;
  return 'https://' + u;
}

/**
 * Same as normalizeBackendUrl; use when you need to show apiBase in UI or assert it in prod.
 * In production, returns empty string if env is missing (caller should show error).
 */
export function getApiBase(): string {
  const raw =
    import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || '';
  return normalizeBackendUrl(raw);
}

/**
 * Fetch and parse JSON safely. If the response is HTML (e.g. 404 page) or
 * not valid JSON, returns a friendly error instead of throwing a parse error.
 */
export async function fetchJson<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; data?: T; error?: string; status: number }> {
  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (e) {
    return {
      ok: false,
      status: 0,
      error: e instanceof Error ? e.message : 'Network request failed',
    };
  }
  const text = await res.text();
  let data: T;
  try {
    data = text ? (JSON.parse(text) as T) : ({} as T);
  } catch {
    return {
      ok: false,
      status: res.status,
      error:
        'API returned a web page instead of JSON. Check that the backend URL is correct (e.g. VITE_SOCKET_URL or VITE_API_URL) and the server is running.',
    };
  }
  return { ok: res.ok, data, status: res.status };
}
