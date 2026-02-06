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
  NORTH_CAROLINA_FILMS,
  NORTH_CAROLINA_MUSICIANS,
  NORTH_CAROLINA_ACTORS,
  NORTH_CAROLINA_LOCATIONS,
  BLUE_RIDGE_PARKWAY_FEATURE,
  type NCLocation,
  type NCFilm,
  type NCMusician,
  type NCActor,
} from "../data/learningEnginePages/northCarolinaContent";
import { getNCImageByPlaceholderId } from "../data/northCarolinaImages";
import {
  GEOGRAPHY_ZOOM_LEVELS,
  ZOOM_LEVEL_ORDER,
  type ZoomLevelId,
} from "../data/geographyZoomSpine";
import type { VolcanoImage } from "../types/volcanoImages";
import { VolcanoImage as VolcanoImageComponent } from "./VolcanoImage";
import { AttributionSection } from "./AttributionSection";
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
  /** Volcano-style image registry (hero + section); optional. */
  ncImages?: VolcanoImage[];
}

/** North Carolina outline (simplified): diagonal western border (mountains), viewBox 0 0 200 300. */
const NC_OUTLINE_PATH =
  "M 22 8 L 66 0 L 200 0 L 200 300 L 66 300 L 22 292 Z";
/** Three regions inside NC shape: Blue Ridge (west), Piedmont (center), Coastal Plain (east). */
const NC_REGION_PATHS: Record<NCRegion["id"], string> = {
  blue_ridge: "M 22 8 L 66 0 L 66 300 L 22 292 Z",
  piedmont: "M 66 0 L 133 0 L 133 300 L 66 300 Z",
  coastal_plain: "M 133 0 L 200 0 L 200 300 L 133 300 Z",
};
type MapSkin = "default" | "topographic" | "roadways";

export default function NorthCarolinaExplorationView({ page, ncImages = [] }: NorthCarolinaExplorationViewProps) {
  const heroImages = ncImages.filter((img) => img.usage.role === "hero");
  const sectionImages = ncImages.filter((img) => img.usage.role === "section").sort((a, b) => a.usage.priority - b.usage.priority);
  const [zoomStep, setZoomStep] = useState(0);
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<NCRegion["id"] | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<NCRegion["id"] | null>(null);
  const [mapSkin, setMapSkin] = useState<MapSkin>("default");

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

      {/* Hero: optional image + layers + headline */}
      <header className="nc-hero" aria-label="North Carolina — three worlds">
        {heroImages.length > 0 && (
          <div className="nc-hero__img-wrap">
            {heroImages.map((img) => (
              <VolcanoImageComponent
                key={img.id}
                image={img}
                sizes="(max-width: 768px) 100vw, 1200px"
                className="nc-hero__img"
              />
            ))}
          </div>
        )}
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
          <p className="nc-regions__intro">Click a region to explore.</p>
          <div className={`nc-regions__map-wrap nc-regions__map-wrap--${mapSkin}`}>
            <div className="nc-regions__skin-toggles">
              <span className="nc-regions__skin-label">Map:</span>
              {(["default", "topographic", "roadways"] as MapSkin[]).map((skin) => (
                <button
                  key={skin}
                  type="button"
                  className={`nc-regions__skin-btn ${mapSkin === skin ? "nc-regions__skin-btn--on" : ""}`}
                  onClick={() => setMapSkin(skin)}
                  aria-pressed={mapSkin === skin}
                >
                  {skin === "default" ? "Regions" : skin === "topographic" ? "Topographic" : "Roads"}
                </button>
              ))}
            </div>
            <svg
              className="nc-regions__svg"
              viewBox="0 0 200 300"
              aria-label="North Carolina — three regions"
              role="img"
            >
              <defs>
                <clipPath id="nc-clip">
                  <path d={NC_OUTLINE_PATH} />
                </clipPath>
                <pattern id="nc-topo-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
                  <path d="M 0 10 L 20 10 M 10 0 L 10 20" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.4" />
                </pattern>
                {/* Simplified “road” lines: I-40-ish E–W, US-1-ish N–S */}
                <g id="nc-roads">
                  <path d="M 30 150 L 170 150" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" strokeDasharray="4 4" />
                  <path d="M 100 20 L 100 280" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" strokeDasharray="3 3" />
                  <path d="M 66 80 L 133 220" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.35" strokeDasharray="2 2" />
                </g>
              </defs>
              <path className="nc-regions__outline" d={NC_OUTLINE_PATH} fill="none" stroke="currentColor" strokeWidth="1" aria-hidden />
              {mapSkin === "topographic" && (
                <g clipPath="url(#nc-clip)">
                  <path d={NC_OUTLINE_PATH} fill="url(#nc-topo-pattern)" fillOpacity="0.35" stroke="none" aria-hidden />
                </g>
              )}
              {mapSkin === "roadways" && (
                <g clipPath="url(#nc-clip)" aria-hidden>
                  <use href="#nc-roads" />
                </g>
              )}
              <g clipPath="url(#nc-clip)">
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
                      x={region.id === "blue_ridge" ? 44 : region.id === "piedmont" ? 100 : 167}
                      y={140}
                      textAnchor="middle"
                    >
                      {region.shortLabel}
                    </text>
                  )}
                </g>
              ))}
              </g>
            </svg>
            {hoveredRegion && (
              <p className="nc-regions__tagline" aria-live="polite">
                {NORTH_CAROLINA_REGIONS.find((r) => r.id === hoveredRegion)?.tagline}
              </p>
            )}
          </div>

          {/* Deep-dive panel when a region is selected */}
          {selectedRegion && (() => {
            const region = NORTH_CAROLINA_REGIONS.find((r) => r.id === selectedRegion);
            const regionIndex = region ? NORTH_CAROLINA_REGIONS.findIndex((r) => r.id === selectedRegion) : -1;
            const sectionImg = regionIndex >= 0 && sectionImages[regionIndex];
            return (
              <div className="nc-deep-dive">
                <div className="nc-deep-dive__header">
                  <h3 className="nc-deep-dive__title">{region?.label}</h3>
                  <button
                    type="button"
                    className="nc-deep-dive__close"
                    onClick={() => setSelectedRegion(null)}
                    aria-label="Close and return to map"
                  >
                    ← Back to map
                  </button>
                </div>
                {sectionImg && (
                  <div className="nc-deep-dive__media">
                    <VolcanoImageComponent
                      image={sectionImg}
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="nc-deep-dive__img"
                    />
                  </div>
                )}
                <div className="nc-deep-dive__content">
                  {region?.deepContent.map((block, i) =>
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
            );
          })()}
          {/* Notable places: want to go explore? Check these out — link to official sites for full info */}
          <div className="nc-regions__explore">
            <p className="nc-regions__explore-intro">Want to go explore? Check these out — official sites have full info, maps, and conditions.</p>
            <ul className="nc-regions__explore-list">
              {NORTH_CAROLINA_LOCATIONS.filter((loc: NCLocation) => loc.officialUrl).slice(0, 8).map((loc: NCLocation) => (
                <li key={loc.id} className="nc-regions__explore-item">
                  <a href={loc.officialUrl} target="_blank" rel="noopener noreferrer" className="nc-regions__explore-link">
                    {loc.name}
                    {loc.knownFor && <span className="nc-regions__explore-tag"> — {loc.knownFor}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Blue Ridge Parkway — dedicated section: our summary, link to NPS for full info */}
      {isZoomComplete && (
        <section className="nc-block nc-block--parkway" aria-label="Blue Ridge Parkway">
          <h2 className="nc-block__title">Blue Ridge Parkway</h2>
          <p className="nc-block__intro nc-block__intro--parkway">{BLUE_RIDGE_PARKWAY_FEATURE.knownFor}</p>
          <div className="nc-parkway">
            <figure className="nc-parkway__media">
              {getNCImageByPlaceholderId(BLUE_RIDGE_PARKWAY_FEATURE.imagePlaceholder) ? (
                <VolcanoImageComponent
                  image={getNCImageByPlaceholderId(BLUE_RIDGE_PARKWAY_FEATURE.imagePlaceholder)!}
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="nc-parkway__img"
                />
              ) : (
                <>
                  <div className="nc-parkway__placeholder" aria-hidden data-placeholder={BLUE_RIDGE_PARKWAY_FEATURE.imagePlaceholder} />
                  <figcaption className="nc-parkway__caption">Blue Ridge Parkway — scenic drive through the North Carolina mountains.</figcaption>
                </>
              )}
            </figure>
            <div className="nc-parkway__body">
              {BLUE_RIDGE_PARKWAY_FEATURE.summary.map((para: string, i: number) => (
                <p key={i} className="nc-parkway__para">{para}</p>
              ))}
              {BLUE_RIDGE_PARKWAY_FEATURE.officialUrl && (
                <p className="nc-parkway__link-wrap">
                  <a href={BLUE_RIDGE_PARKWAY_FEATURE.officialUrl} target="_blank" rel="noopener noreferrer" className="nc-parkway__link">
                    Plan your visit — full info, maps &amp; alerts (NPS)
                  </a>
                </p>
              )}
            </div>
          </div>
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

      {/* Entertainment: film, musicians, actors — trivia backbone, placeholders for images */}
      {isZoomComplete && (NORTH_CAROLINA_FILMS.length > 0 || NORTH_CAROLINA_MUSICIANS.length > 0 || NORTH_CAROLINA_ACTORS.length > 0) && (
        <section className="nc-block nc-block--entertainment" aria-label="Film, music, and stars from North Carolina">
          <h2 className="nc-block__title">Entertainment: film, music & stars from here</h2>
          <p className="nc-block__intro">
            Movies filmed in NC, musicians and actors born or raised here — the kind of trivia that ties place to people and stories.
          </p>

          {NORTH_CAROLINA_FILMS.length > 0 && (
            <>
              <h3 className="nc-block__subtitle">Films shot or set in North Carolina</h3>
              <div className="nc-entertainment nc-entertainment--films">
                {NORTH_CAROLINA_FILMS.map((film: NCFilm) => {
                  const filmImg = film.imagePlaceholder ? getNCImageByPlaceholderId(film.imagePlaceholder) : undefined;
                  return (
                  <article key={film.id} className="nc-entertainment-item nc-entertainment-item--film">
                    <figure className="nc-entertainment-item__media">
                      {filmImg ? (
                        <VolcanoImageComponent image={filmImg} sizes="(max-width: 768px) 100vw, 280px" className="nc-entertainment-item__img" />
                      ) : (
                        <>
                          <div className="nc-entertainment-item__placeholder" aria-hidden data-placeholder={film.imagePlaceholder ?? "film"} />
                          <figcaption className="nc-entertainment-item__caption">
                            {film.title}
                            {film.year > 0 ? ` (${film.year})` : ""} — {film.ncConnection}
                          </figcaption>
                        </>
                      )}
                    </figure>
                    <div className="nc-entertainment-item__body">
                      <h4 className="nc-entertainment-item__title">{film.title}</h4>
                      <p className="nc-entertainment-item__meta">
                        {film.year > 0 ? film.year : "Various"} · {film.ncConnection}
                      </p>
                      {film.body.map((para: string, i: number) => (
                        <p key={i} className="nc-entertainment-item__para">{para}</p>
                      ))}
                      {film.triviaSeeds && film.triviaSeeds.length > 0 && (
                        <ul className="nc-entertainment-item__trivia" aria-label="Trivia seeds">
                          {film.triviaSeeds.map((seed: string, i: number) => (
                            <li key={i}>{seed}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </article>
                  );
                })}
              </div>
            </>
          )}

          {NORTH_CAROLINA_MUSICIANS.length > 0 && (
            <>
              <h3 className="nc-block__subtitle">Musicians from North Carolina</h3>
              <div className="nc-entertainment nc-entertainment--musicians">
                {NORTH_CAROLINA_MUSICIANS.map((musician: NCMusician) => {
                  const musicianImg = musician.imagePlaceholder ? getNCImageByPlaceholderId(musician.imagePlaceholder) : undefined;
                  return (
                  <article key={musician.id} className="nc-entertainment-item nc-entertainment-item--musician">
                    <figure className="nc-entertainment-item__media">
                      {musicianImg ? (
                        <VolcanoImageComponent image={musicianImg} sizes="(max-width: 768px) 100vw, 280px" className="nc-entertainment-item__img" />
                      ) : (
                        <>
                          <div className="nc-entertainment-item__placeholder" aria-hidden data-placeholder={musician.imagePlaceholder ?? "musician"} />
                          <figcaption className="nc-entertainment-item__caption">{musician.name} — {musician.origin}</figcaption>
                        </>
                      )}
                    </figure>
                    <div className="nc-entertainment-item__body">
                      <h4 className="nc-entertainment-item__title">{musician.name}</h4>
                      <p className="nc-entertainment-item__meta">{musician.origin} · {musician.genre}</p>
                      {musician.bio.map((para: string, i: number) => (
                        <p key={i} className="nc-entertainment-item__para">{para}</p>
                      ))}
                      {musician.notableWorks && musician.notableWorks.length > 0 && (
                        <p className="nc-entertainment-item__works">
                          <strong>Notable works:</strong> {musician.notableWorks.join(", ")}
                        </p>
                      )}
                    </div>
                  </article>
                  );
                })}
              </div>
            </>
          )}

          {NORTH_CAROLINA_ACTORS.length > 0 && (
            <>
              <h3 className="nc-block__subtitle">Actors from North Carolina</h3>
              <div className="nc-entertainment nc-entertainment--actors">
                {NORTH_CAROLINA_ACTORS.map((actor: NCActor) => {
                  const actorImg = actor.imagePlaceholder ? getNCImageByPlaceholderId(actor.imagePlaceholder) : undefined;
                  return (
                  <article key={actor.id} className="nc-entertainment-item nc-entertainment-item--actor">
                    <figure className="nc-entertainment-item__media">
                      {actorImg ? (
                        <VolcanoImageComponent image={actorImg} sizes="(max-width: 768px) 100vw, 280px" className="nc-entertainment-item__img" />
                      ) : (
                        <>
                          <div className="nc-entertainment-item__placeholder" aria-hidden data-placeholder={actor.imagePlaceholder ?? "actor"} />
                          <figcaption className="nc-entertainment-item__caption">{actor.name} — {actor.origin}</figcaption>
                        </>
                      )}
                    </figure>
                    <div className="nc-entertainment-item__body">
                      <h4 className="nc-entertainment-item__title">{actor.name}</h4>
                      <p className="nc-entertainment-item__meta">{actor.origin}</p>
                      <p className="nc-entertainment-item__para">{actor.bioShort}</p>
                      {actor.notableWorks && actor.notableWorks.length > 0 && (
                        <p className="nc-entertainment-item__works">
                          <strong>Notable works:</strong> {actor.notableWorks.join(", ")}
                        </p>
                      )}
                    </div>
                  </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      )}

      {/* Locations: waterfalls, estates, landmarks — how to get there, history, film connections */}
      {isZoomComplete && NORTH_CAROLINA_LOCATIONS.length > 0 && (
        <section className="nc-block nc-block--locations" aria-label="Places to explore: waterfalls, estates, and landmarks">
          <h2 className="nc-block__title">Places to explore</h2>
          <p className="nc-block__intro">
            Waterfalls you can walk behind, film locations, and landmarks — with where they are, how to get there, and the history behind them.
          </p>
          <div className="nc-locations">
            {NORTH_CAROLINA_LOCATIONS.map((loc: NCLocation) => {
              const locImg = loc.imagePlaceholder ? getNCImageByPlaceholderId(loc.imagePlaceholder) : undefined;
              return (
              <article key={loc.id} className="nc-location">
                <figure className="nc-location__media">
                  {locImg ? (
                    <VolcanoImageComponent image={locImg} sizes="(max-width: 768px) 100vw, 600px" className="nc-location__img" />
                  ) : (
                    <>
                      <div className="nc-location__placeholder" aria-hidden data-placeholder={loc.imagePlaceholder ?? loc.type} />
                      <figcaption className="nc-location__caption">{loc.name} — {loc.region}</figcaption>
                    </>
                  )}
                </figure>
                <div className="nc-location__body">
                  <h3 className="nc-location__title">{loc.name}</h3>
                  <p className="nc-location__region">{loc.region}</p>
                  {loc.knownFor && <p className="nc-location__known-for">{loc.knownFor}</p>}
                  <span className="nc-location__type" aria-label="Type">{loc.type.replace("_", " ")}</span>
                  {loc.description.map((para: string, i: number) => (
                    <p key={i} className="nc-location__para">{para}</p>
                  ))}
                  <div className="nc-location__how">
                    <strong>How to get there:</strong> {loc.howToGetThere}
                  </div>
                  {loc.history && (
                    <p className="nc-location__history"><strong>History:</strong> {loc.history}</p>
                  )}
                  {loc.filmConnection && (
                    <p className="nc-location__film"><strong>On screen:</strong> {loc.filmConnection}</p>
                  )}
                  {loc.officialUrl && (
                    <p className="nc-location__official">
                      <a href={loc.officialUrl} target="_blank" rel="noopener noreferrer" className="nc-location__official-link">
                        Full info &amp; plan your visit →
                      </a>
                    </p>
                  )}
                  {loc.triviaSeeds && loc.triviaSeeds.length > 0 && (
                    <ul className="nc-location__trivia" aria-label="Trivia seeds">
                      {loc.triviaSeeds.map((seed: string, i: number) => (
                        <li key={i}>{seed}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Expand on demand: accordion sections */}
      <h2 className="nc-page__sections-title">More to explore</h2>
      {accordionSections.map((section) => (
        <AccordionSection
          key={section.id}
          section={section}
          isOpen={openSectionId === section.id}
          onToggle={() => toggleSection(section.id)}
          renderBlock={renderContentBlock}
        />
      ))}

      {ncImages.length > 0 && (
        <AttributionSection images={ncImages} className="nc-page__attribution" />
      )}
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
