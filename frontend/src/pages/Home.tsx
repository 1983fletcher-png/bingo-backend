import { Link } from 'react-router-dom';
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

const GAME_TYPES: Array<{
  id: string;
  title: string;
  description: string;
  to: string;
  secondaryLabel?: string;
  secondaryTo?: string;
}> = [
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
      'Pick a verified pack and run — or build your own. Multiple choice, true/false. For pubs, teams, and family nights.',
    to: '/host/create?trivia',
    secondaryLabel: 'Build custom',
    secondaryTo: '/host?type=trivia',
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
  return (
    <div className="landing" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <main className="landing__main">
        <section className="landing__hero" aria-label="Welcome">
          <h1 className="landing__hero-title">Welcome to the Playroom</h1>
          <p className="landing__hero-tagline">
            A shared space for live games, trivia, edutainment, training, and interactive learning.
          </p>
          <p className="landing__hero-hosted">Hosted anywhere, played everywhere.</p>
          <p className="landing__hero-support">
            One link, one room, everyone&apos;s in. On phones, tablets, computers, or with printable materials when you need them.
          </p>
          <div className="landing__hero-cards">
            <Link to="/host" className="landing__hero-card">
              <span className="landing__hero-card-title">Host a room</span>
              <span className="landing__hero-card-desc">
                Start a game. Music bingo, trivia, icebreakers, team building and more. Share the QR or link. Players join from one screen.
              </span>
              <span className="landing__game-cta">Get started →</span>
            </Link>
            <Link to="/calendar" className="landing__hero-card">
              <span className="landing__hero-card-title">Activity calendar</span>
              <span className="landing__hero-card-desc">
                Observances and holidays to guide your planning. Create fun, meaningful, memorable events with ease.
              </span>
              <span className="landing__game-cta">View calendar →</span>
            </Link>
            <Link to="/poll/start" className="landing__hero-card">
              <span className="landing__hero-card-title">Interactive Polling</span>
              <span className="landing__hero-card-desc">
                Live crowd input, instant results. One question, one QR.
              </span>
              <span className="landing__game-cta">Start a poll →</span>
            </Link>
            <Link to="/create" className="landing__hero-card">
              <span className="landing__hero-card-title">Creative Studio</span>
              <span className="landing__hero-card-desc">
                Custom pages: menus, promos, flyers, training materials.
              </span>
              <span className="landing__game-cta">Create →</span>
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
              <span className="landing__how-num" aria-hidden>1</span>
              <div><strong>Create</strong> — Pick a game or build your own: Music Bingo, Trivia, Icebreakers, Edutainment, Team Building, or custom training.</div>
            </li>
            <li className="landing__how-step">
              <span className="landing__how-num" aria-hidden>2</span>
              <div><strong>Share</strong> — One code or QR; players join in seconds. Printable materials when you need them.</div>
            </li>
            <li className="landing__how-step">
              <span className="landing__how-num" aria-hidden>3</span>
              <div><strong>Play</strong> — Host runs it; everyone plays on phones or print. Simple, no friction.</div>
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
            Pick a template and go, or customize to your needs.
          </p>
          <div className="landing__games-grid">
            {GAME_TYPES.map((g) =>
              g.secondaryTo ? (
                <div key={g.id} className="landing__game-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link to={g.to} style={{ flex: 1, textDecoration: 'none', color: 'inherit' }}>
                    <h3 className="landing__game-title">{g.title}</h3>
                    <p className="landing__game-desc">{g.description}</p>
                    <span className="landing__game-cta">Play a pack →</span>
                  </Link>
                  <Link to={g.secondaryTo} className="landing__game-cta" style={{ fontSize: 14, opacity: 0.9 }}>
                    {g.secondaryLabel} →
                  </Link>
                </div>
              ) : (
                <Link key={g.id} to={g.to} className="landing__game-card">
                  <h3 className="landing__game-title">{g.title}</h3>
                  <p className="landing__game-desc">{g.description}</p>
                  <span className="landing__game-cta">Get started →</span>
                </Link>
              )
            )}
          </div>
        </section>

        {/* Our approach */}
        <section
          className="landing__section landing__values"
          aria-label="Our approach"
        >
          <h2 className="landing__section-title">Our approach</h2>
          <p className="landing__values-text">
            Calm, welcoming, human and fun. We reduce friction and avoid hype. Digital when you want it, printable when you need it.
          </p>
          <p className="landing__values-spirit">
            Knowledge · companionship · education · doing good.
          </p>
        </section>

        <footer className="landing__footer" role="contentinfo">
          <p className="landing__footer-brand">The Playroom</p>
          <p className="landing__footer-credit">Created by Jason Fletcher</p>
        </footer>
      </main>
    </div>
  );
}
