/**
 * World Flag detail — single country: flag image, origin, capital, region, languages, cited sources, image attribution.
 */
import { Link } from 'react-router-dom';
import {
  WORLD_FLAGS,
  flagImageUrl,
  getEntrySources,
  FLAG_IMAGE_ATTRIBUTION,
} from '../data/worldFlagsData';
import '../styles/learn.css';

export default function WorldFlagDetailView({ code }: { code: string }) {
  const entry = WORLD_FLAGS.find((f) => f.code.toLowerCase() === code.toLowerCase());

  if (!entry) {
    return (
      <div className="learn-page">
        <Link to="/learn/world-flags" className="learn-page__back">
          ← Back to World Flags
        </Link>
        <p className="learn-page__error">Country not found.</p>
      </div>
    );
  }

  const sources = getEntrySources(entry);

  return (
    <article className="learn-page world-flag-detail">
      <Link to="/learn/world-flags" className="learn-page__back">
        ← Back to World Flags
      </Link>
      <header className="world-flag-detail__header">
        <img
          src={flagImageUrl(entry.code, 320)}
          alt={`Flag of ${entry.name}`}
          className="world-flag-detail__flag"
        />
        <h1 className="learn-page__title world-flag-detail__title">{entry.name}</h1>
        <p className="world-flag-detail__meta">
          <span><strong>Capital:</strong> {entry.capital}</span>
          <span><strong>Region:</strong> {entry.region}</span>
          {entry.languages && (
            <span><strong>Languages:</strong> {entry.languages}</span>
          )}
          {entry.adopted != null && entry.adopted > 0 && (
            <span><strong>Flag adopted:</strong> {entry.adopted}</span>
          )}
        </p>
      </header>
      <section className="world-flag-detail__section">
        <h2 className="world-flag-detail__section-title">Origin & meaning</h2>
        <p className="world-flag-detail__origin">{entry.flagOrigin}</p>
      </section>
      <section className="world-flag-detail__section world-flag-detail__sources">
        <h2 className="world-flag-detail__section-title">Sources</h2>
        <p className="world-flag-detail__sources-intro">
          Facts on this page are cross-checked against the following references.
        </p>
        <ul className="world-flag-detail__sources-list">
          {sources.map((s) => (
            <li key={s.name}>
              {s.url ? (
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="world-flag-detail__source-link">
                  {s.name}
                </a>
              ) : (
                <span>{s.name}</span>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section className="world-flag-detail__section world-flag-detail__attribution" aria-label="Flag image attribution">
        <h2 className="world-flag-detail__section-title">Flag image</h2>
        <p className="world-flag-detail__attribution-note">
          {FLAG_IMAGE_ATTRIBUTION.note}
        </p>
        <p className="world-flag-detail__attribution-provider">
          Image provider:{' '}
          <a href={FLAG_IMAGE_ATTRIBUTION.url} target="_blank" rel="noopener noreferrer">
            {FLAG_IMAGE_ATTRIBUTION.provider}
          </a>
        </p>
      </section>
    </article>
  );
}
