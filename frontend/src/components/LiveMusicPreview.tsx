/**
 * Live preview for Live Music / Featured Performer builder.
 */
import { PagePreviewFrame } from './PagePreviewFrame';
import type { LiveMusicBuilderState } from '../types/pageBuilder';

interface LiveMusicPreviewProps {
  state: LiveMusicBuilderState;
  forPrint?: boolean;
}

export function LiveMusicPreview({ state, forPrint }: LiveMusicPreviewProps) {
  const { brand, performerName, dateTime, blurb, imageUrl, moreEventsUrl, theme, format } = state;

  return (
    <PagePreviewFrame theme={theme} format={format} accentColor={brand.accentColor} forPrint={forPrint}>
      {brand.logoUrl && (
        <img src={brand.logoUrl} alt="" style={{ maxHeight: 40, width: 'auto', marginBottom: '0.5rem', display: 'block' }} />
      )}
      <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--page-accent)' }}>
        Live
      </p>
      <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
        {performerName}
      </h1>
      <p style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
        {dateTime}
      </p>
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 8, marginBottom: '0.75rem' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      )}
      <p style={{ margin: '0 0 1rem', fontSize: '0.9375rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>
        {blurb}
      </p>
      {moreEventsUrl && (
        <a href={moreEventsUrl} style={{ fontSize: '0.8125rem', color: 'var(--page-accent)', fontWeight: 600 }}>
          More events →
        </a>
      )}
    </PagePreviewFrame>
  );
}
