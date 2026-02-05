/**
 * Live preview for Event Promotion builder.
 */
import { PagePreviewFrame } from './PagePreviewFrame';
import type { EventBuilderState } from '../types/pageBuilder';

interface EventPreviewProps {
  state: EventBuilderState;
  forPrint?: boolean;
}

export function EventPreview({ state, forPrint }: EventPreviewProps) {
  const { brand, eventTitle, eventDate, eventTime, description, imageUrl, ctaLabel, ctaUrl, theme, format } = state;
  const when = [eventDate, eventTime].filter(Boolean).join(' · ') || 'Date and time';

  return (
    <PagePreviewFrame theme={theme} format={format} accentColor={brand.accentColor} forPrint={forPrint}>
      {brand.logoUrl && (
        <img src={brand.logoUrl} alt="" style={{ maxHeight: 48, width: 'auto', marginBottom: '0.5rem', display: 'block' }} />
      )}
      {brand.title && (
        <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{brand.title}</p>
      )}
      <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
        {eventTitle}
      </h1>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--page-accent)' }}>
        {when}
      </p>
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8, marginBottom: '0.75rem' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      )}
      <p style={{ margin: '0 0 1rem', fontSize: '0.9375rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
        {description}
      </p>
      {ctaLabel && (
        <a
          href={ctaUrl || '#'}
          className="page-preview__accent"
          style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: '#fff',
            backgroundColor: 'var(--page-accent)',
            borderRadius: 8,
            textDecoration: 'none',
          }}
        >
          {ctaLabel}
        </a>
      )}
    </PagePreviewFrame>
  );
}
