/**
 * Image credits — legal requirement. Rendered at bottom of learning/volcano page.
 * Keeps you clean, transparent, and defensible.
 */
import type { VolcanoImage } from '../types/volcanoImages';

export interface AttributionSectionProps {
  images: VolcanoImage[];
  title?: string;
  className?: string;
}

export function AttributionSection({
  images,
  title = 'Image Credits',
  className = '',
}: AttributionSectionProps) {
  if (images.length === 0) return null;

  // Dedupe by sourceUrl so the same source is credited once (e.g. one image used in multiple slots)
  const seen = new Set<string>();
  const uniqueBySource = images.filter((img) => {
    const key = img.license.sourceUrl || img.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <section className={`attribution ${className}`} aria-labelledby="attribution-heading">
      <h4 id="attribution-heading">{title}</h4>
      <ul>
        {uniqueBySource.map((img) => (
          <li key={img.id}>
            {img.license.source}
            {img.license.attribution && ` — ${img.license.attribution}`}
            {img.license.attributionName &&
              (img.license.attributionUrl ? (
                <> — <a href={img.license.attributionUrl} target="_blank" rel="noopener noreferrer">{img.license.attributionName}</a></>
              ) : (
                ` — ${img.license.attributionName}`
              ))}
            {img.license.sourceUrl && (
              <>
                {' · '}
                <a href={img.license.sourceUrl} target="_blank" rel="noopener noreferrer">
                  Source
                </a>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
