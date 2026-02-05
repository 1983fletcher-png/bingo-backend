import { useState } from 'react';

export interface GameViewHeaderConfig {
  gameTitle?: string;
  venueName?: string;
  logoUrl?: string | null;
  foodMenuUrl?: string;
  drinkMenuUrl?: string;
  eventsUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  venueAllowedUseOfMenuDesign?: boolean;
}

interface GameViewHeaderProps {
  config: GameViewHeaderConfig | null | undefined;
  onOpenMenu?: (url: string, useIframe: boolean) => void;
}

export default function GameViewHeader({ config, onOpenMenu }: GameViewHeaderProps) {
  const [linksExpanded, setLinksExpanded] = useState(false);
  const title = config?.gameTitle || 'The Playroom';
  const hasLinks = config?.foodMenuUrl || config?.drinkMenuUrl || config?.eventsUrl || config?.facebookUrl || config?.instagramUrl;

  const handleMenuClick = () => {
    const url = config?.foodMenuUrl || config?.drinkMenuUrl;
    const useIframe = config?.venueAllowedUseOfMenuDesign === true;
    if (url && onOpenMenu) {
      onOpenMenu(url, useIframe);
      if (!useIframe) window.open(url, '_blank', 'noopener,noreferrer');
    } else if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <header
      style={{
        padding: '10px 16px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        {config?.logoUrl && (
          <img src={config.logoUrl} alt="" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
        )}
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h1>
          {config?.venueName && <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{config.venueName}</p>}
        </div>
      </div>
      {hasLinks && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setLinksExpanded((e) => !e)}
            style={{
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 600,
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            {linksExpanded ? 'Hide links' : 'Menu & links'}
          </button>
          {linksExpanded && (
            <>
              {(config?.foodMenuUrl || config?.drinkMenuUrl) && (
                <button type="button" onClick={handleMenuClick} style={linkBtnStyle}>View menu</button>
              )}
              {config?.eventsUrl && (
                <a href={config.eventsUrl} target="_blank" rel="noopener noreferrer" style={linkBtnStyle}>Events</a>
              )}
              {config?.facebookUrl && (
                <a href={config.facebookUrl} target="_blank" rel="noopener noreferrer" style={linkBtnStyle}>Facebook</a>
              )}
              {config?.instagramUrl && (
                <a href={config.instagramUrl} target="_blank" rel="noopener noreferrer" style={linkBtnStyle}>Instagram</a>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
}

const linkBtnStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: 13,
  fontWeight: 500,
  background: 'var(--surface)',
  color: 'var(--accent)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  cursor: 'pointer',
  textDecoration: 'none',
};
