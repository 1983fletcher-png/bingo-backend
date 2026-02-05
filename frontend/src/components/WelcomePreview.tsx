/**
 * Live preview for Welcome / Information Display builder.
 */
import { PagePreviewFrame } from './PagePreviewFrame';
import type { WelcomeBuilderState } from '../types/pageBuilder';

interface WelcomePreviewProps {
  state: WelcomeBuilderState;
  forPrint?: boolean;
}

export function WelcomePreview({ state, forPrint }: WelcomePreviewProps) {
  const { brand, headline, hours, wifiName, wifiPassword, houseRules, contact, links, theme, format } = state;
  const hasWifi = wifiName || wifiPassword;

  return (
    <PagePreviewFrame theme={theme} format={format} accentColor={brand.accentColor} forPrint={forPrint}>
      {brand.logoUrl && (
        <img src={brand.logoUrl} alt="" style={{ maxHeight: 48, width: 'auto', marginBottom: '0.5rem', display: 'block' }} />
      )}
      {brand.title && (
        <p style={{ margin: '0 0 0.15rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{brand.title}</p>
      )}
      <h1 style={{ margin: '0 0 0.75rem', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
        {headline}
      </h1>

      {hours && (
        <div style={{ marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--page-accent)' }}>Hours</span>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', lineHeight: 1.4, color: 'var(--text-secondary)' }}>{hours}</p>
        </div>
      )}

      {hasWifi && (
        <div style={{ marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--page-accent)' }}>WiFi</span>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', lineHeight: 1.4, color: 'var(--text-secondary)' }}>
            {wifiName && <strong>{wifiName}</strong>}
            {wifiName && wifiPassword && ' · '}
            {wifiPassword && <span>{wifiPassword}</span>}
          </p>
        </div>
      )}

      {houseRules && (
        <div style={{ marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--page-accent)' }}>House rules</span>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', lineHeight: 1.4, color: 'var(--text-secondary)' }}>{houseRules}</p>
        </div>
      )}

      {contact && (
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{contact}</p>
      )}

      {links.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {links.map((link, i) =>
            link.url ? (
              <a key={i} href={link.url} style={{ fontSize: '0.8125rem', color: 'var(--page-accent)', fontWeight: 600 }}>{link.label}</a>
            ) : null
          )}
        </div>
      )}
    </PagePreviewFrame>
  );
}
