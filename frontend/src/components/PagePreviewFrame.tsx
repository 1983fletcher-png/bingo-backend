/**
 * Shared frame for page builder previews: theme + format aspect ratio + accent.
 */
import type { MenuTheme, OutputFormat } from '../types/pageBuilder';

const THEME_CLASS: Record<MenuTheme, string> = {
  classic: 'page-preview--classic',
  warm: 'page-preview--warm',
  casual: 'page-preview--casual',
  modern: 'page-preview--modern',
  coastal: 'page-preview--coastal',
};

const FORMAT_ASPECT: Record<OutputFormat, string> = {
  print: 'page-preview--print',
  tv: 'page-preview--tv',
  phone: 'page-preview--phone',
  instagram: 'page-preview--instagram',
  facebook: 'page-preview--facebook',
};

interface PagePreviewFrameProps {
  theme: MenuTheme;
  format: OutputFormat;
  accentColor?: string;
  forPrint?: boolean;
  children: React.ReactNode;
}

export function PagePreviewFrame({ theme, format, accentColor, forPrint, children }: PagePreviewFrameProps) {
  const themeClass = THEME_CLASS[theme];
  const formatClass = FORMAT_ASPECT[format];

  return (
    <div
      className={`page-preview ${themeClass} ${formatClass} ${forPrint ? 'page-preview--print-view' : ''}`}
      style={{ ['--page-accent' as string]: accentColor || '#e94560' }}
    >
      <div className="page-preview__inner">{children}</div>
      <style>{`
        .page-preview {
          background: var(--surface);
          color: var(--text);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.12);
          min-height: 280px;
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        .page-preview__inner { padding: 1.25rem 1.5rem; flex: 1; }
        .page-preview--print { aspect-ratio: 8.5 / 11; max-width: 400px; }
        .page-preview--tv { aspect-ratio: 16 / 9; max-width: 560px; }
        .page-preview--phone { aspect-ratio: 9 / 16; max-width: 280px; }
        .page-preview--instagram { aspect-ratio: 4 / 5; max-width: 320px; }
        .page-preview--facebook { aspect-ratio: 1.91 / 1; max-width: 560px; }
        .page-preview--classic .page-preview__inner { font-family: Georgia, serif; }
        .page-preview--warm .page-preview__inner { background: linear-gradient(180deg, #fef8f0 0%, var(--surface) 100%); }
        .page-preview--coastal .page-preview__inner { background: linear-gradient(180deg, #f0f9ff 0%, var(--surface) 100%); }
        @media print { .page-preview--print-view { box-shadow: none; } }
      `}</style>
    </div>
  );
}
