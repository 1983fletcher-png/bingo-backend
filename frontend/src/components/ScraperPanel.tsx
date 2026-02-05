/**
 * Scraper panel for Page Builder. Fetch a venue site, then toggle which fields to drop into the page.
 */
import { useState, useCallback } from 'react';
import { useScrapeSite } from '../hooks/useScrapeSite';
import type { PageBrand } from '../types/pageBuilder';
import '../styles/scraper-panel.css';

export interface ScraperApplyResult {
  brand?: Partial<PageBrand>;
  foodMenuUrl?: string;
  drinkMenuUrl?: string;
  eventsUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  description?: string;
}

interface ScraperPanelProps {
  onApply: (result: ScraperApplyResult) => void;
  compact?: boolean;
}

export function ScraperPanel({ onApply, compact }: ScraperPanelProps) {
  const { scrape, scraping, error, success, data, clear } = useScrapeSite();
  const [url, setUrl] = useState('');
  const [useLogo, setUseLogo] = useState(true);
  const [useTitle, setUseTitle] = useState(true);
  const [useColor, setUseColor] = useState(true);
  const [useDescription, setUseDescription] = useState(false);
  const [useFoodUrl, setUseFoodUrl] = useState(false);
  const [useDrinkUrl, setUseDrinkUrl] = useState(false);
  const [useEventsUrl, setUseEventsUrl] = useState(false);
  const [useFacebook, setUseFacebook] = useState(false);
  const [useInstagram, setUseInstagram] = useState(false);

  const handleFetch = useCallback(() => scrape(url), [scrape, url]);

  const handleDropIn = useCallback(() => {
    if (!data) return;
    const result: ScraperApplyResult = {};
    if (useLogo && data.logoUrl) result.brand = { ...result.brand, logoUrl: data.logoUrl };
    if (useTitle && data.title) result.brand = { ...result.brand, title: data.title };
    if (useColor && data.colors?.[0]) result.brand = { ...result.brand, accentColor: data.colors[0] };
    if (useDescription && data.description) result.description = data.description;
    if (useFoodUrl && data.foodMenuUrl) result.foodMenuUrl = data.foodMenuUrl;
    if (useDrinkUrl && data.drinkMenuUrl) result.drinkMenuUrl = data.drinkMenuUrl;
    if (useEventsUrl && data.eventsUrl) result.eventsUrl = data.eventsUrl;
    if (useFacebook && data.facebookUrl) result.facebookUrl = data.facebookUrl;
    if (useInstagram && data.instagramUrl) result.instagramUrl = data.instagramUrl;
    onApply(result);
  }, [data, useLogo, useTitle, useColor, useDescription, useFoodUrl, useDrinkUrl, useEventsUrl, useFacebook, useInstagram, onApply]);

  const hasData = data && (data.logoUrl || data.title || (data.colors?.length ?? 0) > 0 || data.description || data.foodMenuUrl || data.drinkMenuUrl || data.eventsUrl || data.facebookUrl || data.instagramUrl);

  return (
    <div className={`scraper-panel ${compact ? 'scraper-panel--compact' : ''}`}>
      <p className="scraper-panel__intro">
        Enter your venue or business website. We’ll fetch logo, title, and colors so you can drop them in with one click.
      </p>
      <div className="scraper-panel__row">
        <input
          type="url"
          className="scraper-panel__input"
          placeholder="https://your-venue.com"
          value={url}
          onChange={(e) => { setUrl(e.target.value); clear(); }}
          aria-label="Website URL to scrape"
        />
        <button type="button" className="scraper-panel__btn" onClick={handleFetch} disabled={scraping || !url.trim()}>
          {scraping ? '…' : 'Fetch'}
        </button>
      </div>
      {error && <p className="scraper-panel__error" role="alert">{error}</p>}
      {success && <p className="scraper-panel__success">{success}</p>}

      {hasData && (
        <div className="scraper-panel__toggles">
          <p className="scraper-panel__toggles-title">Drop into your page:</p>
          <div className="scraper-panel__grid">
            {data!.logoUrl && (
              <label className="scraper-panel__toggle">
                <input type="checkbox" checked={useLogo} onChange={(e) => setUseLogo(e.target.checked)} />
                <span>Logo</span>
              </label>
            )}
            {data!.title && (
              <label className="scraper-panel__toggle">
                <input type="checkbox" checked={useTitle} onChange={(e) => setUseTitle(e.target.checked)} />
                <span>Title</span>
              </label>
            )}
            {data!.colors?.[0] && (
              <label className="scraper-panel__toggle">
                <input type="checkbox" checked={useColor} onChange={(e) => setUseColor(e.target.checked)} />
                <span>Accent color</span>
              </label>
            )}
            {data!.description && (
              <label className="scraper-panel__toggle">
                <input type="checkbox" checked={useDescription} onChange={(e) => setUseDescription(e.target.checked)} />
                <span>Description</span>
              </label>
            )}
            {data!.foodMenuUrl && (
              <label className="scraper-panel__toggle">
                <input type="checkbox" checked={useFoodUrl} onChange={(e) => setUseFoodUrl(e.target.checked)} />
                <span>Food menu link</span>
              </label>
            )}
            {data!.drinkMenuUrl && (
              <label className="scraper-panel__toggle">
                <input type="checkbox" checked={useDrinkUrl} onChange={(e) => setUseDrinkUrl(e.target.checked)} />
                <span>Drink menu link</span>
              </label>
            )}
            {data!.eventsUrl && (
              <label className="scraper-panel__toggle">
                <input type="checkbox" checked={useEventsUrl} onChange={(e) => setUseEventsUrl(e.target.checked)} />
                <span>Events link</span>
              </label>
            )}
            {data!.facebookUrl && (
              <label className="scraper-panel__toggle">
                <input type="checkbox" checked={useFacebook} onChange={(e) => setUseFacebook(e.target.checked)} />
                <span>Facebook</span>
              </label>
            )}
            {data!.instagramUrl && (
              <label className="scraper-panel__toggle">
                <input type="checkbox" checked={useInstagram} onChange={(e) => setUseInstagram(e.target.checked)} />
                <span>Instagram</span>
              </label>
            )}
          </div>
          <button type="button" className="scraper-panel__drop" onClick={handleDropIn}>
            Drop into page
          </button>
        </div>
      )}
    </div>
  );
}
