/**
 * Placeholder for Create sub-routes that are not yet implemented in this repo.
 * Full builders (Menu, Event, Live Music, Welcome) exist in music-bingo-app and can be ported.
 */
import { Link } from 'react-router-dom';
import '../styles/create.css';

type CreatePlaceholderProps = {
  title: string;
  backTo: string;
  backLabel?: string;
};

export default function CreatePlaceholder({ title, backTo, backLabel = '← Back' }: CreatePlaceholderProps) {
  return (
    <div className="create">
      <section className="create__hero">
        <Link to={backTo} className="create__back">{backLabel}</Link>
        <h1 className="create__title">{title}</h1>
        <p className="create__tagline" style={{ marginBottom: 24 }}>
          This builder is being restored to the Playroom. You’ll get scrape-from-URL, logos, Facebook/Instagram links, and share links.
        </p>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
          For now, use <Link to="/activity" style={{ color: 'var(--accent)' }}>Activity Room</Link> for games and the Activity calendar for events.
        </p>
      </section>
    </div>
  );
}
