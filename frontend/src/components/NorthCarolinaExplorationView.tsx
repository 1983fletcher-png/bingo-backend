/**
 * North Carolina — guided exploration: hero, interactive zoom, expand-on-demand.
 * Polished experience that draws you in; feeds Trivia Master Plan.
 */
import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import type { LearningPage, LearningSection, ContentBlock } from "../types/learningEngine";
import {
  NORTH_CAROLINA_HERO_HEADLINE,
  NORTH_CAROLINA_REGIONS,
  type NCRegion,
} from "../data/learningEnginePages/northCarolinaPage";
import {
  NORTH_CAROLINA_MYSTERIES,
  NORTH_CAROLINA_FOLKLORE,
  NORTH_CAROLINA_FOOD,
  NORTH_CAROLINA_DRINKS,
} from "../data/learningEnginePages/northCarolinaContent";
import {
  GEOGRAPHY_ZOOM_LEVELS,
  ZOOM_LEVEL_ORDER,
  type ZoomLevelId,
} from "../data/geographyZoomSpine";
import "../styles/north-carolina.css";

function renderContentBlock(block: ContentBlock, index: number) {
  const key = `block-${index}`;
  const emphasisClass = block.emphasis ? ` learn-content-block--${block.emphasis}` : "";

  if (block.type === "paragraph") {
    const text = typeof block.content === "string" ? block.content : block.content.join(" ");
    return (
      <p key={key} className={`learn-content-block learn-content-block--paragraph${emphasisClass}`}>
        {text}
      </p>
    );
  }
  if (block.type === "bullet-list") {
    const items = Array.isArray(block.content) ? block.content : [block.content];
    return (
      <ul key={key} className={`learn-content-block learn-content-block--list${emphasisClass}`}>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }
  if (block.type === "callout") {
    const text = typeof block.content === "string" ? block.content : block.content.join(" ");
    return (
      <div key={key} className={`learn-content-block learn-content-block--callout${emphasisClass}`} role="note">
        {text}
      </div>
    );
  }
  if (block.type === "divider") {
    return <hr key={key} className="learn-content-block learn-content-block--divider" />;
  }
  return null;
}

const ACCORDION_SECTION_IDS = [
  "quick_wow",
  "core_concepts",
  "hands_on_or_examples",
  "difficulty_tiers",
  "variations_and_experiments",
  "real_world_connections",
  "cross_links",
  "trivia_seeds",
  "further_exploration",
];

const ZOOM_MAP_CLASSES = ["nc-zoom__map--world", "nc-zoom__map--us", "nc-zoom__map--south", "nc-zoom__map--nc"] as const;

export interface NorthCarolinaExplorationViewProps {
  page: LearningPage;
}

/** Simplified NC SVG paths (viewBox 0 0 200 300): Blue Ridge (w), Piedmont (c), Coastal Plain (e). */
const NC_REGION_PATHS: Record<NCRegion["id"], string> = {
  blue_ridge: "M 0 35 L 52 0 L 67 0 L 67 300 L 0 300 Z",
  piedmont: "M 67 0 L 133 0 L 133 300 L 67 300 Z",
  coastal_plain: "M 133 0 L 200 0 L 200 300 L 133 300 Z",
};

export default function NorthCarolinaExplorationView({ page }: NorthCarolinaExplorationViewProps) {
  const [zoomStep, setZoomStep] = useState(0);
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<NCRegion["id"] | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<NCRegion["id"] | null>(null);

  const currentLevelId = ZOOM_LEVEL_ORDER[zoomStep] as ZoomLevelId;
  const currentLevel = GEOGRAPHY_ZOOM_LEVELS.find((l) => l.id === currentLevelId);
  const isZoomComplete = zoomStep >= ZOOM_LEVEL_ORDER.length - 1;
  const goNext = useCallback(() => {
    setZoomStep((s) => Math.min(s + 1, ZOOM_LEVEL_ORDER.length - 1));
  }, []);
  const goToLevel = useCallback((levelId: ZoomLevelId) => {
    const i = ZOOM_LEVEL_ORDER.indexOf(levelId);
    if (i >= 0) setZoomStep(i);
  }, []);

  const accordionSections = page.sections.filter((s) => ACCORDION_SECTION_IDS.includes(s.id));
  const toggleSection = useCallback((id: string) => {
    setOpenSectionId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <article className="nc-page">
      <Link to="/learn" className="nc-page__back">
        ← Back to Learn & Grow
      </Link>

      {/* Hero: layers + headline */}
      <header className="nc-hero" aria-label="North Carolina — three worlds">
        <div className="nc-hero__layers">
          <div className="nc-hero__layer nc-hero__layer--mountains" aria-hidden />
          <div className="nc-hero__layer nc-hero__layer--forest" aria-hidden />
          <div className="nc-hero__layer nc-hero__layer--river" aria-hidden />
          <div className="nc-hero__layer nc-hero__layer--coast" aria-hidden />
        </div>
        <div className="nc-hero__overlay" aria-hidden />
        <p className="nc-hero__headline">{NORTH_CAROLINA_HERO_HEADLINE}</p>
      </header>

      {/* Geography spine: World (hotspots) → US (time zones, regions) → Southeast → NC */}
      <section className="nc-zoom" aria-label="Where are you, really?">
        <p className="nc-zoom__prompt">
          Before we zoom in — where do you think North Carolina fits into the bigger picture?
        </p>
        <div className="nc-zoom__viewport nc-zoom__viewport--spine">
          {currentLevelId === "world" && (
            <div className="nc-spine-world">
              <div key="world" className={`nc-zoom__map ${ZOOM_MAP_CLASSES[0]}`} aria-hidden />
              <div className="nc-spine-hotspots">
                {currentLevel?.hotspots?.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    className={`nc-spine-hotspot ${h.teaser ? "nc-spine-hotspot--teaser" : ""}`}
                    onClick={() => !h.teaser && h.zoomTo && goToLevel(h.zoomTo)}
                    title={h.tagline}
                    aria-label={h.teaser ? `${h.label}: ${h.tagline} (coming soon)` : `${h.label}: zoom in`}
                  >
                    <span className="nc-spine-hotspot__label">{h.label}</span>
                    <span className="nc-spine-hotspot__tagline">{h.tagline}</span>
                    {h.teaser && <span className="nc-spine-hotspot__badge">Soon</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
          {currentLevelId === "us" && (
            <div className="nc-spine-us">
              <div className="nc-spine-us__map">
                {currentLevel?.timeZones?.map((tz) => (
                  <div
                    key={tz.id}
                    className="nc-spine-tz"
                    style={{ left: `${tz.xStart}%`, width: `${tz.xEnd - tz.xStart}%` }}
                    title={tz.tip}
                  >
                    <span className="nc-spine-tz__name">{tz.name}</span>
                  </div>
                ))}
              </div>
              <p className="nc-spine-us__tip">{currentLevel?.tip}</p>
              <div className="nc-spine-regions">
                {currentLevel?.regions?.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className="nc-spine-region"
                    onClick={() => goToLevel(r.zoomTo)}
                    aria-label={`${r.label}: ${r.tagline}`}
                  >
                    <span className="nc-spine-region__label">{r.label}</span>
                    <span className="nc-spine-region__tagline">{r.tagline}</span>
                    <span className="nc-spine-region__cta">Explore →</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {currentLevelId === "southeast" && (
            <div className="nc-spine-southeast">
              <div key="south" className={`nc-zoom__map ${ZOOM_MAP_CLASSES[2]}`} aria-hidden />
              <p className="nc-spine-southeast__tip">{currentLevel?.tip}</p>
              <div className="nc-spine-regions">
                {currentLevel?.regions?.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className="nc-spine-region nc-spine-region--feature"
                    onClick={() => goToLevel(r.zoomTo)}
                    aria-label={`${r.label}: ${r.tagline}`}
                  >
                    <span className="nc-spine-region__label">{r.label}</span>
                    <span className="nc-spine-region__tagline">{r.tagline}</span>
                    <span className="nc-spine-region__cta">Dive in →</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {currentLevelId === "north_carolina" && (
            <div key="nc" className={`nc-zoom__map ${ZOOM_MAP_CLASSES[3]}`} aria-hidden />
          )}
        </div>
        <p className="nc-zoom__fact">
          <span className="nc-zoom__fact-label">{currentLevel?.label}</span>
          <span className="nc-zoom__fact-inner">{currentLevel?.fact}</span>
        </p>
        {currentLevel?.tip && currentLevelId === "world" && (
          <p className="nc-zoom__tip">{currentLevel.tip}</p>
        )}
        {currentLevel?.tip && currentLevelId === "north_carolina" && (
          <p className="nc-zoom__tip">{currentLevel.tip}</p>
        )}
        <div className="nc-zoom__steps" role="tablist" aria-label="Zoom steps">
          {ZOOM_LEVEL_ORDER.map((levelId, i) => (
            <button
              key={levelId}
              type="button"
              role="tab"
              aria-selected={zoomStep === i}
              aria-label={`Level ${i + 1}: ${GEOGRAPHY_ZOOM_LEVELS.find((l) => l.id === levelId)?.label}`}
              className={`nc-zoom__step-dot ${zoomStep === i ? "nc-zoom__step-dot--active" : ""}`}
              onClick={() => setZoomStep(i)}
            />
          ))}
        </div>
        <div className="nc-zoom__nav">
          <button
            type="button"
            className="nc-zoom__back"
            onClick={() => setZoomStep((s) => Math.max(0, s - 1))}
            disabled={zoomStep === 0}
            aria-label="Zoom out"
          >
            ← Back
          </button>
          <button
            type="button"
            className="nc-zoom__next"
            onClick={goNext}
            disabled={isZoomComplete}
            aria-label={isZoomComplete ? "Zoom complete" : "Zoom in to next level"}
          >
            {isZoomComplete ? "You're here" : "Zoom in"}
          </button>
        </div>
      </section>

      {/* Three regions map: hover to chunk/lift + label, click to dive deeper (only when zoom is at NC) */}
      {isZoomComplete && (
        <section className="nc-regions" aria-label="Three worlds in one state">
          <p className="nc-regions__intro">Hover over a region — then click to dive deeper.</p>
          <div className="nc-regions__map-wrap">
            <svg
              className="nc-regions__svg"
              viewBox="0 0 200 300"
              aria-label="North Carolina — three regions"
              role="img"
            >
              {NORTH_CAROLINA_REGIONS.map((region) => (
                <g key={region.id}>
                  <path
                    className={`nc-region nc-region--${region.id} ${hoveredRegion === region.id ? "nc-region--hover" : ""} ${selectedRegion === region.id ? "nc-region--selected" : ""}`}
                    d={NC_REGION_PATHS[region.id]}
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    onMouseEnter={() => setHoveredRegion(region.id)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    onClick={() => setSelectedRegion(selectedRegion === region.id ? null : region.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={region.label}
                    aria-pressed={selectedRegion === region.id}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedRegion(selectedRegion === region.id ? null : region.id);
                      }
                    }}
                  />
                  {hoveredRegion === region.id && (
                    <text
                      className="nc-region__label"
                      x={region.id === "blue_ridge" ? 33 : region.id === "piedmont" ? 100 : 167}
                      y={140}
                      textAnchor="middle"
                    >
                      {region.shortLabel}
                    </text>
                  )}
                </g>
              ))}
            </svg>
            {hoveredRegion && (
              <p className="nc-regions__tagline" aria-live="polite">
                {NORTH_CAROLINA_REGIONS.find((r) => r.id === hoveredRegion)?.tagline}
              </p>
            )}
          </div>

          {/* Deep-dive panel when a region is selected */}
          {selectedRegion && (
            <div className="nc-deep-dive">
              <div className="nc-deep-dive__header">
                <h3 className="nc-deep-dive__title">
                  {NORTH_CAROLINA_REGIONS.find((r) => r.id === selectedRegion)?.label}
                </h3>
                <button
                  type="button"
                  className="nc-deep-dive__close"
                  onClick={() => setSelectedRegion(null)}
                  aria-label="Close and return to map"
                >
                  ← Back to map
                </button>
              </div>
              <div className="nc-deep-dive__content">
                {NORTH_CAROLINA_REGIONS.find((r) => r.id === selectedRegion)?.deepContent.map((block, i) =>
                  block.type === "paragraph" ? (
                    <p key={i}>{block.content}</p>
                  ) : (
                    <ul key={i}>
                      {(Array.isArray(block.content) ? block.content : [block.content]).map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  )
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Mysteries & open questions — no single answer, create conversation */}
      {isZoomComplete && NORTH_CAROLINA_MYSTERIES.length > 0 && (
        <section className="nc-block nc-block--mysteries" aria-label="Mysteries and open questions">
          <h2 className="nc-block__title">Mysteries & open questions</h2>
          <p className="nc-block__intro">Some things don't end with a fact. We don't know — and that's okay. Here are a few that still get people talking.</p>
          <div className="nc-mysteries">
            {NORTH_CAROLINA_MYSTERIES.map((m) => (
              <article key={m.id} className="nc-mystery">
                <h3 className="nc-mystery__title">{m.title}</h3>
                <p className="nc-mystery__hook">{m.hook}</p>
                <p className="nc-mystery__question">{m.question}</p>
                <p className="nc-mystery__context">{m.context}</p>
                <p className="nc-mystery__conversation">{m.conversationStarter}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Folklore & superstitions — stories and imagery */}
      {isZoomComplete && NORTH_CAROLINA_FOLKLORE.length > 0 && (
        <section className="nc-block nc-block--folklore" aria-label="Folklore and superstitions">
          <h2 className="nc-block__title">Folklore & superstitions</h2>
          <p className="nc-block__intro">Stories that stick around — luck, signs, and the kind of tales that get passed down.</p>
          <div className="nc-folklore">
            {NORTH_CAROLINA_FOLKLORE.map((f) => (
              <article key={f.id} className="nc-folklore-item">
                <h3 className="nc-folklore-item__title">{f.title}</h3>
                <p className="nc-folklore-item__story">{f.story}</p>
                {f.imageCaption && (
                  <figure className="nc-folklore-item__img-wrap">
                    <div className="nc-folklore-item__img-placeholder" aria-hidden />
                    <figcaption className="nc-folklore-item__caption">{f.imageCaption}</figcaption>
                  </figure>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Taste of the region — food, culture, image to break the block */}
      {isZoomComplete && NORTH_CAROLINA_FOOD.length > 0 && (
        <section className="nc-block nc-block--food" aria-label="Taste of the region">
          <h2 className="nc-block__title">Taste of the region</h2>
          <p className="nc-block__intro">Not just any food — the stuff that's tied to place, history, and argument.</p>
          {NORTH_CAROLINA_FOOD.map((food) => (
            <article key={food.id} className="nc-food">
              <figure className="nc-food__hero">
                <div className="nc-food__hero-img" aria-hidden />
                <figcaption className="nc-food__hero-caption">{food.imageCaption ?? food.title}</figcaption>
              </figure>
              <div className="nc-food__body">
                <h3 className="nc-food__title">{food.title}</h3>
                {food.region && <p className="nc-food__region">{food.region}</p>}
                {food.body.map((para, i) => (
                  <p key={i} className="nc-food__para">{para}</p>
                ))}
                {food.funFacts && food.funFacts.length > 0 && (
                  <ul className="nc-food__facts">
                    {food.funFacts.map((fact, i) => (
                      <li key={i}>{fact}</li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
          {NORTH_CAROLINA_DRINKS.length > 0 && (
            <>
              <h3 className="nc-block__subtitle">Drinks from here</h3>
              <p className="nc-block__intro">Unique sips — the kind where you say, &ldquo;Oh wow, this was started here.&rdquo;</p>
              {NORTH_CAROLINA_DRINKS.map((drink) => (
                <article key={drink.id} className="nc-food">
                  <figure className="nc-food__hero">
                    <div className="nc-food__hero-img nc-food__hero-img--drink" aria-hidden />
                    <figcaption className="nc-food__hero-caption">{drink.imageCaption ?? drink.title}</figcaption>
                  </figure>
                  <div className="nc-food__body">
                    <h3 className="nc-food__title">{drink.title}</h3>
                    {drink.origin && <p className="nc-food__region">{drink.origin}</p>}
                    {drink.body.map((para, i) => (
                      <p key={i} className="nc-food__para">{para}</p>
                    ))}
                    {drink.funFacts && drink.funFacts.length > 0 && (
                      <ul className="nc-food__facts">
                        {drink.funFacts.map((fact, i) => (
                          <li key={i}>{fact}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              ))}
            </>
          )}
        </section>
      )}

      {/* Expand on demand: accordion sections */}
      <h2 className="nc-page__sections-title">Explore more — open what you like</h2>
      {accordionSections.map((section) => (
        <AccordionSection
          key={section.id}
          section={section}
          isOpen={openSectionId === section.id}
          onToggle={() => toggleSection(section.id)}
          renderBlock={renderContentBlock}
        />
      ))}
    </article>
  );
}

function AccordionSection({
  section,
  isOpen,
  onToggle,
  renderBlock,
}: {
  section: LearningSection;
  isOpen: boolean;
  onToggle: () => void;
  renderBlock: (block: ContentBlock, index: number) => React.ReactNode;
}) {
  return (
    <div className={`nc-accordion ${isOpen ? "nc-accordion--open" : ""}`}>
      <button
        type="button"
        className="nc-accordion__header"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`nc-body-${section.id}`}
        id={`nc-header-${section.id}`}
      >
        <span>{section.title}</span>
        <svg className="nc-accordion__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div
        id={`nc-body-${section.id}`}
        className="nc-accordion__body"
        role="region"
        aria-labelledby={`nc-header-${section.id}`}
        aria-hidden={!isOpen}
      >
        <div className="nc-accordion__inner">
          <div className="nc-accordion__content">
            {section.contentBlocks.map((block, i) => renderBlock(block, i))}
          </div>
        </div>
      </div>
    </div>
  );
}
