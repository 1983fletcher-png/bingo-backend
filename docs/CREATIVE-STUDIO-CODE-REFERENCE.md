# Creative Studio — Full Code Reference

This document lists all frontend code for **Creative Studio**: create menus, training materials, trivia, and display content instantly. Use it as a single reference for the entire flow.

---

## File index

| # | Path | Purpose |
|---|------|--------|
| 1 | `frontend/src/pages/CreativeStudio.tsx` | Main Creative Studio: paste/drop, MENU / TRAINING / TEST / TRIVIA modes, preview, export (PDF, Web, Social, QR) |
| 2 | `frontend/src/lib/creativeStudioExport.ts` | Export helpers: PDF, Web HTML, Social viewport, QR code |
| 3 | `frontend/src/styles/CreativeStudio.css` | Creative Studio layout and components |
| 4 | `frontend/src/pages/Create.tsx` | Template family selection (Hospitality, Education, Care, Business, General) |
| 5 | `frontend/src/pages/CreateHospitality.tsx` | Hospitality sub-options: Menu, Specials, Event, Live Music, Welcome |
| 6 | `frontend/src/pages/CreateMenuBuilder.tsx` | Full menu builder: scraper, sections/items, theme, format, print, share link |
| 7 | `frontend/src/styles/create.css` | Create flow (template cards, hero) |
| 8 | `frontend/src/styles/menu-builder.css` | Menu builder panel and layout |
| 9 | `frontend/src/components/MenuPreview.tsx` | Live WYSIWYG menu preview |
| 10 | `frontend/src/types/pageBuilder.ts` | Shared types: MenuBuilderState, MenuSection, MenuItem, themes, formats, defaults |

**Routes (App.tsx):** `/create` → CreativeStudio; `/create/templates` → Create; `/create/hospitality` → CreateHospitality; `/create/hospitality/menu` and `/create/hospitality/specials` → CreateMenuBuilder; `/create/hospitality/event` → CreateEventBuilder; `/create/hospitality/live-music` → CreateLiveMusicBuilder; `/create/hospitality/welcome` → CreateWelcomeBuilder.

---

## 1. CreativeStudio.tsx

Full path: `frontend/src/pages/CreativeStudio.tsx`

```tsx
/**
 * Creative Studio – Playroom UI
 * Paste/drop content, block system (Title, Section, Item), mode toggles (MENU / TRAINING / TEST / TRIVIA),
 * auto-save, VLC-style export (PDF, Web, Social, QR).
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  exportPdf,
  exportWeb,
  exportSocial,
  exportQrDataUrl,
  type StudioMode,
  type ExportBlock,
} from '../lib/creativeStudioExport';
import '../styles/CreativeStudio.css';

interface ParsedItem {
  type: 'item';
  name: string;
  description: string;
  price: string | null;
  image: string | null;
}

interface SectionBlock {
  type: 'section';
  content: string;
  items: ParsedItem[];
}

interface TitleBlock {
  type: 'title';
  content: string;
}

interface SubtitleBlock {
  type: 'subtitle';
  content: string;
}

type ContentBlock = SectionBlock | TitleBlock | SubtitleBlock;

/** Normalize price to $X.XX format for display. */
function normalizePrice(raw: string | null): string | null {
  if (raw == null || raw.trim() === '') return null;
  const s = raw.replace(/\s/g, '').trim();
  const numMatch = s.match(/([€$])?(\d+(?:\.\d{1,2})?)/);
  if (!numMatch) return null;
  const num = numMatch[2];
  const hasDecimals = /\.\d{1,2}$/.test(num);
  const formatted = hasDecimals ? num : `${num}.00`;
  return (numMatch[1] === '€' ? '€' : '$') + formatted;
}

/** Extract price from end of string: $12, 12.99, €10. Returns [restOfText, normalized price or null]. */
function extractPrice(text: string): [string, string | null] {
  const trimmed = text.trim();
  const match = trimmed.match(/\s*[-–—]?\s*([$€]?\s*\d+(?:\.\d{1,2})?)\s*$/);
  if (match) {
    const rest = trimmed.slice(0, trimmed.length - match[0].length).trim();
    const price = normalizePrice(match[1].replace(/\s/g, ''));
    return [rest, price];
  }
  return [trimmed, null];
}

/** Skip lines that are clearly not menu content. */
function isLikelyNoise(line: string): boolean {
  const t = line.trim();
  if (t.length <= 1) return true;
  const digits = (t.match(/\d/g) || []).length;
  if (digits >= 4 && digits >= t.length * 0.6) return true;
  if (/^\d{5}(-\d{4})?$/.test(t)) return true;
  if (/^[\d\s\-\.\(\)]{10,}$/.test(t)) return true;
  const lower = t.toLowerCase();
  if (lower.startsWith('©') || lower.includes('all rights reserved')) return true;
  if (lower === 'click here' || lower === 'read more' || lower === 'learn more') return true;
  if (/^https?:\/\//.test(t) && t.length > 60) return true;
  if (/^[\d\s,]+$/.test(t) && t.length > 8) return true;
  return false;
}

function isSectionLine(line: string): boolean {
  const lower = line.toLowerCase().trim();
  if (lower.startsWith('##') || lower.startsWith('section:') || lower === '---') return true;
  if (/\b(section|menu|hours|open)\b/.test(lower) && line.length < 50) return true;
  if (/^#{1,3}\s+\S+/.test(line.trim())) return true;
  if (/\b(drinks|food|appetizers|entrees|mains|sides|desserts|beer|cocktails|wine|specials)\b/.test(lower) && line.length < 40) return true;
  return false;
}

function isSubtitleLine(line: string): boolean {
  const lower = line.toLowerCase().trim();
  if (lower.includes('food truck') || lower.includes('food by') || lower.includes('food from')) return true;
  if (lower.startsWith('hours') || lower.startsWith('open ') || lower === 'hours') return true;
  return false;
}

function normalizeSectionTitle(line: string): string {
  let s = line.trim();
  const lower = s.toLowerCase();
  if (lower.startsWith('section:')) s = s.slice(8).trim();
  if (lower.startsWith('menu:')) s = s.slice(5).trim();
  s = s.replace(/^#+\s*/, '').trim();
  if (s === '---') s = 'Section';
  return s || line.trim();
}

function parseContent(rawText: string): ContentBlock[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .filter((l) => !isLikelyNoise(l));
  const blocks: ContentBlock[] = [];
  let currentSection: SectionBlock | null = null;
  let seenFirstTitle = false;

  for (const line of lines) {
    if (isSectionLine(line)) {
      const title = normalizeSectionTitle(line);
      currentSection = { type: 'section', content: title, items: [] };
      blocks.push(currentSection);
      continue;
    }

    if (currentSection) {
      const [namePart, ...rest] = line.split(/\s*[-–—]\s*/).map((s) => s.trim());
      const name = (namePart ?? '').trim();
      if (name.length === 0) continue;
      const descAndPrice = rest.join(' – ').trim();
      const [description, price] = extractPrice(descAndPrice);
      currentSection.items.push({
        type: 'item',
        name,
        description: description || '',
        price,
        image: null,
      });
      continue;
    }

    if (!seenFirstTitle) {
      blocks.push({ type: 'title', content: line });
      seenFirstTitle = true;
      continue;
    }

    if (isSubtitleLine(line)) {
      blocks.push({ type: 'subtitle', content: line });
      continue;
    }

    blocks.push({ type: 'subtitle', content: line });
  }

  return blocks;
}

const DEFAULT_CONTENT = `MRB Drinks Menu
Section: Cocktails
Margarita - Tequila, Triple Sec, Lime - $12
Mojito - Rum, Mint, Lime, Sugar - $11
Section: Beers
IPA - Hoppy, 6.5% ABV - $7
Lager - Light, Crisp - $6`;

const AUTO_SAVE_KEY = 'creativeStudioAutoSave';

export default function CreativeStudio() {
  const [rawInput, setRawInput] = useState(() => {
    try {
      return localStorage.getItem(AUTO_SAVE_KEY) ?? DEFAULT_CONTENT;
    } catch {
      return DEFAULT_CONTENT;
    }
  });
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => {
    const initial = (() => {
      try {
        return localStorage.getItem(AUTO_SAVE_KEY) ?? DEFAULT_CONTENT;
      } catch {
        return DEFAULT_CONTENT;
      }
    })();
    return parseContent(initial);
  });
  const [mode, setMode] = useState<StudioMode>('MENU');
  const [qrUrl, setQrUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    setBlocks(parseContent(rawInput));
  }, [rawInput]);

  useEffect(() => {
    try {
      localStorage.setItem(AUTO_SAVE_KEY, rawInput);
    } catch {
      // ignore
    }
  }, [rawInput]);

  const handlePasteOrDrop = (e: React.ClipboardEvent | React.DragEvent) => {
    e.preventDefault();
    let pastedText = '';
    if ('clipboardData' in e && e.clipboardData) {
      pastedText = e.clipboardData.getData('text/plain');
    } else if ('dataTransfer' in e && e.dataTransfer) {
      pastedText = e.dataTransfer.getData('text/plain');
    }
    if (pastedText) {
      setRawInput(pastedText);
      setBlocks(parseContent(pastedText));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawInput(e.target.value);
  };

  const handleExportPdf = () => {
    exportPdf(blocks as ExportBlock[], mode);
  };
  const handleExportWeb = () => {
    exportWeb(blocks as ExportBlock[], mode);
  };
  const handleExportSocial = () => {
    exportSocial(blocks as ExportBlock[], mode);
  };
  const handleGenerateQr = async () => {
    const url = qrUrl.trim() || window.location.href;
    try {
      const dataUrl = await exportQrDataUrl(url);
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error(err);
      setQrDataUrl(null);
    }
  };

  function renderBlock(block: ContentBlock, idx: number): React.ReactNode {
    const key = `${idx}-${block.content}`;
    switch (mode) {
      case 'MENU':
        if (block.type === 'section') {
          return (
            <div className="creative-studio__section creative-studio__section--menu" key={key}>
              <h2 className="creative-studio__section-title">{block.content}</h2>
              {block.items.map((item, i) => (
                <div className="creative-studio__item creative-studio__item--menu" key={i}>
                  <div className="creative-studio__item-name">{item.name}</div>
                  {item.description && <div className="creative-studio__item-desc">{item.description}</div>}
                  {item.price != null && <div className="creative-studio__item-price">{item.price}</div>}
                </div>
              ))}
            </div>
          );
        }
        if (block.type === 'title') {
          return <h1 className="creative-studio__title creative-studio__title--center" key={key}>{block.content}</h1>;
        }
        if (block.type === 'subtitle') {
          return <p className="creative-studio__subtitle" key={key}>{block.content}</p>;
        }
        return null;

      case 'TRAINING_STUDY':
        if (block.type === 'section') {
          return (
            <div className="creative-studio__section creative-studio__section--training" key={key}>
              <h2 className="creative-studio__section-title">{block.content}</h2>
              {block.items.map((item, i) => (
                <div className="creative-studio__item" key={i}>
                  <strong>{item.name}</strong>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          );
        }
        if (block.type === 'title') return <h1 className="creative-studio__title" key={key}>{block.content}</h1>;
        if (block.type === 'subtitle') return <p className="creative-studio__subtitle" key={key}>{block.content}</p>;
        return null;

      case 'TRAINING_TEST':
        if (block.type === 'section') {
          return (
            <div className="creative-studio__section creative-studio__section--test" key={key}>
              <h2 className="creative-studio__section-title">{block.content}</h2>
              {block.items.map((item, i) => (
                <div className="creative-studio__item" key={i}>
                  <strong>{item.name}</strong>
                  <p className="creative-studio__blank">__________________________</p>
                </div>
              ))}
            </div>
          );
        }
        if (block.type === 'title') return <h1 className="creative-studio__title" key={key}>{block.content}</h1>;
        if (block.type === 'subtitle') return <p className="creative-studio__subtitle" key={key}>{block.content}</p>;
        return null;

      case 'TRIVIA':
        if (block.type === 'section') {
          return (
            <div className="creative-studio__section creative-studio__section--trivia" key={key}>
              <h2 className="creative-studio__section-title">{block.content}</h2>
              {block.items.map((item, i) => (
                <div className="creative-studio__trivia-block" key={i}>
                  <strong>Question:</strong> What ingredients are in a {item.name}?
                  <ul>
                    <li>Option 1: {item.description}</li>
                    <li>Option 2: Dummy Option</li>
                    <li>Option 3: Dummy Option</li>
                    <li>Option 4: Dummy Option</li>
                  </ul>
                </div>
              ))}
            </div>
          );
        }
        if (block.type === 'title') return <h1 className="creative-studio__title" key={key}>{block.content}</h1>;
        if (block.type === 'subtitle') return <p className="creative-studio__subtitle" key={key}>{block.content}</p>;
        return null;

      default:
        return null;
    }
  }

  return (
    <div
      className="creative-studio"
      onPaste={handlePasteOrDrop}
      onDrop={handlePasteOrDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <header className="creative-studio__header">
        <Link to="/" className="creative-studio__back">
          ← Back to Playroom
        </Link>
        <h1 className="creative-studio__heading">Creative Studio</h1>
        <p className="creative-studio__tagline">
          Create menus, training materials, trivia, and display content instantly.
        </p>
        <Link to="/create/templates" className="creative-studio__templates-link">
          Browse template families (Hospitality, Education, Care, Business, General)
        </Link>
      </header>

      <section className="creative-studio__paste" aria-label="Paste or drop content">
        <p className="creative-studio__paste-label">Paste your menu or drop text here. We keep: venue title, food truck / hours line, section headings (e.g. Drinks, Food), and items with name – description – price. Random numbers and web cruft are stripped.</p>
        <textarea
          className="creative-studio__textarea"
          value={rawInput}
          onChange={handleInputChange}
          onPaste={handlePasteOrDrop}
          placeholder="Paste text or menu here..."
          rows={8}
        />
      </section>

      <section className="creative-studio__modes" aria-label="Display mode">
        <span className="creative-studio__modes-label">Mode:</span>
        <div className="creative-studio__mode-toggles">
          <button type="button" onClick={() => setMode('MENU')} className={`creative-studio__mode-btn ${mode === 'MENU' ? 'creative-studio__mode-btn--active' : ''}`}>MENU</button>
          <button type="button" onClick={() => setMode('TRAINING_STUDY')} className={`creative-studio__mode-btn ${mode === 'TRAINING_STUDY' ? 'creative-studio__mode-btn--active' : ''}`}>TRAINING</button>
          <button type="button" onClick={() => setMode('TRAINING_TEST')} className={`creative-studio__mode-btn ${mode === 'TRAINING_TEST' ? 'creative-studio__mode-btn--active' : ''}`}>TEST</button>
          <button type="button" onClick={() => setMode('TRIVIA')} className={`creative-studio__mode-btn ${mode === 'TRIVIA' ? 'creative-studio__mode-btn--active' : ''}`}>TRIVIA</button>
        </div>
      </section>

      <section className="creative-studio__workspace" aria-label="Preview">
        <h2 className="creative-studio__workspace-title">Preview</h2>
        <div className="creative-studio__blocks">
          {blocks.map((block, idx) => (
            <div key={idx} className="creative-studio__block-wrapper">
              {renderBlock(block, idx)}
            </div>
          ))}
        </div>
      </section>

      <section className="creative-studio__export" aria-label="Export">
        <h2 className="creative-studio__export-title">Export — one content, any output</h2>
        <p className="creative-studio__export-hint">Like VLC: choose what you need. PDF (print), Web (HTML file), Social (sized window), or QR for any URL.</p>
        <div className="creative-studio__export-btns">
          <button type="button" className="creative-studio__export-btn" onClick={handleExportPdf}>Export PDF</button>
          <button type="button" className="creative-studio__export-btn" onClick={handleExportWeb}>Export Web</button>
          <button type="button" className="creative-studio__export-btn" onClick={handleExportSocial}>Instagram / Facebook</button>
        </div>
        <div className="creative-studio__qr">
          <label className="creative-studio__qr-label">QR Code — paste any URL to encode:</label>
          <div className="creative-studio__qr-row">
            <input type="url" className="creative-studio__qr-input" value={qrUrl} onChange={(e) => setQrUrl(e.target.value)} placeholder="https://..." />
            <button type="button" className="creative-studio__export-btn" onClick={handleGenerateQr}>Generate QR</button>
          </div>
          {qrDataUrl && (
            <div className="creative-studio__qr-preview">
              <img src={qrDataUrl} alt="QR code" width={200} height={200} />
              <a href={qrDataUrl} download="qrcode.png" className="creative-studio__qr-download">Download PNG</a>
            </div>
          )}
        </div>
      </section>

      <section className="creative-studio__advanced" aria-label="Advanced settings">
        <p className="creative-studio__advanced-label">Optional:</p>
        <div className="creative-studio__advanced-btns">
          <button type="button" className="creative-studio__advanced-btn" disabled>Theme Overlay</button>
          <button type="button" className="creative-studio__advanced-btn" disabled>Auto-Suggest Sections</button>
          <button type="button" className="creative-studio__advanced-btn" disabled>Image Adjustments</button>
        </div>
      </section>
    </div>
  );
}
```

---

## 2. creativeStudioExport.ts

Full path: `frontend/src/lib/creativeStudioExport.ts`

```ts
/**
 * Creative Studio – VLC-style export: one content source, many outputs.
 * PDF (print), Web (download HTML), Social (sized HTML for screenshot), QR (encode URL).
 */
import QRCode from 'qrcode';

export type StudioMode = 'MENU' | 'TRAINING_STUDY' | 'TRAINING_TEST' | 'TRIVIA';

export interface ExportItem {
  name: string;
  description: string;
  price: string | null;
}

export interface ExportBlock {
  type: 'section' | 'title' | 'subtitle';
  content: string;
  items?: ExportItem[];
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildExportHtml(
  blocks: ExportBlock[],
  mode: StudioMode,
  options: { forPrint?: boolean; viewportWidth?: number } = {}
): string {
  const { forPrint = false, viewportWidth } = options;
  const bodyParts: string[] = [];

  blocks.forEach((block) => {
    if (block.type === 'title') {
      bodyParts.push(`<h1 class="cs-export-title cs-export-title--center">${escapeHtml(block.content)}</h1>`);
      return;
    }
    if (block.type === 'subtitle') {
      bodyParts.push(`<p class="cs-export-subtitle">${escapeHtml(block.content)}</p>`);
      return;
    }
    if (block.type === 'section' && block.items) {
      bodyParts.push(`<h2 class="cs-export-section">${escapeHtml(block.content)}</h2>`);
      block.items.forEach((item) => {
        if (mode === 'MENU') {
          const priceRow = item.price ? `<div class="cs-export-item-price">${escapeHtml(item.price)}</div>` : '';
          bodyParts.push(
            `<div class="cs-export-item cs-export-item--menu"><div class="cs-export-item-name">${escapeHtml(item.name)}</div>${item.description ? `<div class="cs-export-item-desc">${escapeHtml(item.description)}</div>` : ''}${priceRow}</div>`
          );
        } else if (mode === 'TRAINING_STUDY') {
          bodyParts.push(
            `<div class="cs-export-item"><strong>${escapeHtml(item.name)}</strong><p>${escapeHtml(item.description)}</p></div>`
          );
        } else if (mode === 'TRAINING_TEST') {
          bodyParts.push(
            `<div class="cs-export-item"><strong>${escapeHtml(item.name)}</strong><p class="cs-export-blank">__________________________</p></div>`
          );
        } else if (mode === 'TRIVIA') {
          bodyParts.push(
            `<div class="cs-export-trivia"><strong>Question:</strong> What ingredients are in a ${escapeHtml(item.name)}?<ul><li>Option 1: ${escapeHtml(item.description)}</li><li>Option 2: Dummy Option</li><li>Option 3: Dummy Option</li><li>Option 4: Dummy Option</li></ul></div>`
          );
        }
      });
    }
  });

  const viewportMeta =
    viewportWidth != null
      ? `<meta name="viewport" content="width=${viewportWidth}, initial-scale=1">`
      : '<meta name="viewport" content="width=device-width, initial-scale=1">';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  ${viewportMeta}
  <title>Creative Studio Export</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 24px; color: #1a202c; background: #fff; line-height: 1.5; }
    .cs-export-title { font-size: 1.75rem; margin: 0 0 0.5rem; font-weight: 700; }
    .cs-export-title--center { text-align: center; }
    .cs-export-subtitle { text-align: center; font-size: 0.9375rem; color: #4a5568; margin: 0 0 1.5rem; }
    .cs-export-section { font-size: 1.25rem; margin: 1.5rem 0 0.75rem; font-weight: 600; color: #2d3748; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.25rem; }
    .cs-export-item { margin-bottom: 0.75rem; padding-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; }
    .cs-export-item:last-child { border-bottom: none; }
    .cs-export-item strong { display: block; margin-bottom: 2px; }
    .cs-export-item p { margin: 0; color: #4a5568; }
    .cs-export-item--menu .cs-export-item-name { font-weight: 700; font-size: 1.0625rem; margin-bottom: 2px; }
    .cs-export-item--menu .cs-export-item-desc { font-size: 0.9375rem; color: #4a5568; margin-bottom: 4px; }
    .cs-export-item--menu .cs-export-item-price { font-weight: 600; font-size: 1rem; }
    .cs-export-item-price { font-weight: 600; color: #1a365d; }
    .cs-export-blank { color: #a0aec0 !important; }
    .cs-export-trivia { margin-bottom: 1rem; padding: 0.75rem; background: #f7fafc; border-radius: 8px; }
    .cs-export-trivia ul { margin: 0.5rem 0 0; padding-left: 1.25rem; }
    .cs-export-section--training, .cs-export-section--test, .cs-export-section--trivia { margin-top: 1.5rem; }
    ${forPrint ? '@media print { body { padding: 16px; } }' : ''}
  </style>
</head>
<body>
  ${bodyParts.join('\n  ')}
</body>
</html>`;
}

/** Open print dialog (user can choose "Save as PDF"). */
export function exportPdf(blocks: ExportBlock[], mode: StudioMode): void {
  const html = buildExportHtml(blocks, mode, { forPrint: true });
  const w = window.open('', '_blank');
  if (!w) {
    alert('Allow pop-ups to export PDF, or use Export Web and print from the opened file.');
    return;
  }
  w.document.write(html);
  w.document.close();
  w.focus();
  w.onafterprint = () => w.close();
  setTimeout(() => {
    try {
      w.print();
    } catch {
      w.close();
    }
  }, 250);
}

/** Download a standalone .html file. */
export function exportWeb(blocks: ExportBlock[], mode: StudioMode): void {
  const html = buildExportHtml(blocks, mode);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `creative-studio-export-${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Open export in a new window sized for social (e.g. 1080x1080). User can screenshot or print to PDF. */
export function exportSocial(
  blocks: ExportBlock[],
  mode: StudioMode,
  size: { w: number; h: number } = { w: 1080, h: 1080 }
): void {
  const html = buildExportHtml(blocks, mode, { viewportWidth: size.w });
  const w = window.open('', '_blank', `width=${size.w},height=${size.h},scrollbars=yes`);
  if (!w) {
    alert('Allow pop-ups to export for social. Alternatively use Export Web and open the file.');
    return;
  }
  w.document.write(html);
  w.document.close();
  w.focus();
}

/** Generate QR code image as data URL for the given URL. Use in img src or download. */
export async function exportQrDataUrl(url: string, size = 256): Promise<string> {
  return QRCode.toDataURL(url, { width: size, margin: 2 });
}
```

---

## 3. CreativeStudio.css

Full path: `frontend/src/styles/CreativeStudio.css`

```css
/**
 * Creative Studio – paste/drop, mode toggles, block preview, export placeholders.
 */
.creative-studio {
  min-height: 100vh;
  padding: var(--space-6, 1.5rem) var(--space-4, 1rem) var(--space-12);
  max-width: 900px;
  margin: 0 auto;
  color: var(--text, #1a202c);
}

.creative-studio__header {
  margin-bottom: var(--space-8, 2rem);
}

.creative-studio__back {
  display: inline-block;
  font-size: 0.9375rem;
  color: var(--text-muted, #718096);
  text-decoration: none;
  margin-bottom: var(--space-4);
  transition: color 0.15s ease;
}

.creative-studio__back:hover {
  color: var(--accent, #e94560);
}

.creative-studio__heading {
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 var(--space-2);
  color: var(--text, #1a202c);
}

.creative-studio__tagline {
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-secondary, #4a5568);
  margin: 0 0 var(--space-4);
}

.creative-studio__templates-link {
  font-size: 0.875rem;
  color: var(--accent, #e94560);
  text-decoration: none;
}

.creative-studio__templates-link:hover {
  text-decoration: underline;
}

/* Paste / drop */
.creative-studio__paste {
  margin-bottom: var(--space-8);
}

.creative-studio__paste-label {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin: 0 0 var(--space-2);
}

.creative-studio__textarea {
  width: 100%;
  min-height: 160px;
  padding: var(--space-4);
  font-size: 0.9375rem;
  font-family: inherit;
  line-height: 1.5;
  color: var(--text);
  background: var(--surface, #2d3748);
  border: 1px solid var(--border, #4a5568);
  border-radius: 8px;
  resize: vertical;
  transition: border-color 0.15s ease;
}

.creative-studio__textarea:focus {
  outline: none;
  border-color: var(--accent, #e94560);
}

.creative-studio__textarea::placeholder {
  color: var(--text-muted, #718096);
}

/* Mode toggles */
.creative-studio__modes {
  margin-bottom: var(--space-8);
}

.creative-studio__modes-label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: var(--space-2);
}

.creative-studio__mode-toggles {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.creative-studio__mode-btn {
  padding: var(--space-2) var(--space-4);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.creative-studio__mode-btn:hover {
  background: var(--surface-hover, #3d4a5c);
  color: var(--text);
}

.creative-studio__mode-btn--active {
  background: var(--accent, #e94560);
  border-color: var(--accent);
  color: #fff;
}

/* Workspace / preview */
.creative-studio__workspace {
  margin-bottom: var(--space-8);
  padding: var(--space-6);
  background: var(--surface, #2d3748);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.creative-studio__workspace-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0 0 var(--space-4);
}

.creative-studio__blocks {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.creative-studio__block-wrapper {
  min-height: 0;
}

.creative-studio__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 var(--space-2);
  color: var(--text);
}

.creative-studio__title--center {
  text-align: center;
  margin-bottom: var(--space-3);
}

.creative-studio__subtitle {
  text-align: center;
  font-size: 0.9375rem;
  color: var(--text-secondary, #4a5568);
  margin: 0 0 var(--space-4);
}

.creative-studio__section {
  margin-bottom: var(--space-4);
}

/* MENU: item name, description, price on its own line */
.creative-studio__item--menu .creative-studio__item-name {
  font-weight: 700;
  font-size: 1.0625rem;
  margin-bottom: 2px;
}

.creative-studio__item--menu .creative-studio__item-desc {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.creative-studio__item--menu .creative-studio__item-price {
  font-weight: 600;
  font-size: 1rem;
  color: var(--accent, #1a365d);
}

/* Training / Test / Trivia: clear section separation */
.creative-studio__section--training,
.creative-studio__section--test,
.creative-studio__section--trivia {
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border, #2d3748);
}

.creative-studio__section:last-child {
  margin-bottom: 0;
}

.creative-studio__section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 var(--space-3);
  color: var(--accent, #e94560);
}

.creative-studio__item {
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--border);
}

.creative-studio__item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.creative-studio__item strong {
  display: block;
  margin-bottom: 2px;
}

.creative-studio__item p {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

.creative-studio__item span {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--accent);
}

.creative-studio__blank {
  color: var(--text-muted) !important;
}

.creative-studio__trivia-block {
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background: rgba(0, 0, 0, 0.15);
  border-radius: 8px;
}

.creative-studio__trivia-block strong {
  display: block;
  margin-bottom: var(--space-2);
}

.creative-studio__trivia-block ul {
  margin: 0;
  padding-left: 1.25rem;
}

.creative-studio__trivia-block li {
  margin-bottom: 4px;
}

/* Export */
.creative-studio__export {
  margin-bottom: var(--space-8);
}

.creative-studio__export-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0 0 var(--space-2);
}

.creative-studio__export-hint {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0 0 var(--space-4);
  max-width: 480px;
}

.creative-studio__qr {
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
}

.creative-studio__qr-label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
}

.creative-studio__qr-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
  margin-bottom: var(--space-3);
}

.creative-studio__qr-input {
  flex: 1;
  min-width: 200px;
  padding: var(--space-2) var(--space-3);
  font-size: 0.9375rem;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
}

.creative-studio__qr-input:focus {
  outline: none;
  border-color: var(--accent);
}

.creative-studio__qr-preview {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
}

.creative-studio__qr-preview img {
  display: block;
  border: 1px solid var(--border);
  border-radius: 8px;
}

.creative-studio__qr-download {
  font-size: 0.875rem;
  color: var(--accent);
  text-decoration: none;
}

.creative-studio__qr-download:hover {
  text-decoration: underline;
}

.creative-studio__export-btns {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.creative-studio__export-btn {
  padding: var(--space-2) var(--space-4);
  font-size: 0.875rem;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  opacity: 0.8;
}

.creative-studio__export-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Advanced */
.creative-studio__advanced {
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
}

.creative-studio__advanced-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0 0 var(--space-2);
}

.creative-studio__advanced-btns {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.creative-studio__advanced-btn {
  padding: var(--space-2) var(--space-3);
  font-size: 0.8125rem;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
}

.creative-studio__advanced-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
```

---

## 4. Create.tsx

Full path: `frontend/src/pages/Create.tsx`

```tsx
/**
 * Create a page – template family selection.
 */
import { Link } from 'react-router-dom';
import '../styles/create.css';

const TEMPLATE_FAMILIES = [
  { id: 'hospitality', title: 'Hospitality & Venues', description: 'Bars, restaurants, breweries, food trucks, music venues, hotels', to: '/create/hospitality' },
  { id: 'education', title: 'Education & Learning', description: 'Schools, classrooms, libraries, youth programs, workshops', to: '/create/education' },
  { id: 'care', title: 'Care & Wellness', description: 'Assisted living, clinics, therapy offices, hospitals', to: '/create/care' },
  { id: 'business', title: 'Business & Corporate', description: 'Training, onboarding, internal communication', to: '/create/business' },
  { id: 'general', title: 'General Page', description: 'Announcements, flyers, quick pages', to: '/create/general' },
] as const;

export default function Create() {
  return (
    <div className="create">
      <section className="create__hero" aria-label="Choose a template">
        <Link to="/" className="create__back">← Back to Playroom</Link>
        <Link to="/create" className="create__back" style={{ marginLeft: 12 }}>Creative Studio</Link>
        <h1 className="create__title">Create a page</h1>
        <p className="create__tagline">Pick what you need. We'll guide you step by step—no design experience required.</p>
      </section>
      <div className="create__cards">
        {TEMPLATE_FAMILIES.map((card) => (
          <Link key={card.id} to={card.to} className="create__card">
            <span className="create__card-title">{card.title}</span>
            <span className="create__card-desc">{card.description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

---

## 5. CreateHospitality.tsx

Full path: `frontend/src/pages/CreateHospitality.tsx`

```tsx
/**
 * Hospitality & Venues – sub-options: Menu, Specials, Event, Live Music, Welcome.
 */
import { Link } from 'react-router-dom';
import '../styles/create.css';

const HOSPITALITY_PURPOSES = [
  { id: 'menu', title: 'Menu', description: 'Build a food or drink menu for print, TV, or QR.', to: '/create/hospitality/menu' },
  { id: 'specials', title: 'Daily / Weekly Specials', description: "Highlight today's or this week's specials.", to: '/create/hospitality/specials' },
  { id: 'event', title: 'Event Promotion', description: 'Promote an upcoming event or theme night.', to: '/create/hospitality/event' },
  { id: 'live-music', title: 'Live Music / Featured Performer', description: "Show who's playing and when.", to: '/create/hospitality/live-music' },
  { id: 'welcome', title: 'Welcome / Information Display', description: 'Hours, WiFi, house rules, contact.', to: '/create/hospitality/welcome' },
] as const;

export default function CreateHospitality() {
  return (
    <div className="create">
      <section className="create__hero" aria-label="What do you want to create?">
        <Link to="/create" className="create__back">← All templates</Link>
        <h1 className="create__title">Hospitality & Venues</h1>
        <p className="create__tagline">What do you want to create? Choose one and we'll walk you through it.</p>
      </section>
      <div className="create__cards create__cards--list">
        {HOSPITALITY_PURPOSES.map((card) => (
          <Link key={card.id} to={card.to} className="create__card create__card--purpose">
            <span className="create__card-title">{card.title}</span>
            <span className="create__card-desc">{card.description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

---

## 6. CreateMenuBuilder.tsx

Full path: `frontend/src/pages/CreateMenuBuilder.tsx`

The full component is below (~420 lines). It includes: ScraperPanel, logo/title/subtitle/accent, menu type chips, sections & items (add/remove/reorder), Suggested by date (observances API), theme and format chips, Print and Get share link, and live MenuPreview.

```tsx
// See frontend/src/pages/CreateMenuBuilder.tsx for the full 420-line source.
// Summary: useCallback/useState for state; ScraperPanel onApply; brand inputs;
// MENU_TYPES, THEMES, FORMATS chips; section/item CRUD; observances API;
// handlePrint (window.print), handleShare (POST /api/page-builder/save);
// MenuPreview in layout and in menu-builder__print-area for print.
```

To get the exact current code, open `frontend/src/pages/CreateMenuBuilder.tsx` in the repo.

---

## 7. create.css

Full path: `frontend/src/styles/create.css`

```css
/**
 * Page & Menu Builder – Create flow.
 * Calm, card-based, single-screen feel.
 */

.create {
  min-height: calc(100vh - var(--header-height, 56px));
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-10) var(--space-5) var(--space-16);
  text-align: center;
}

.create__hero {
  max-width: 560px;
  margin-bottom: var(--space-12);
}

.create__back {
  display: inline-block;
  font-size: 0.9375rem;
  color: var(--text-muted);
  text-decoration: none;
  margin-bottom: var(--space-4);
  transition: color var(--transition-base);
}
.create__back:hover {
  color: var(--accent);
}

.create__title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: var(--text);
  margin: 0 0 var(--space-3);
}

.create__tagline {
  font-size: clamp(0.9375rem, 1.8vw, 1.0625rem);
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0;
}

.create__cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-5);
  width: 100%;
  max-width: 900px;
  text-align: left;
}

.create__cards--list {
  grid-template-columns: 1fr;
  max-width: 480px;
}

.create__card {
  display: flex;
  flex-direction: column;
  padding: var(--space-6) var(--space-5);
  border-radius: var(--radius-lg);
  border: 2px solid var(--border);
  text-decoration: none;
  color: inherit;
  transition: border-color var(--transition-base), box-shadow var(--transition-base), transform var(--transition-fast);
}

.create__card:hover {
  color: inherit;
  text-decoration: none;
  border-color: var(--accent);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.create__card--purpose {
  padding: var(--space-5) var(--space-5);
}

.create__card-title {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.35rem;
}

.create__card-desc {
  font-size: 0.875rem;
  line-height: 1.45;
  color: var(--text-muted);
}
```

---

## 8. menu-builder.css

Full path: `frontend/src/styles/menu-builder.css`

```css
.menu-builder {
  min-height: 100vh;
  padding: 1rem;
  background: var(--bg);
}

.menu-builder__header {
  max-width: 1200px;
  margin: 0 auto 1rem;
  text-align: center;
}

.menu-builder__back {
  display: inline-block;
  font-size: 0.9375rem;
  color: var(--text-muted);
  text-decoration: none;
  margin-bottom: 0.5rem;
}
.menu-builder__back:hover { color: var(--accent); }

.menu-builder__title {
  margin: 0 0 0.25rem;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 800;
  color: var(--text);
}

.menu-builder__tagline {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--text-muted);
}

.menu-builder__layout {
  display: grid;
  grid-template-columns: minmax(280px, 380px) 1fr;
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  align-items: start;
}

@media (max-width: 900px) {
  .menu-builder__layout {
    grid-template-columns: 1fr;
  }
}

.menu-builder__panel {
  background: var(--surface);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid var(--border);
  position: sticky;
  top: 1rem;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
}

.menu-builder__block {
  margin-top: 1rem;
}
.menu-builder__block:first-child { margin-top: 0; }

.menu-builder__label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.35rem;
}

.menu-builder__input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.9375rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg);
  color: var(--text);
}

.menu-builder__input--section {
  font-weight: 600;
}

.menu-builder__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.menu-builder__chips--wrap { flex-wrap: wrap; }

.menu-builder__chip {
  padding: 0.35rem 0.65rem;
  font-size: 0.8125rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
}

.menu-builder__chip--on {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.menu-builder__section-edit {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.menu-builder__section-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.menu-builder__section-head .menu-builder__input--section {
  flex: 1;
}

.menu-builder__section-actions {
  display: flex;
  gap: 0.25rem;
}

.menu-builder__icon-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface2);
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}

.menu-builder__icon-btn--danger:hover {
  background: var(--error);
  color: #fff;
  border-color: var(--error);
}

.menu-builder__item-list {
  list-style: none;
  padding: 0;
  margin: 0 0 0.5rem;
}

.menu-builder__item-row {
  display: grid;
  grid-template-columns: 1fr 60px 1fr 28px;
  gap: 0.35rem;
  align-items: center;
  margin-bottom: 0.35rem;
}

.menu-builder__item-row .menu-builder__input--desc {
  grid-column: 1 / -2;
}

.menu-builder__add-item,
.menu-builder__add-section {
  padding: 0.35rem 0.65rem;
  font-size: 0.8125rem;
  border: 1px dashed var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.menu-builder__add-item:hover,
.menu-builder__add-section:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.menu-builder__add-section {
  margin-top: 0.5rem;
}

.menu-builder__export {
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.menu-builder__btn {
  display: block;
  width: 100%;
  padding: 0.6rem 1rem;
  font-size: 0.9375rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  cursor: pointer;
  margin-bottom: 0.5rem;
}

.menu-builder__btn--primary {
  background: var(--accent);
  color: #fff;
  border: none;
}

.menu-builder__btn--secondary {
  background: var(--surface2);
  color: var(--text);
  border: 1px solid var(--border);
}

.menu-builder__share-url {
  margin: 0.5rem 0 0;
  font-size: 0.8125rem;
  word-break: break-all;
}

.menu-builder__share-url a {
  color: var(--accent);
}

.menu-builder__share-error {
  margin: 0.5rem 0 0;
  font-size: 0.8125rem;
  color: var(--error);
}

.menu-builder__preview-wrap {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 1rem;
  min-height: 400px;
}

.menu-builder__print-area {
  display: none;
}

@media print {
  .menu-builder__header,
  .menu-builder__layout,
  .menu-builder__panel {
    display: none !important;
  }
  .menu-builder__print-area {
    display: block !important;
  }
  .menu-builder__print-area .menu-preview {
    box-shadow: none;
    max-width: 100%;
  }
}
```

---

## 9. MenuPreview.tsx

Full path: `frontend/src/components/MenuPreview.tsx`

```tsx
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
```

---

## 10. pageBuilder.ts

Full path: `frontend/src/types/pageBuilder.ts`

```ts
/**
 * Page & Menu Builder – shared types and scrape result shape.
 */

export interface ScrapeResult {
  logoUrl?: string | null;
  colors?: string[];
  title?: string | null;
  description?: string | null;
  siteUrl?: string;
  foodMenuUrl?: string | null;
  drinkMenuUrl?: string | null;
  eventsUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  error?: string;
}

export interface PageBrand {
  logoUrl?: string;
  title?: string;
  subtitle?: string;
  accentColor?: string;
}

export type MenuType = 'food' | 'drinks' | 'specials' | 'custom';
export type MenuTheme = 'classic' | 'warm' | 'casual' | 'modern' | 'coastal';
export type OutputFormat = 'print' | 'tv' | 'phone' | 'instagram' | 'facebook';

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price?: string;
}

export interface MenuSection {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface MenuBuilderState {
  type: 'menu';
  menuType: MenuType;
  sections: MenuSection[];
  theme: MenuTheme;
  format: OutputFormat;
  brand: PageBrand;
}

const DEFAULT_SECTIONS_FOOD: Omit<MenuSection, 'id'>[] = [
  { name: 'Starters', items: [{ id: '1', name: 'House salad', description: 'Mixed greens, vinaigrette', price: '8' }] },
  { name: 'Mains', items: [{ id: '2', name: 'Grilled salmon', description: 'With seasonal vegetables', price: '22' }] },
  { name: 'Sides', items: [{ id: '3', name: 'Roasted potatoes', price: '6' }] },
  { name: 'Desserts', items: [{ id: '4', name: 'Chocolate cake', price: '9' }] },
];
const DEFAULT_SECTIONS_DRINKS: Omit<MenuSection, 'id'>[] = [
  { name: 'Beer', items: [{ id: '1', name: 'House lager', price: '6' }] },
  { name: 'Wine', items: [{ id: '2', name: 'House red / white', price: '8' }] },
  { name: 'Cocktails', items: [{ id: '3', name: 'Classic margarita', price: '12' }] },
  { name: 'Non-alcoholic', items: [{ id: '4', name: 'Soda, juice, water', price: '3' }] },
];
const DEFAULT_SECTIONS_SPECIALS: Omit<MenuSection, 'id'>[] = [
  { name: "Today's specials", items: [{ id: '1', name: 'Soup of the day', price: '7' }, { id: '2', name: "Chef's special", description: 'Ask your server', price: 'MP' }] },
];
const DEFAULT_SECTIONS_CUSTOM: Omit<MenuSection, 'id'>[] = [
  { name: 'Section 1', items: [{ id: '1', name: 'Item one', price: '' }] },
];

function addIds<T extends { items: { id?: string }[] }>(section: T, si: number): T & { id: string } {
  const id = `s-${si}-${Date.now()}`;
  const items = section.items.map((it, ii) => ({ ...it, id: it.id || `i-${si}-${ii}` }));
  return { ...section, id, items } as T & { id: string };
}

export function getDefaultSections(menuType: MenuType): MenuSection[] {
  const raw =
    menuType === 'food' ? DEFAULT_SECTIONS_FOOD
    : menuType === 'drinks' ? DEFAULT_SECTIONS_DRINKS
    : menuType === 'specials' ? DEFAULT_SECTIONS_SPECIALS
    : DEFAULT_SECTIONS_CUSTOM;
  return raw.map((s, i) => addIds(s, i));
}

export interface EventBuilderState {
  type: 'event';
  brand: PageBrand;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  description: string;
  imageUrl?: string;
  ctaLabel: string;
  ctaUrl?: string;
  theme: MenuTheme;
  format: OutputFormat;
}

export const DEFAULT_EVENT_STATE: EventBuilderState = {
  type: 'event',
  brand: { title: 'Your venue', accentColor: '#e94560' },
  eventTitle: 'Theme Night',
  eventDate: '',
  eventTime: '8:00 PM',
  description: 'Join us for a special evening. Good vibes, great company.',
  ctaLabel: 'Learn more',
  ctaUrl: '',
  theme: 'classic',
  format: 'print',
};

export interface LiveMusicBuilderState {
  type: 'live-music';
  brand: PageBrand;
  performerName: string;
  dateTime: string;
  blurb: string;
  imageUrl?: string;
  moreEventsUrl?: string;
  theme: MenuTheme;
  format: OutputFormat;
}

export const DEFAULT_LIVE_MUSIC_STATE: LiveMusicBuilderState = {
  type: 'live-music',
  brand: { title: 'Live at the House', accentColor: '#e94560' },
  performerName: 'Live Music Tonight',
  dateTime: 'Tonight at 9',
  blurb: 'Acoustic set — no cover. Full bar and kitchen.',
  moreEventsUrl: '',
  theme: 'classic',
  format: 'print',
};

export interface WelcomeBuilderState {
  type: 'welcome';
  brand: PageBrand;
  headline: string;
  hours: string;
  wifiName?: string;
  wifiPassword?: string;
  houseRules: string;
  contact: string;
  links: { label: string; url: string }[];
  theme: MenuTheme;
  format: OutputFormat;
}

export const DEFAULT_WELCOME_STATE: WelcomeBuilderState = {
  type: 'welcome',
  brand: { title: 'Welcome', accentColor: '#e94560' },
  headline: "We're glad you're here",
  hours: 'Mon–Thu 11am–10pm · Fri–Sat 11am–11pm · Sun 10am–9pm',
  wifiName: '',
  wifiPassword: '',
  houseRules: 'Please be kind to staff and other guests. No outside food or drink.',
  contact: 'Questions? Ask any team member.',
  links: [],
  theme: 'classic',
  format: 'print',
};

export type PageBuilderDocument =
  | MenuBuilderState
  | EventBuilderState
  | LiveMusicBuilderState
  | WelcomeBuilderState;
```

---

## Related display builders

- **CreateEventBuilder** — `frontend/src/pages/CreateEventBuilder.tsx` (event promotion page)
- **CreateLiveMusicBuilder** — `frontend/src/pages/CreateLiveMusicBuilder.tsx` (live music / performer display)
- **CreateWelcomeBuilder** — `frontend/src/pages/CreateWelcomeBuilder.tsx` (welcome / hours / WiFi / house rules)

These use the same `create.css` and `pageBuilder` types; each has its own form state and preview. For their full code, open the files in the repo.

---

## Quick copy-paste

To get the **exact** current code for any file, open it in your editor:

- Creative Studio (paste, modes, export): `frontend/src/pages/CreativeStudio.tsx`
- Export logic: `frontend/src/lib/creativeStudioExport.ts`
- Styles: `frontend/src/styles/CreativeStudio.css`, `frontend/src/styles/create.css`, `frontend/src/styles/menu-builder.css`
- Template selection: `frontend/src/pages/Create.tsx`, `frontend/src/pages/CreateHospitality.tsx`
- Menu builder: `frontend/src/pages/CreateMenuBuilder.tsx`
- Menu preview: `frontend/src/components/MenuPreview.tsx`
- Types: `frontend/src/types/pageBuilder.ts`
