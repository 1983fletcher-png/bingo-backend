/**
 * Single-responsibility: render one volcano (or learning) image from structured data.
 * No filenames, no assumptions, no coupling. Frontend never cares where image came from.
 */
import type { VolcanoImage } from '../types/volcanoImages';

export interface VolcanoImageProps {
  image: VolcanoImage;
  sizes?: string;
  className?: string;
}

export function VolcanoImage({ image, sizes = '(max-width: 768px) 100vw, 80vw', className }: VolcanoImageProps) {
  const url = image.src?.lg ?? image.r2?.publicUrl ?? '';
  const urlMd = image.src?.md ?? url;
  const urlSm = image.src?.sm ?? url;

  return (
    <figure className={className}>
      <img
        src={url}
        srcSet={`${urlSm} 480w, ${urlMd} 960w, ${url} 1600w`}
        sizes={sizes}
        alt={image.alt}
        loading="lazy"
        decoding="async"
      />
      {(image.caption || image.license?.attribution) && (
        <figcaption className="volcano-image__caption">
          {image.caption ?? image.alt}
          {image.license?.sourceUrl && (
            <>
              {' · '}
              <a href={image.license.sourceUrl} target="_blank" rel="noopener noreferrer">
                Source
              </a>
            </>
          )}
        </figcaption>
      )}
    </figure>
  );
}
