import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';

type CardAccent = 'violet' | 'cyan' | 'amber' | 'emerald';

type HeroCardData = {
  title: string;
  description: string;
  cta: string;
  href: string;
  accent: CardAccent;
};

function useSpotlight() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0, show: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      setPos({
        x: e.clientX - r.left,
        y: e.clientY - r.top,
        show: true,
      });
    };
    const onLeave = () => setPos((p) => ({ ...p, show: false }));

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const style = useMemo(() => {
    const opacity = pos.show ? 1 : 0;
    return {
      background: `radial-gradient(500px circle at ${pos.x}px ${pos.y}px,
        rgba(255,255,255,0.10),
        rgba(255,255,255,0.04) 35%,
        rgba(255,255,255,0.00) 60%)`,
      opacity,
    } as React.CSSProperties;
  }, [pos]);

  return { ref, style };
}

function Arrow() {
  return (
    <span className="landing__card-arrow" aria-hidden>
      →
    </span>
  );
}

function HeroCard({ card }: { card: HeroCardData }) {
  const { ref, style } = useSpotlight();

  return (
    <Link
      to={card.href}
      className={`landing__hero-card landing__hero-card--${card.accent}`}
    >
      <div className="landing__hero-card-glow" data-accent={card.accent} aria-hidden />
      <div ref={ref} className="landing__hero-card-spotlight" aria-hidden>
        <div className="landing__hero-card-spotlight-inner" style={style} />
      </div>

      <div className="landing__hero-card-inner">
        <h2 className="landing__hero-card-title">{card.title}</h2>
        <p className="landing__hero-card-desc">{card.description}</p>
        <div className="landing__hero-card-cta">
          <span>{card.cta}</span>
          <Arrow />
        </div>
      </div>

      <div className="landing__hero-card-bottom-line" aria-hidden />
    </Link>
  );
}

const HERO_CARDS: HeroCardData[] = [
  {
    title: 'Host a Room',
    description:
      'Trivia, games, training, and group activities — everyone joins with one link.',
    cta: 'Start hosting',
    href: '/host',
    accent: 'violet',
  },
  {
    title: 'Interactive Polling',
    description: 'Ask a question, show results live, and keep groups engaged.',
    cta: 'Start a poll',
    href: '/poll/start',
    accent: 'cyan',
  },
  {
    title: 'Activity Calendar',
    description:
      'Curated observances, themes, and credible notes — ready to use or print.',
    cta: 'View calendar',
    href: '/calendar',
    accent: 'amber',
  },
  {
    title: 'Creative Studio',
    description: 'Build training pages, flyers, menus, promos, and printables.',
    cta: 'Create',
    href: '/create',
    accent: 'emerald',
  },
];

export default function Home() {
  return (
    <div className="landing landing--premium">
      {/* Atmospheric background */}
      <div className="landing__atmosphere" aria-hidden>
        <div className="landing__atmosphere-gradient" />
        <div className="landing__atmosphere-orb" />
        <div className="landing__atmosphere-dots" />
      </div>

      <header className="landing__header landing__header--toolbar">
        <div className="landing__header-inner">
          <div className="landing__header-brand">
            <div className="landing__header-logo" />
            <span className="landing__header-name">The Playroom</span>
          </div>
          <p className="landing__header-tagline" aria-hidden>
            Designed for venues, activity directors, teachers, caregivers, libraries, and teams.
          </p>
        </div>
      </header>

      <main className="landing__main">
        {/* Hero */}
        <section className="landing__hero" aria-label="Welcome">
          <h1 className="landing__hero-title">Welcome to the Playroom</h1>
          <p className="landing__hero-tagline">
            Simple, shared experiences for games, learning, and group connection.
          </p>
        </section>

        {/* Hero cards */}
        <section className="landing__hero-cards-wrap">
          <div className="landing__hero-cards landing__hero-cards--grid">
            {HERO_CARDS.map((c) => (
              <HeroCard key={c.title} card={c} />
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="landing__section" aria-label="How it works">
          <h2 className="landing__section-title">How it works</h2>
          <ol className="landing__how-steps">
            <li className="landing__how-step">
              <span className="landing__how-num" aria-hidden>1</span>
              <div>
                <strong>Create</strong> — Pick a game or build your own. Trivia, icebreakers, team building,
                edutainment, or custom training.
              </div>
            </li>
            <li className="landing__how-step">
              <span className="landing__how-num" aria-hidden>2</span>
              <div>
                <strong>Share</strong> — One code or QR; players join in seconds. Printable materials when
                you need them.
              </div>
            </li>
            <li className="landing__how-step">
              <span className="landing__how-num" aria-hidden>3</span>
              <div>
                <strong>Play</strong> — Host runs it; everyone plays on phones or print. Simple, no friction.
              </div>
            </li>
          </ol>
        </section>

        {/* Who it's for */}
        <section id="who-its-for" className="landing__section" aria-label="Who it's for">
          <h2 className="landing__section-title">Who it&apos;s for</h2>
          <p className="landing__section-intro landing__section-intro--solo">
            The same simple experience works in a brewery, a classroom, an assisted living facility, or a
            Fortune 500 company.
          </p>
        </section>

        {/* Our approach */}
        <section className="landing__section landing__values" aria-label="Our approach">
          <h2 className="landing__section-title">Our approach</h2>
          <p className="landing__values-text">
            Calm, welcoming, and fun. We reduce friction and avoid hype. Digital when you want it,
            printable when you need it.
          </p>
          <p className="landing__values-spirit">Knowledge · companionship · education · doing good.</p>
        </section>

        <footer className="landing__footer" role="contentinfo">
          <p className="landing__footer-brand">The Playroom</p>
          <p className="landing__footer-credit">Created by Jason Fletcher</p>
        </footer>
      </main>
    </div>
  );
}
