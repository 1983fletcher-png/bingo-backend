/**
 * Time Travel Wormhole — category-driven catalog (film, TV, literature, comics, music, fun facts).
 * Renders from time-travel-wormhole.json. Image slots show when URL is a real R2 URL (not placeholder).
 */
import { Link } from 'react-router-dom';
import wormholeData from '../data/time-travel-wormhole.json';
import '../styles/learn.css';

const data = wormholeData as TimeTravelWormholeData;

function isPlaceholder(url: string): boolean {
  return !url || url.startsWith('R2_URL_');
}

export default function TimeTravelWormholeView() {
  return (
    <article className="learn-page learn-page-view wormhole">
      <Link to="/learn" className="learn-page__back">
        ← Back to Learn & Grow
      </Link>

      <header className="learn-page-view__header">
        <h1 className="learn-page-view__title">{data.section}</h1>
      </header>

      {data.heroImage && !isPlaceholder(data.heroImage) && (
        <div className="wormhole__hero">
          <img src={data.heroImage} alt="" className="wormhole__hero-img" />
        </div>
      )}

      {data.intro?.text && (
        <section className="wormhole__intro">
          <p className="wormhole__intro-text">{data.intro.text}</p>
          {(data.intro.imageSlots?.length ?? 0) > 0 && (
            <div className="wormhole__intro-images">
              {(data.intro.imageSlots ?? [])
                .filter((url: string) => !isPlaceholder(url))
                .map((url: string, i: number) => (
                  <img key={i} src={url} alt="" className="wormhole__intro-img" />
                ))}
            </div>
          )}
        </section>
      )}

      <div className="wormhole__categories">
        {data.categories.map((cat) => (
          <section key={cat.id} className="wormhole__category" aria-labelledby={`wormhole-cat-${cat.id}`}>
            <h2 id={`wormhole-cat-${cat.id}`} className="wormhole__category-title">
              {cat.title}
            </h2>
            {cat.description && (
              <p className="wormhole__category-desc">{cat.description}</p>
            )}
            <div className="wormhole__entries">
              {cat.entries.map((entry, idx) => (
                <EntryBlock key={idx} entry={entry} isFunFact={cat.id === 'fun-facts'} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {(data.metadata?.tags?.length ?? 0) > 0 && (
        <footer className="wormhole__footer">
          <span className="wormhole__tags-label">Tags: </span>
          <span className="wormhole__tags">{(data.metadata?.tags ?? []).join(', ')}</span>
        </footer>
      )}
    </article>
  );
}

function EntryBlock({
  entry,
  isFunFact,
}: {
  entry: WormholeEntry | FunFactEntry;
  isFunFact: boolean;
}) {
  if (isFunFact && 'fact' in entry) {
    return (
      <div className="wormhole__entry wormhole__entry--fact">
        <p className="wormhole__entry-fact">{entry.fact}</p>
        {entry.source && (
          <a href={entry.source} target="_blank" rel="noopener noreferrer" className="wormhole__source-link">
            Source
          </a>
        )}
      </div>
    );
  }

  const e = entry as WormholeEntry;
  const imageUrls = (e.imageSlots ?? []).filter((url) => !isPlaceholder(url));

  return (
    <div className="wormhole__entry">
      <h3 className="wormhole__entry-title">{e.title}</h3>
      <p className="wormhole__entry-desc">{e.description}</p>
      {(e.themes?.length ?? 0) > 0 && (
        <ul className="wormhole__themes">
          {(e.themes ?? []).map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
      {imageUrls.length > 0 && (
        <div className="wormhole__entry-images">
          {imageUrls.map((url, i) => (
            <img key={i} src={url} alt="" className="wormhole__entry-img" />
          ))}
        </div>
      )}
      {(e.sourceLinks?.length ?? 0) > 0 && (
        <div className="wormhole__sources">
          {(e.sourceLinks ?? []).map((href, i) => (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="wormhole__source-link">
              {new URL(href).hostname.replace(/^www\./, '')}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

interface TimeTravelWormholeData {
  section: string;
  heroImage: string;
  intro?: { text: string; imageSlots?: string[] };
  categories: WormholeCategory[];
  metadata?: { tags?: string[]; pageId?: string; created?: string; author?: string };
}

interface WormholeCategory {
  id: string;
  title: string;
  description?: string;
  entries: (WormholeEntry | FunFactEntry)[];
}

interface WormholeEntry {
  title: string;
  description: string;
  themes?: string[];
  imageSlots?: string[];
  sourceLinks?: string[];
}

interface FunFactEntry {
  fact: string;
  source?: string;
}
