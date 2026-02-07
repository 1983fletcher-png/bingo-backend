import { Link, useNavigate } from 'react-router-dom';
import '../styles/home.css';

const WHO_ITS_FOR = [
  'Venues',
  'Teachers',
  'Corporate Teams',
  'Libraries',
  'Caregivers',
  'Assisted Living',
  'Youth Programs',
  'Activity Directors',
  'HR & Learning',
];

const GAME_TYPES = [
  {
    id: 'music-bingo',
    title: 'Music Bingo',
    description:
      'Curated themes or build your own. One code for the whole room — host from a tablet, play on any phone.',
    to: '/host?type=bingo',
  },
  {
    id: 'trivia',
    title: 'Trivia',
    description:
      'Packs and custom questions. Multiple choice, true/false. For pubs, teams, and family nights.',
    to: '/host?type=trivia',
  },
  {
    id: 'icebreakers',
    title: 'Icebreakers',
    description:
      'Two Truths, Would You Rather, quick energizers. Low-stakes, high connection.',
    to: '/host?type=icebreakers',
  },
  {
    id: 'edutainment',
    title: 'Edutainment',
    description:
      'Learning games for K–college. Grade bands, subjects, curriculum-aligned content.',
    to: '/host?type=edutainment',
  },
  {
    id: 'team-building',
    title: 'Team Building',
    description:
      'Activities by age, occupation, or situation. Remote teams, retreats, community.',
    to: '/host?type=team-building',
  },
  {
    id: 'custom-training',
    title: 'Custom Training Materials',
    description:
      'Build training and learning content for your company. Custom packs, compliance, onboarding.',
    to: '/host?type=trivia',
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="landing" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header className="landing__header">
        <span className="landing__header-title">The Playroom</span>
        <nav className="landing__header-nav" aria-label="Main">
          <button
            type="button"
            onClick={() => navigate('/calendar')}
            className="landing__header-btn"
          >
            <span aria-hidden>📅</span>
            Activity calendar
          </button>
          <span className="landing__header-help" aria-hidden>Help (coming soon)</span>
        </nav>
      </header>

      <main style={{ flex: 1, width: '100%', padding: '0 24px 48px' }}>
        {/* Hero */}
        <section className="landing__hero" aria-label="Welcome">
          <h1 className="landing__hero-title">Welcome to the Playroom</h1>
          <p className="landing__hero-tagline">
            A shared space for live games, trivia, edutainment, training, and
            interactive learning — hosted anywhere, played everywhere.
          </p>
          <p className="landing__hero-support">
            One room. One link. Everyone&apos;s in — on phones or with printable
            materials when you need them.
          </p>
          {/* Four main cards — 2x2 */}
          <div
            className="landing__hero-cards"
            style={{
              maxWidth: 720,
              gridTemplateColumns: 'repeat(2, 1fr)',
              marginBottom: 32,
            }}
          >
            <Link to="/host" className="landing__hero-card">
              <span className="landing__hero-card-title">Host a room</span>
              <span className="landing__hero-card-desc">
                Start a game — music bingo or trivia. Share the QR or link;
                players join instantly. Control the flow from one screen.
              </span>
            </Link>
            <Link to="/join" className="landing__hero-card">
              <span className="landing__hero-card-title">Join a room</span>
              <span className="landing__hero-card-desc">
                Enter the game code from your host. Play on your phone or
                tablet — no app required.
              </span>
            </Link>
            <Link to="/create" className="landing__hero-card">
              <span className="landing__hero-card-title">Creative Studio</span>
              <span className="landing__hero-card-desc">
                Create a custom page. Menus, training materials, promos, flyers, and more.
              </span>
            </Link>
            <Link to="/learn" className="landing__hero-card">
              <span className="landing__hero-card-title">Learn &amp; Grow Library</span>
              <span className="landing__hero-card-desc">
                Trusted, cited learning cards: plants, animals, crafts, science.
                Calm, layered content for curious minds.
              </span>
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="landing__section"
          aria-label="How it works"
        >
          <h2 className="landing__section-title">How it works</h2>
          <ol className="landing__how-steps">
            <li className="landing__how-step">
              <span className="landing__how-num" aria-hidden>
                1
              </span>
              <div>
                <strong>Create</strong> — Pick a game or build your own. Music
                Bingo, Trivia, Icebreakers, Edutainment, Team Building, or custom
                training materials for your company.
              </div>
            </li>
            <li className="landing__how-step">
              <span className="landing__how-num" aria-hidden>
                2
              </span>
              <div>
                <strong>Share</strong> — One code or QR for everyone; players
                join in seconds. Or use printable materials when devices
                aren&apos;t an option.
              </div>
            </li>
            <li className="landing__how-step">
              <span className="landing__how-num" aria-hidden>
                3
              </span>
              <div>
                <strong>Play</strong> — Host runs it; players use their phones or
                printed materials. Simple, fun, no friction.
              </div>
            </li>
          </ol>
        </section>

        {/* Who it's for */}
        <section
          id="who-its-for"
          className="landing__section"
          aria-label="Who it's for"
        >
          <h2 className="landing__section-title">Who it&apos;s for</h2>
          <p className="landing__section-intro">
            The same simple experience works in a brewery, a classroom, an
            assisted living facility, or a Fortune 500 company.
          </p>
          <ul className="landing__who-grid">
            {WHO_ITS_FOR.map((label) => (
              <li key={label} className="landing__who-item">
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Game types */}
        <section
          id="game-types"
          className="landing__section"
          aria-label="Game types"
        >
          <h2 className="landing__section-title">Game types</h2>
          <p className="landing__section-intro">
            Pick a template and go — or customize to your needs.
          </p>
          <div className="landing__games-grid">
            {GAME_TYPES.map((g) => (
              <Link key={g.id} to={g.to} className="landing__game-card">
                <h3 className="landing__game-title">{g.title}</h3>
                <p className="landing__game-desc">{g.description}</p>
                <span className="landing__game-cta">Get started →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Our approach */}
        <section
          className="landing__section landing__values"
          aria-label="Our approach"
        >
          <h2 className="landing__section-title">Our approach</h2>
          <p className="landing__values-text">
            Calm, welcoming, human. We reduce friction and avoid hype. Digital
            when you want it, printable when you need it.
          </p>
          <p className="landing__values-spirit">
            Knowledge · companionship · education · doing good.
          </p>
        </section>

        <footer className="landing__footer" role="contentinfo">
          <p className="landing__footer-brand">The Playroom</p>
        </footer>
      </main>
    </div>
  );
}
