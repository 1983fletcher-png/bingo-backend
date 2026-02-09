/**
 * Interactive Polling — Create venue and redirect to Host page.
 * No separate Create Poll page: poll creation happens inside the Host page.
 * Route: /poll/start → venue:create → redirect to /poll/join/:venueCode/host
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../lib/socket';
import '../styles/join.css';

const VENUE_STORAGE_KEY = 'playroom_poll_venue';

function saveVenue(venueCode: string, hostToken: string) {
  try {
    localStorage.setItem(VENUE_STORAGE_KEY, JSON.stringify({ venueCode, hostToken }));
  } catch (_) {}
}

export function getStoredVenue(): { venueCode: string; hostToken: string } | null {
  try {
    const raw = localStorage.getItem(VENUE_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.venueCode && data?.hostToken) return { venueCode: data.venueCode, hostToken: data.hostToken };
  } catch {}
  return null;
}

export default function PollVenueStart() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = getSocket();
    const onCreated = (data: { venueCode: string; hostToken: string }) => {
      saveVenue(data.venueCode, data.hostToken);
      navigate(`/poll/join/${data.venueCode}/host`, { replace: true });
    };
    const onErr = (e: { message?: string }) => setError(e?.message || 'Something went wrong');
    s.once('venue:created', onCreated);
    s.once('poll:error', onErr);
    if (s.connected) {
      s.emit('venue:create');
    } else {
      s.once('connect', () => s.emit('venue:create'));
    }
    return () => {
      s.off('venue:created', onCreated);
      s.off('poll:error', onErr);
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="join-page" style={{ maxWidth: 400, margin: '0 auto', padding: 48, textAlign: 'center' }}>
        <p style={{ color: 'var(--error)', marginBottom: 16 }}>{error}</p>
        <a href="/">Go home</a>
      </div>
    );
  }

  return (
    <div className="join-page" style={{ maxWidth: 400, margin: '0 auto', padding: 48, textAlign: 'center' }}>
      <p style={{ color: 'var(--text-secondary)' }}>Setting up your poll…</p>
    </div>
  );
}
