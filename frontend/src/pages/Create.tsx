import { Link } from 'react-router-dom';

export default function Create() {
  return (
    <div style={{ minHeight: '100vh', padding: 24, maxWidth: 560, margin: '0 auto' }}>
      <Link
        to="/"
        style={{ display: 'inline-block', marginBottom: 24, color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none' }}
      >
        ← Back to Playroom
      </Link>
      <h1 style={{ margin: '0 0 12px', fontSize: '1.75rem' }}>Create a page</h1>
      <p style={{ color: '#cbd5e0', lineHeight: 1.6, marginBottom: 24 }}>
        Build menus, promos, and flyers for your venue or event. Food and drink menus for screens or print,
        daily or weekly specials, event promotions, live music boards, and welcome or info displays—all from
        simple, guided steps. Share a link or show on a screen.
      </p>
      <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
        The full page builder (Hospitality, Education, Care, Business, and General templates) is coming soon
        to this app. For now, use the Playroom to host games and explore Learn & Grow.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          marginTop: 20,
          padding: '12px 20px',
          background: 'rgba(255,255,255,0.1)',
          color: '#e2e8f0',
          borderRadius: 10,
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        Back to home
      </Link>
    </div>
  );
}
