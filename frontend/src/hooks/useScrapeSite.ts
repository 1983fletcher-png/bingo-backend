/**
 * Shared hook for venue/page scraper. Uses same backend API as Host.
 */
import { useState, useCallback } from 'react';
import { fetchJson, normalizeBackendUrl } from '../lib/safeFetch';
import type { ScrapeResult } from '../types/pageBuilder';

function getApiBase(): string {
  return normalizeBackendUrl(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || '');
}

export function useScrapeSite() {
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [data, setData] = useState<ScrapeResult | null>(null);

  const scrape = useCallback(async (url: string) => {
    const u = url.trim();
    if (!u) return;
    setScraping(true);
    setError(null);
    setSuccess(null);
    const apiBase = getApiBase();
    if (!apiBase) {
      setError('Backend URL not set. Set VITE_SOCKET_URL or VITE_API_URL to your Railway backend and redeploy.');
      setScraping(false);
      return;
    }
    const apiUrl = `${apiBase}/api/scrape-site?url=${encodeURIComponent(u)}`;
    const result = await fetchJson<ScrapeResult & { error?: string }>(apiUrl);
    setScraping(false);
    if (!result.ok || result.error) {
      setError(result.error ?? (result.data?.error as string) ?? 'Request failed. You can add details manually.');
      setData(null);
      return;
    }
    const d = result.data;
    if (d?.error) {
      setError(d.error);
      setData(null);
      return;
    }
    setData({
      logoUrl: d?.logoUrl ?? null,
      colors: d?.colors ?? [],
      title: d?.title ?? null,
      description: d?.description ?? null,
      siteUrl: d?.siteUrl,
      foodMenuUrl: d?.foodMenuUrl ?? null,
      drinkMenuUrl: d?.drinkMenuUrl ?? null,
      eventsUrl: d?.eventsUrl ?? null,
      facebookUrl: d?.facebookUrl ?? null,
      instagramUrl: d?.instagramUrl ?? null,
    });
    setSuccess('Fetched. Use the toggles below to drop into your page.');
  }, []);

  const clear = useCallback(() => {
    setError(null);
    setSuccess(null);
    setData(null);
  }, []);

  return { scrape, scraping, error, success, data, clear };
}
