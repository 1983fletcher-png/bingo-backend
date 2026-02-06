import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchJson } from '../lib/safeFetch';
import LearningPageView from '../components/LearningPageView';
import BakingSodaVolcanoExplorationView from '../components/BakingSodaVolcanoExplorationView';
import CraftsStemHub from '../components/CraftsStemHub';
import CraftsStemProjectView from '../components/CraftsStemProjectView';
import { bakingSodaVolcanoPage, timeTravelPage, nikolaTeslaPage, albertEinsteinPage, isaacNewtonPage, thomasEdisonPage } from '../types/learningEngine';
import { generatedPageToLearningPage } from '../lib/learningEngineValidation';
import { slimeEnginePage } from '../data/learningEnginePages/slimePage';
import { northCarolinaEnginePage } from '../data/learningEnginePages/northCarolinaPage';
import NorthCarolinaExplorationView from '../components/NorthCarolinaExplorationView';
import NC_IMAGES from '../data/northCarolinaImages';
import type { VolcanoImage, VolcanoImageRegistry } from '../types/volcanoImages';
import volcanoImagesRegistry from '../data/volcano-images.json';
import '../styles/learn.css';

const API_BASE =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '' : window.location.origin);

/** Canonical learning pages (slug segment or id) render from static schema, not API. */
const STATIC_LEARNING_PAGES: Record<string, { page: typeof bakingSodaVolcanoPage }> = {
  'baking-soda-volcano': { page: bakingSodaVolcanoPage },
  'time-travel': { page: timeTravelPage },
  'time-travel-wormhole': { page: timeTravelPage },
  'nikola-tesla': { page: nikolaTeslaPage },
  'albert-einstein': { page: albertEinsteinPage },
  'isaac-newton': { page: isaacNewtonPage },
  'thomas-edison': { page: thomasEdisonPage },
};

/** Learning Engine–generated pages (fixed backbone: sections, tiers, cross-links, trivia). Converted to LearningPage for render. */
const ENGINE_PAGES: Record<string, { page: ReturnType<typeof generatedPageToLearningPage> }> = {
  'slime': { page: generatedPageToLearningPage(slimeEnginePage) },
  'north-carolina': { page: generatedPageToLearningPage(northCarolinaEnginePage) },
};

function getVolcanoImagesForSlug(slug: string): VolcanoImage[] {
  const bySlug = (volcanoImagesRegistry as VolcanoImageRegistry)[slug];
  if (!bySlug) return [];
  return [
    ...(bySlug.hero ?? []),
    ...(bySlug.section ?? []),
    ...(bySlug.gallery ?? []),
    ...(bySlug.diagram ?? []),
  ];
}

type Card = {
  id: string;
  title: string;
  summary: string;
  audienceLayers?: Record<string, { summary?: string; sections?: Record<string, string> }>;
  sections?: { key: string; title: string }[];
  sources?: { title: string; institution: string; url?: string }[];
  tags?: string[];
};

export default function LearnCard() {
  const { id } = useParams<{ id: string }>();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layer, setLayer] = useState<'child' | 'learner' | 'explorer' | 'deepDive'>('learner');

  const staticPage = id ? STATIC_LEARNING_PAGES[id] : null;
  const enginePage = id ? ENGINE_PAGES[id] : null;

  useEffect(() => {
    if (!id || staticPage || enginePage) {
      if (staticPage || enginePage) setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetchJson<Card>(`${API_BASE}/api/learn/cards/${encodeURIComponent(id)}`);
      if (cancelled) return;
      if (res.ok && res.data) setCard(res.data);
      else setError(res.error || 'Card not found');
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id, staticPage, enginePage]);

  if (id === 'crafts-stem') {
    return (
      <div className="learn-page">
        <CraftsStemHub />
      </div>
    );
  }

  if (id?.startsWith('crafts-stem-')) {
    const slug = id.replace(/^crafts-stem-/, '');
    return (
      <div className="learn-page">
        <CraftsStemProjectView slug={slug} />
      </div>
    );
  }

  if (id === 'north-carolina' && enginePage) {
    return <NorthCarolinaExplorationView page={enginePage.page} ncImages={NC_IMAGES} />;
  }

  if (enginePage) {
    return (
      <div className="learn-page">
        <Link to="/learn" className="learn-page__back">
          ← Back to Learn & Grow
        </Link>
        <LearningPageView page={enginePage.page} />
      </div>
    );
  }

  if (staticPage) {
    const volcanoSlug = id && (volcanoImagesRegistry as VolcanoImageRegistry)[id] ? id : null;
    const volcanoImages = volcanoSlug ? getVolcanoImagesForSlug(volcanoSlug) : undefined;
    if (id === 'baking-soda-volcano') {
      return (
        <div className="learn-page">
          <BakingSodaVolcanoExplorationView page={staticPage.page} volcanoImages={volcanoImages ?? []} />
        </div>
      );
    }
    return (
      <div className="learn-page">
        <Link to="/learn" className="learn-page__back">
          ← Back to Learn & Grow
        </Link>
        <LearningPageView page={staticPage.page} volcanoImages={volcanoImages} />
      </div>
    );
  }

  if (loading) return <div className="learn-page">Loading…</div>;
  if (error || !card) {
    return (
      <div className="learn-page">
        <Link to="/learn" className="learn-page__back">← Back to Learn & Grow</Link>
        <p className="learn-page__error" style={{ marginTop: 16 }}>{error || 'Not found'}</p>
      </div>
    );
  }

  const layerContent = card.audienceLayers?.[layer];
  const sectionKeys = card.sections?.map((s) => s.key) ?? [];
  const sectionText = layerContent?.sections
    ? sectionKeys
        .filter((k) => layerContent.sections![k])
        .map((k) => {
          const title = card.sections?.find((s) => s.key === k)?.title ?? k;
          return { title, body: layerContent.sections![k] };
        })
    : [];

  return (
    <div className="learn-detail">
      <Link to="/learn" className="learn-detail__back">
        ← Back to Learn & Grow
      </Link>
      <h1 className="learn-detail__title">{card.title}</h1>
      <p className="learn-detail__summary">{card.summary}</p>

      <div className="learn-detail__view-as">
        <span className="learn-detail__view-as-label">View as:</span>
        {(['child', 'learner', 'explorer', 'deepDive'] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLayer(l)}
            className={`learn-detail__view-as-btn ${layer === l ? 'learn-detail__view-as-btn--on' : ''}`}
          >
            {l === 'child' ? 'Child' : l === 'learner' ? 'Learner' : l === 'explorer' ? 'Explorer' : 'Deep dive'}
          </button>
        ))}
      </div>

      {layerContent?.summary && (
        <p className="learn-detail__layer-summary">{layerContent.summary}</p>
      )}

      <div className="learn-detail__sections">
        {sectionText.map(({ title, body }) => (
          <section key={title}>
            <h2 className="learn-detail__section-title">{title}</h2>
            <p className="learn-detail__section-body">{body}</p>
          </section>
        ))}
      </div>

      {card.sources && card.sources.length > 0 && (
        <section className="learn-detail__sources">
          <h2 className="learn-detail__sources-title">Sources</h2>
          <ul className="learn-detail__sources-list">
            {card.sources.map((s, i) => (
              <li key={i}>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.title}
                  </a>
                ) : (
                  s.title
                )}
                {s.institution && ` — ${s.institution}`}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
