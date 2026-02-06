/**
 * Renders a canonical LearningPage: sections top-to-bottom, contentBlocks (ADHD-safe),
 * image slots as placeholders or filled assets. No popups, no autoplay, inline only.
 * When volcanoImages (registry) is provided: hero at top, VolcanoImage component, attribution at bottom.
 */
import type {
  LearningPage,
  LearningSection,
  ContentBlock,
  LearningImageAsset,
  ImageSlot,
  ImageSourceType,
} from '../types/learningEngine';
import type { VolcanoImage } from '../types/volcanoImages';
import { VolcanoImage as VolcanoImageComponent } from './VolcanoImage';
import { AttributionSection } from './AttributionSection';
import '../styles/learn.css';

/** Map registry license type to learning engine source type. */
function toSourceType(licenseType: string): ImageSourceType {
  if (licenseType === 'public-domain' || licenseType === 'cc0') return 'public_domain';
  if (licenseType === 'cc-by') return 'cc_by';
  return 'public_domain';
}

/** Convert one VolcanoImage to LearningImageAsset for a given slot. */
function volcanoToLearningAsset(
  img: VolcanoImage,
  slot: ImageSlot,
  learningPageId: string
): LearningImageAsset {
  const url = img.src?.lg ?? img.r2?.publicUrl ?? '';
  const licenseType = img.license?.type ?? 'public-domain';
  const attributionRequired = licenseType !== 'public-domain';
  return {
    id: img.id,
    url,
    thumbnailUrl: img.src?.sm ?? url,
    altText: img.alt,
    sourceType: toSourceType(licenseType),
    sourceName: img.license?.source ?? 'Unknown',
    sourceUrl: img.license?.sourceUrl ?? '',
    license: attributionRequired ? 'CC BY 4.0' : 'Public Domain',
    attributionRequired,
    tags: [],
    concepts: [],
    verified: true,
    learningPageId,
    sectionId: slot.sectionId,
    slotId: slot.slotId,
    role: slot.role,
    caption: img.caption,
  };
}

/** Slots that accept "section" registry images (context, reference, step). */
const SECTION_SLOT_ROLES = ['context', 'reference', 'step'];
/** Slots that accept "gallery" registry images. Gold standard: gallery = comparison only (real-world analogies); step images come from section only so Do/Observe shows true process_step. */
const GALLERY_SLOT_ROLES = ['comparison'];

/** Build slotId → assets from volcano registry; assign by role so diagrams go to diagram slots, etc. */
function buildImagesBySlotFromVolcano(
  page: LearningPage,
  volcanoImages: VolcanoImage[]
): Record<string, LearningImageAsset[]> {
  const allSlots = page.sections.flatMap((s) => s.imageSlots ?? []).filter((slot) => slot.role !== 'hero');
  const diagramSlots = allSlots.filter((s) => s.role === 'diagram');
  const sectionSlots = allSlots.filter((s) => SECTION_SLOT_ROLES.includes(s.role));
  const gallerySlots = allSlots.filter((s) => GALLERY_SLOT_ROLES.includes(s.role));

  const sectionImages = volcanoImages.filter((img) => img.usage.role === 'section');
  const diagramImages = volcanoImages.filter((img) => img.usage.role === 'diagram');
  const galleryImages = volcanoImages.filter((img) => img.usage.role === 'gallery');

  const bySlot: Record<string, LearningImageAsset[]> = {};
  sectionImages.forEach((img, i) => {
    const slot = sectionSlots[i];
    if (!slot) return;
    const list = bySlot[slot.slotId] ?? [];
    list.push(volcanoToLearningAsset(img, slot, page.id));
    bySlot[slot.slotId] = list;
  });
  diagramImages.forEach((img, i) => {
    const slot = diagramSlots[i];
    if (!slot) return;
    const list = bySlot[slot.slotId] ?? [];
    list.push(volcanoToLearningAsset(img, slot, page.id));
    bySlot[slot.slotId] = list;
  });
  galleryImages.forEach((img, i) => {
    const slot = gallerySlots[i];
    if (!slot) return;
    const list = bySlot[slot.slotId] ?? [];
    list.push(volcanoToLearningAsset(img, slot, page.id));
    bySlot[slot.slotId] = list;
  });
  return bySlot;
}

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
                        {img.caption ?? img.altText}
                        {img.attributionRequired && (
                          <span className="learn-page-view__caption-credit">
                            {' '}— {img.sourceName},{' '}
                            <a href={img.sourceUrl} target="_blank" rel="noopener noreferrer">
                              source
                            </a>
                          </span>
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
  const resolvedImagesBySlotId: Record<string, LearningImageAsset[]> = {
    ...buildImagesBySlotFromVolcano(page, volcanoImages),
    ...imagesBySlotId,
  };

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
                sizes="(max-width: 768px) 100vw, 560px"
                className="learn-page-view__hero-img"
              />
            ))}
        </div>
      )}

      <div className="learn-page-view__sections">
        {page.sections.map((section) => (
          <SectionContent key={section.id} section={section} imagesBySlotId={resolvedImagesBySlotId} />
        ))}
      </div>

      {volcanoImages.length > 0 && (
        <AttributionSection images={volcanoImages} className="learn-page-view__attribution" />
      )}
    </article>
  );
}
