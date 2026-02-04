import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ padding: 24, maxWidth: 420, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0, fontSize: '1.75rem' }}>The Playroom</h1>
      <p style={{ color: '#a0aec0', marginBottom: 24 }}>
        Trivia, music bingo, and team building. You host; players join one link.
      </p>
      <Link
        to="/host"
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: '#2d3748',
          color: '#e2e8f0',
          borderRadius: 8,
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        Host a game
      </Link>
    </div>
  );
}
