import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function JoinEntry() {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed) navigate(`/join/${trimmed}`);
  };

  return (
    <div style={{ minHeight: '100vh', padding: 24, maxWidth: 420, margin: '0 auto' }}>
      <Link
        to="/"
        style={{ display: 'inline-block', marginBottom: 24, color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none' }}
      >
        ← Back to Playroom
      </Link>
      <h1 style={{ margin: '0 0 8px', fontSize: '1.75rem' }}>Join a room</h1>
      <p style={{ color: '#94a3b8', marginBottom: 28 }}>
        Enter the game code your host shared. It's on the display screen or they can tell you.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. ABC12"
          maxLength={12}
          autoFocus
          style={{
            width: '100%',
            padding: '14px 18px',
            fontSize: '1.1rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10,
            color: '#e2e8f0',
            marginBottom: 16,
          }}
        />
        <button
          type="submit"
          disabled={!code.trim()}
          style={{
            width: '100%',
            padding: '14px 24px',
            background: code.trim() ? '#3b82f6' : 'rgba(59,130,246,0.4)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: '1rem',
            fontWeight: 600,
            cursor: code.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          Join game
        </button>
      </form>
    </div>
  );
}
