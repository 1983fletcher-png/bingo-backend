/**
 * Public view of a saved page. Fetches document by slug and renders the right preview by type.
 * Supports: menu, event, live-music, welcome (PageBuilderDocument types in this repo).
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MenuPreview } from '../components/MenuPreview';
import { EventPreview } from '../components/EventPreview';
import { LiveMusicPreview } from '../components/LiveMusicPreview';
import { WelcomePreview } from '../components/WelcomePreview';
import type {
  PageBuilderDocument,
  MenuBuilderState,
  EventBuilderState,
  LiveMusicBuilderState,
  WelcomeBuilderState,
} from '../types/pageBuilder';
import { fetchJson, getApiBase } from '../lib/safeFetch';

export function ViewPage() {
  const { slug } = useParams<{ slug: string }>();
  const [doc, setDoc] = useState<PageBuilderDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [healthTestResult, setHealthTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError('Missing link');
      return;
    }
    const apiBase = getApiBase();
    if (!apiBase) {
      setError('Backend not configured');
      return;
    }
    fetchJson<PageBuilderDocument>(`${apiBase}/api/page-builder/${slug}`)
      .then((res) => {
        if (res.ok && res.data) setDoc(res.data);
        else setError(res.error || 'Not found');
      })
      .catch(() => setError('Failed to load'));
  }, [slug]);

  const handleTestBackend = async () => {
    const apiBase = getApiBase();
    setHealthTestResult(null);
    if (!apiBase) {
      setHealthTestResult('No backend URL');
      return;
    }
    try {
      const res = await fetchJson<{ ok?: boolean }>(`${apiBase}/health`);
      setHealthTestResult(res.ok && res.data?.ok ? 'OK' : res.error || `HTTP ${res.status}`);
    } catch {
      setHealthTestResult('Request failed');
    }
  };

  if (error) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          background: 'var(--bg)',
          color: 'var(--text)',
        }}
      >
        {import.meta.env.DEV && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            apiBase: {getApiBase() || '(not set)'}
            <button type="button" onClick={handleTestBackend} style={{ marginLeft: 8 }}>Test backend</button>
            {healthTestResult != null && <span style={{ marginLeft: 8 }}>→ {healthTestResult}</span>}
          </div>
        )}
        <p>{error}</p>
        <Link to="/" style={{ color: 'var(--accent)' }}>
          ← Back to Playroom
        </Link>
      </div>
    );
  }

  if (!doc) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
          color: 'var(--text)',
        }}
      >
        <p>Loading…</p>
      </div>
    );
  }

  const type = doc.type || 'menu';

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        background: 'var(--bg)',
      }}
    >
      {import.meta.env.DEV && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, alignSelf: 'stretch', textAlign: 'center' }}>
          apiBase: {getApiBase() || '(not set)'}
          <button type="button" onClick={handleTestBackend} style={{ marginLeft: 8 }}>Test backend</button>
          {healthTestResult != null && <span style={{ marginLeft: 8 }}>→ {healthTestResult}</span>}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', flex: 1 }}>
      {type === 'menu' && <MenuPreview state={doc as MenuBuilderState} />}
      {type === 'event' && <EventPreview state={doc as EventBuilderState} />}
      {type === 'live-music' && (
        <LiveMusicPreview state={doc as LiveMusicBuilderState} />
      )}
      {type === 'welcome' && (
        <WelcomePreview state={doc as WelcomeBuilderState} />
      )}
      {!['menu', 'event', 'live-music', 'welcome'].includes(type) && (
        <MenuPreview state={doc as MenuBuilderState} />
      )}
      </div>
    </div>
  );
}
