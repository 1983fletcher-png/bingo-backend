import { Link, useNavigate } from 'react-router-dom';

const cardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  padding: '28px 24px',
  borderRadius: 16,
  textDecoration: 'none',
  color: '#e2e8f0',
  minHeight: 200,
  boxShadow: '0 4px 20px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.2)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  border: '1px solid rgba(255,255,255,0.06)',
};

const cardHoverStyle: React.CSSProperties = {
  transform: 'translateY(-4px)',
  boxShadow: '0 12px 40px rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.25)',
};

function Card({
  to,
  title,
  description,
  accent,
}: {
  to: string;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <Link
      to={to}
      style={{
        ...cardStyle,
        background: `linear-gradient(180deg, transparent 0%, ${accent}22 60%, ${accent}18 100%)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = cardHoverStyle.transform!;
        e.currentTarget.style.boxShadow = cardHoverStyle.boxShadow!;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = cardStyle.boxShadow!;
      }}
    >
      <h2 style={{ margin: '0 0 8px', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
        {title}
      </h2>
      <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(226,232,240,0.88)', lineHeight: 1.45 }}>
        {description}
      </p>
    </Link>
  );
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a1a2e 0%, #16162a 100%)' }}>
      {/* Header with calendar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          maxWidth: 1000,
          margin: '0 auto',
        }}
      >
        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e2e8f0' }}>The Playroom</span>
        <button
          type="button"
          onClick={() => navigate('/calendar')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10,
            color: '#cbd5e0',
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          <span aria-hidden>📅</span>
          Activity calendar
        </button>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 24px 48px' }}>
        {/* Welcome */}
        <section style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1
            style={{
              margin: '0 0 12px',
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              fontWeight: 700,
              color: '#f7fafc',
              letterSpacing: '-0.03em',
            }}
          >
            Welcome to the Playroom
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '1.05rem',
              color: 'rgba(226,232,240,0.85)',
              lineHeight: 1.5,
              maxWidth: 520,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            One space for live games, trivia, learning, and connection. Host from one device; everyone joins with a single link.
          </p>
        </section>

        {/* Four cards — 2x2 grid, large and prominent */}
        <section
          className="home-cards-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 20,
            marginBottom: 48,
          }}
        >
          <Card
            to="/host"
            title="Host a room"
            description="Start a game—music bingo or trivia. Share the QR or link; players join instantly. Control the flow from one screen."
            accent="#6cb4ee"
          />
          <Card
            to="/join"
            title="Join a room"
            description="Enter the game code from your host. Play on your phone or tablet—no app required."
            accent="#86efac"
          />
          <Card
            to="/create"
            title="Create a page"
            description="Menus, promos, and flyers for screens and print. Build food and drink menus, event promos, welcome boards, and specials—then share or display."
            accent="#fcd34d"
          />
          <Card
            to="/learn"
            title="Learn & Grow"
            description="Trusted, cited learning cards: plants, animals, crafts, science, and more. Calm, layered content for curious minds—from quick facts to deep dives."
            accent="#c4b5fd"
          />
        </section>

        {/* Who it's for */}
        <section
          style={{
            padding: '28px 24px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}
        >
          <h2
            style={{
              margin: '0 0 12px',
              fontSize: '1.15rem',
              fontWeight: 600,
              color: '#e2e8f0',
            }}
          >
            Who it's for
          </h2>
          <p
            style={{
              margin: '0 0 20px',
              fontSize: '1rem',
              color: 'rgba(226,232,240,0.88)',
              lineHeight: 1.55,
            }}
          >
            The same simple experience works in a brewery, a classroom, an assisted living facility, or a Fortune 500 company.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            {['Breweries & venues', 'Schools & libraries', 'Care & wellness', 'Business & training'].map(
              (label) => (
                <span
                  key={label}
                  style={{
                    padding: '8px 14px',
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 8,
                    fontSize: '0.875rem',
                    color: '#cbd5e0',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {label}
                </span>
              )
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
