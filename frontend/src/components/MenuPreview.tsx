/**
 * Live WYSIWYG preview for the menu builder.
 */
import type { MenuBuilderState, MenuTheme, OutputFormat } from '../types/pageBuilder';

interface MenuPreviewProps {
  state: MenuBuilderState;
  forPrint?: boolean;
}

const THEME_CLASS: Record<MenuTheme, string> = {
  classic: 'menu-preview--classic',
  warm: 'menu-preview--warm',
  casual: 'menu-preview--casual',
  modern: 'menu-preview--modern',
  coastal: 'menu-preview--coastal',
};

const FORMAT_ASPECT: Record<OutputFormat, string> = {
  print: 'menu-preview--print',
  tv: 'menu-preview--tv',
  phone: 'menu-preview--phone',
  instagram: 'menu-preview--instagram',
  facebook: 'menu-preview--facebook',
};

export function MenuPreview({ state, forPrint }: MenuPreviewProps) {
  const { sections, theme, format, brand } = state;
  const themeClass = THEME_CLASS[theme];
  const formatClass = FORMAT_ASPECT[format];

  return (
    <div
      className={`menu-preview ${themeClass} ${formatClass} ${forPrint ? 'menu-preview--print-view' : ''}`}
      style={{ ['--menu-accent' as string]: brand.accentColor || '#e94560' }}
    >
      <div className="menu-preview__inner">
        {brand.logoUrl && <img src={brand.logoUrl} alt="" className="menu-preview__logo" />}
        {brand.title && <h1 className="menu-preview__title">{brand.title}</h1>}
        {brand.subtitle && <p className="menu-preview__subtitle">{brand.subtitle}</p>}
        <div className="menu-preview__sections">
          {sections.map((section) => (
            <section key={section.id} className="menu-preview__section">
              <h2 className="menu-preview__section-title">{section.name}</h2>
              <ul className="menu-preview__items">
                {section.items.map((item) => (
                  <li key={item.id} className="menu-preview__item">
                    <div className="menu-preview__item-main">
                      <span className="menu-preview__item-name">{item.name}</span>
                      {item.price != null && item.price !== '' && (
                        <span className="menu-preview__item-price">{item.price}</span>
                      )}
                    </div>
                    {item.description && <p className="menu-preview__item-desc">{item.description}</p>}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
      <style>{`
        .menu-preview {
          background: var(--surface);
          color: var(--text);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.12);
          min-height: 320px;
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        .menu-preview__inner { padding: 1.25rem 1.5rem; flex: 1; }
        .menu-preview__logo { max-height: 56px; width: auto; margin-bottom: 0.5rem; display: block; }
        .menu-preview__title { margin: 0 0 0.25rem; font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; color: var(--text); }
        .menu-preview__subtitle { margin: 0 0 1rem; font-size: 0.875rem; color: var(--text-muted); }
        .menu-preview__section { margin-bottom: 1.25rem; }
        .menu-preview__section-title {
          margin: 0 0 0.5rem; font-size: 1rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--menu-accent);
          border-bottom: 2px solid var(--menu-accent);
          padding-bottom: 0.25rem;
        }
        .menu-preview__items { list-style: none; padding: 0; margin: 0; }
        .menu-preview__item { margin-bottom: 0.5rem; }
        .menu-preview__item-main { display: flex; justify-content: space-between; align-items: baseline; gap: 0.75rem; }
        .menu-preview__item-name { font-weight: 600; }
        .menu-preview__item-price { font-variant-numeric: tabular-nums; color: var(--menu-accent); font-weight: 700; }
        .menu-preview__item-desc { margin: 0.15rem 0 0; font-size: 0.8125rem; color: var(--text-muted); line-height: 1.4; }
        .menu-preview--print { aspect-ratio: 8.5 / 11; max-width: 400px; }
        .menu-preview--tv { aspect-ratio: 16 / 9; max-width: 560px; }
        .menu-preview--phone { aspect-ratio: 9 / 16; max-width: 280px; }
        .menu-preview--instagram { aspect-ratio: 4 / 5; max-width: 320px; }
        .menu-preview--facebook { aspect-ratio: 1.91 / 1; max-width: 560px; }
        .menu-preview--classic .menu-preview__title { font-family: Georgia, serif; }
        .menu-preview--warm .menu-preview__inner { background: linear-gradient(180deg, #fef8f0 0%, var(--surface) 100%); }
        .menu-preview--coastal .menu-preview__inner { background: linear-gradient(180deg, #f0f9ff 0%, var(--surface) 100%); }
        @media print { .menu-preview--print-view { box-shadow: none; } }
      `}</style>
    </div>
  );
}
