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
import { fetchJson, normalizeBackendUrl } from '../lib/safeFetch';

export function ViewPage() {
  const { slug } = useParams<{ slug: string }>();
  const [doc, setDoc] = useState<PageBuilderDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError('Missing link');
      return;
    }
    const apiBase = normalizeBackendUrl(
      import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || ''
    );
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
        justifyContent: 'center',
        alignItems: 'flex-start',
        background: 'var(--bg)',
      }}
    >
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
  );
}
