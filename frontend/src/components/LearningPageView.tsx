/**
 * Renders a canonical LearningPage: sections top-to-bottom, contentBlocks (ADHD-safe),
 * image slots as placeholders or filled assets. No popups, no autoplay, inline only.
 * When volcanoImages (registry) is provided: hero at top, VolcanoImage component, attribution at bottom.
 */
import type {
  LearningPage,
  LearningSection,
  ContentBlock,
  ImageSlot,
  LearningImageAsset,
} from '../types/learningEngine';
import type { VolcanoImage } from '../types/volcanoImages';
import { VolcanoImage as VolcanoImageComponent } from './VolcanoImage';
import { AttributionSection } from './AttributionSection';
import '../styles/learn.css';

function renderContentBlock(block: ContentBlock, index: number) {
  const key = `block-${index}`;
  const emphasisClass = block.emphasis ? ` learn-content-block--${block.emphasis}` : '';

  if (block.type === 'paragraph') {
    const text = typeof block.content === 'string' ? block.content : block.content.join(' ');
    return (
      <p key={key} className={`learn-content-block learn-content-block--paragraph${emphasisClass}`}>
        {text}
      </p>
    );
  }
  if (block.type === 'bullet-list') {
    const items = Array.isArray(block.content) ? block.content : [block.content];
    return (
      <ul key={key} className={`learn-content-block learn-content-block--list${emphasisClass}`}>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }
  if (block.type === 'callout') {
    const text = typeof block.content === 'string' ? block.content : block.content.join(' ');
    return (
      <div key={key} className={`learn-content-block learn-content-block--callout${emphasisClass}`} role="note">
        {text}
      </div>
    );
  }
  if (block.type === 'divider') {
    return <hr key={key} className="learn-content-block learn-content-block--divider" />;
  }
  return null;
}

function SectionContent({
  section,
  imagesBySlotId,
}: {
  section: LearningSection;
  imagesBySlotId: Record<string, LearningImageAsset[]>;
}) {
  return (
    <section className="learn-page-view__section" aria-labelledby={`section-${section.id}`}>
      <h2 id={`section-${section.id}`} className="learn-page-view__section-title">
        {section.title}
      </h2>
      <div className="learn-page-view__content-blocks">
        {section.contentBlocks.map((block, i) => renderContentBlock(block, i))}
      </div>
      {section.imageSlots && section.imageSlots.length > 0 && (
        <div className="learn-page-view__slot-list">
          {section.imageSlots.map((slot) => {
            const images = imagesBySlotId[slot.slotId] ?? [];
            return (
              <div key={slot.slotId} className="learn-page-view__slot" data-slot-id={slot.slotId} data-role={slot.role}>
                {images.length > 0 ? (
                  images.map((img) => (
                    <figure key={img.id} className="learn-page-view__figure">
                      <img src={img.url} alt={img.altText} className="learn-page-view__img" />
                      <figcaption className="learn-page-view__caption">
                        {img.attributionRequired ? (
                          <span>
                            {img.altText} — {img.sourceName},{' '}
                            <a href={img.sourceUrl} target="_blank" rel="noopener noreferrer">
                              source
                            </a>
                          </span>
                        ) : (
                          img.altText
                        )}
                      </figcaption>
                    </figure>
                  ))
                ) : (
                  <div className="learn-page-view__slot-placeholder" aria-hidden>
                    <span className="learn-page-view__slot-placeholder-label">
                      {slot.role}: {slot.description}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export interface LearningPageViewProps {
  page: LearningPage;
  /** Optional: images already attached to slots (slotId → assets) — legacy/slot-based */
  imagesBySlotId?: Record<string, LearningImageAsset[]>;
  /** Optional: images from registry (VolcanoImage[]) — hero at top, attribution at bottom */
  volcanoImages?: VolcanoImage[];
}

export default function LearningPageView({
  page,
  imagesBySlotId = {},
  volcanoImages = [],
}: LearningPageViewProps) {
  const heroImages = volcanoImages.filter((img) => img.usage.role === 'hero');

  return (
    <article className="learn-page learn-page-view">
      <header className="learn-page-view__header">
        <h1 className="learn-page-view__title">{page.title}</h1>
        {page.subtitle && <p className="learn-page-view__subtitle">{page.subtitle}</p>}
      </header>

      {heroImages.length > 0 && (
        <div className="learn-page-view__hero">
          {heroImages
            .sort((a, b) => a.usage.priority - b.usage.priority)
            .map((img) => (
              <VolcanoImageComponent
                key={img.id}
                image={img}
                sizes="(max-width: 768px) 100vw, 80vw"
                className="learn-page-view__hero-img"
              />
            ))}
        </div>
      )}

      <div className="learn-page-view__sections">
        {page.sections.map((section) => (
          <SectionContent key={section.id} section={section} imagesBySlotId={imagesBySlotId} />
        ))}
      </div>

      {volcanoImages.length > 0 && (
        <AttributionSection images={volcanoImages} className="learn-page-view__attribution" />
      )}
    </article>
  );
}
