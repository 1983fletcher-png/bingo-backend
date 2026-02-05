/**
 * Hospitality & Venues – sub-options: Menu, Specials, Event, Live Music, Welcome.
 */
import { Link } from 'react-router-dom';
import '../styles/create.css';

const HOSPITALITY_PURPOSES = [
  { id: 'menu', title: 'Menu', description: 'Build a food or drink menu for print, TV, or QR.', to: '/create/hospitality/menu' },
  { id: 'specials', title: 'Daily / Weekly Specials', description: "Highlight today's or this week's specials.", to: '/create/hospitality/specials' },
  { id: 'event', title: 'Event Promotion', description: 'Promote an upcoming event or theme night.', to: '/create/hospitality/event' },
  { id: 'live-music', title: 'Live Music / Featured Performer', description: "Show who's playing and when.", to: '/create/hospitality/live-music' },
  { id: 'welcome', title: 'Welcome / Information Display', description: 'Hours, WiFi, house rules, contact.', to: '/create/hospitality/welcome' },
] as const;

export default function CreateHospitality() {
  return (
    <div className="create">
      <section className="create__hero" aria-label="What do you want to create?">
        <Link to="/create" className="create__back">← All templates</Link>
        <h1 className="create__title">Hospitality & Venues</h1>
        <p className="create__tagline">
          What do you want to create? Choose one and we’ll walk you through it.
        </p>
      </section>
      <div className="create__cards create__cards--list">
        {HOSPITALITY_PURPOSES.map((card) => (
          <Link key={card.id} to={card.to} className="create__card create__card--purpose">
            <span className="create__card-title">{card.title}</span>
            <span className="create__card-desc">{card.description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
