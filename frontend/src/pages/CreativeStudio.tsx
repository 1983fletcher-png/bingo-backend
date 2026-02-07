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
  // Price at end: optional $/€, digits, optional .xx; or " - $12" style
  const match = trimmed.match(/\s*[-–—]?\s*([$€]?\s*\d+(?:\.\d{1,2})?)\s*$/);
  if (match) {
    const rest = trimmed.slice(0, trimmed.length - match[0].length).trim();
    const price = normalizePrice(match[1].replace(/\s/g, ''));
    return [rest, price];
  }
  return [trimmed, null];
}

/** Skip lines that are clearly not menu content: phone numbers, zip, random digits, cruft. */
function isLikelyNoise(line: string): boolean {
  const t = line.trim();
  if (t.length <= 1) return true;
  // Mostly digits (e.g. 91017, phone, zip)
  const digits = (t.match(/\d/g) || []).length;
  if (digits >= 4 && digits >= t.length * 0.6) return true;
  if (/^\d{5}(-\d{4})?$/.test(t)) return true; // zip
  if (/^[\d\s\-\.\(\)]{10,}$/.test(t)) return true; // phone-like
  // Common web junk
  const lower = t.toLowerCase();
  if (lower.startsWith('©') || lower.includes('all rights reserved')) return true;
  if (lower === 'click here' || lower === 'read more' || lower === 'learn more') return true;
  if (/^https?:\/\//.test(t) && t.length > 60) return true; // long URL
  if (/^[\d\s,]+$/.test(t) && t.length > 8) return true; // number list only
  return false;
}

/** True if line looks like a section heading (menu category). */
function isSectionLine(line: string): boolean {
  const lower = line.toLowerCase().trim();
  if (lower.startsWith('##') || lower.startsWith('section:') || lower === '---') return true;
  if (/\b(section|menu|hours|open)\b/.test(lower) && line.length < 50) return true;
  if (/^#{1,3}\s+\S+/.test(line.trim())) return true;
  // Common category words
  if (/\b(drinks|food|appetizers|entrees|mains|sides|desserts|beer|cocktails|wine|specials)\b/.test(lower) && line.length < 40) return true;
  return false;
}

/** True if line is venue subtitle: food truck, "food by X", "hours", etc. */
function isSubtitleLine(line: string): boolean {
  const lower = line.toLowerCase().trim();
  if (lower.includes('food truck') || lower.includes('food by') || lower.includes('food from')) return true;
  if (lower.startsWith('hours') || lower.startsWith('open ') || lower === 'hours') return true;
  return false;
}

/** Normalize section title for display. */
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

    // Another title-like line before any section: treat as subtitle (e.g. venue tagline)
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

  // Sync blocks when raw input changes (paste, edit, or restore from storage)
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
          ← Playroom
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
          <button
            type="button"
            onClick={() => setMode('MENU')}
            className={`creative-studio__mode-btn ${mode === 'MENU' ? 'creative-studio__mode-btn--active' : ''}`}
          >
            MENU
          </button>
          <button
            type="button"
            onClick={() => setMode('TRAINING_STUDY')}
            className={`creative-studio__mode-btn ${mode === 'TRAINING_STUDY' ? 'creative-studio__mode-btn--active' : ''}`}
          >
            TRAINING
          </button>
          <button
            type="button"
            onClick={() => setMode('TRAINING_TEST')}
            className={`creative-studio__mode-btn ${mode === 'TRAINING_TEST' ? 'creative-studio__mode-btn--active' : ''}`}
          >
            TEST
          </button>
          <button
            type="button"
            onClick={() => setMode('TRIVIA')}
            className={`creative-studio__mode-btn ${mode === 'TRIVIA' ? 'creative-studio__mode-btn--active' : ''}`}
          >
            TRIVIA
          </button>
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
          <button type="button" className="creative-studio__export-btn" onClick={handleExportPdf}>
            Export PDF
          </button>
          <button type="button" className="creative-studio__export-btn" onClick={handleExportWeb}>
            Export Web
          </button>
          <button type="button" className="creative-studio__export-btn" onClick={handleExportSocial}>
            Instagram / Facebook
          </button>
        </div>
        <div className="creative-studio__qr">
          <label className="creative-studio__qr-label">QR Code — paste any URL to encode:</label>
          <div className="creative-studio__qr-row">
            <input
              type="url"
              className="creative-studio__qr-input"
              value={qrUrl}
              onChange={(e) => setQrUrl(e.target.value)}
              placeholder="https://..."
            />
            <button type="button" className="creative-studio__export-btn" onClick={handleGenerateQr}>
              Generate QR
            </button>
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
