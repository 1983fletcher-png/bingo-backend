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

  return (
    <section className={`attribution ${className}`} aria-labelledby="attribution-heading">
      <h4 id="attribution-heading">{title}</h4>
      <ul>
        {images.map((img) => (
          <li key={img.id}>
            {img.license.source}
            {img.license.attribution && ` — ${img.license.attribution}`}
            {' · '}
            <a href={img.license.sourceUrl} target="_blank" rel="noopener noreferrer">
              Source
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
