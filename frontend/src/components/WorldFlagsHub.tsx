/**
 * World Flags — hub in Learn & Grow. Lists all countries; links to detail view with flag image, origin, and info.
 * Research standard: facts cross-checked; sources cited; flag images legally sourced (public domain).
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { WORLD_FLAGS, flagImageUrl, FLAG_IMAGE_ATTRIBUTION } from '../data/worldFlagsData';
import '../styles/learn.css';

const REGIONS = Array.from(new Set(WORLD_FLAGS.map((f) => f.region))).sort();

export default function WorldFlagsHub() {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('');

  const filtered = useMemo(() => {
    let list = WORLD_FLAGS;
    if (regionFilter) list = list.filter((f) => f.region === regionFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.capital.toLowerCase().includes(q) ||
          f.code.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, regionFilter]);

  return (
    <article className="learn-page world-flags-hub">
      <Link to="/learn" className="learn-page__back">
        ← Back to Learn & Grow
      </Link>
      <header className="world-flags-hub__header">
        <h1 className="learn-page__title">World Flags</h1>
        <p className="learn-page__intro world-flags-hub__intro">
          Explore flags from every country: origin, meaning, capital, region, and languages.
          Every fact is cross-checked against multiple authoritative sources; flag images are legally sourced (public domain).
          Click a flag to read the story behind it and see citations.
        </p>
        <div className="world-flags-hub__filters">
          <input
            type="search"
            placeholder="Search by country or capital..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="world-flags-hub__search"
            aria-label="Search countries"
          />
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="world-flags-hub__region"
            aria-label="Filter by region"
          >
            <option value="">All regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </header>
      <div className="world-flags-hub__grid">
        {filtered.map((entry) => (
          <Link
            key={entry.code}
            to={`/learn/world-flags-${entry.code}`}
            className="world-flags-card"
          >
            <img
              src={flagImageUrl(entry.code, 160)}
              alt={`Flag of ${entry.name}`}
              className="world-flags-card__img"
              loading="lazy"
            />
            <span className="world-flags-card__name">{entry.name}</span>
            <span className="world-flags-card__region">{entry.region}</span>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="learn-page__empty">No countries match your search.</p>
      )}

      <section className="world-flags-hub__research" aria-label="Research and attribution">
        <h2 className="world-flags-hub__research-title">Research &amp; sources</h2>
        <p>
          Facts in this section are cross-checked against: <strong>CIA World Factbook</strong>, <strong>Encyclopaedia Britannica</strong>, and <strong>Flags of the World (CRW Flags)</strong>.
          Capital, region, adoption year, and flag origin text are verified against these references. We add or correct details when multiple sources align.
        </p>
        <p>
          <strong>Flag images:</strong> {FLAG_IMAGE_ATTRIBUTION.note} Images are served via{' '}
          <a href={FLAG_IMAGE_ATTRIBUTION.url} target="_blank" rel="noopener noreferrer">{FLAG_IMAGE_ATTRIBUTION.provider}</a> (Flagcdn.com).
          No copyright claim is made on state flags; use is for educational purposes.
        </p>
      </section>
    </article>
  );
}
