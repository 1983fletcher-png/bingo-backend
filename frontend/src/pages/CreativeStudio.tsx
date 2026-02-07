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

type ContentBlock = SectionBlock | TitleBlock;

/** Extract price from end of string: $12, $12.99, 12.99, €10. Returns [restOfText, price or null]. */
function extractPrice(text: string): [string, string | null] {
  const trimmed = text.trim();
  // Match $ or € followed by digits and optional .xx at end of string
  const match = trimmed.match(/\s+([$€]?\s*\d+(?:\.\d{1,2})?)\s*$/);
  if (match) {
    const price = match[1].replace(/\s/g, '').trim();
    const rest = trimmed.slice(0, match.index).trim();
    return [rest, price];
  }
  return [trimmed, null];
}

/** True if line looks like a section heading. */
function isSectionLine(line: string): boolean {
  const lower = line.toLowerCase().trim();
  if (lower.startsWith('##') || lower.startsWith('section:') || lower === '---') return true;
  if (lower.includes('section') || lower.includes('menu')) return true;
  if (/^#{1,3}\s+.+/.test(line.trim())) return true; // markdown ## or ###
  return false;
}

/** Normalize section title: strip "Section:" prefix, ##, etc. */
function normalizeSectionTitle(line: string): string {
  let s = line.trim();
  const lower = s.toLowerCase();
  if (lower.startsWith('section:')) s = s.slice(8).trim();
  if (lower.startsWith('menu:')) s = s.slice(5).trim();
  s = s.replace(/^#+\s*/, '').trim(); // ## Title
  if (s === '---') s = 'Section';
  return s || line.trim();
}

function parseContent(rawText: string): ContentBlock[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const blocks: ContentBlock[] = [];
  let currentSection: SectionBlock | null = null;

  for (const line of lines) {
    if (isSectionLine(line)) {
      const title = normalizeSectionTitle(line);
      currentSection = { type: 'section', content: title, items: [] };
      blocks.push(currentSection);
      continue;
    }

    if (currentSection) {
      // Item: "Name - Description" or "Name - Description - $12" or "Name"
      const [namePart, ...rest] = line.split(/\s*-\s*/).map((s) => s.trim());
      const name = namePart ?? '';
      const descAndPrice = rest.join(' - ');
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

    // No section yet: treat as title
    blocks.push({ type: 'title', content: line });
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
    switch (mode) {
      case 'MENU':
        if (block.type === 'section') {
          return (
            <div className="creative-studio__section creative-studio__section--menu" key={`${idx}-${block.content}`}>
              <h2 className="creative-studio__section-title">{block.content}</h2>
              {block.items.map((item, i) => (
                <div className="creative-studio__item" key={i}>
                  <strong>{item.name}</strong>
                  <p>{item.description}</p>
                  {item.price != null && <span>${item.price}</span>}
                </div>
              ))}
            </div>
          );
        }
        if (block.type === 'title') {
          return (
            <h1 className="creative-studio__title" key={`${idx}-${block.content}`}>
              {block.content}
            </h1>
          );
        }
        return null;

      case 'TRAINING_STUDY':
        if (block.type === 'section') {
          return (
            <div className="creative-studio__section creative-studio__section--training" key={`${idx}-${block.content}`}>
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
        if (block.type === 'title') {
          return (
            <h1 className="creative-studio__title" key={`${idx}-${block.content}`}>
              {block.content}
            </h1>
          );
        }
        return null;

      case 'TRAINING_TEST':
        if (block.type === 'section') {
          return (
            <div className="creative-studio__section creative-studio__section--test" key={`${idx}-${block.content}`}>
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
        if (block.type === 'title') {
          return (
            <h1 className="creative-studio__title" key={`${idx}-${block.content}`}>
              {block.content}
            </h1>
          );
        }
        return null;

      case 'TRIVIA':
        if (block.type === 'section') {
          return (
            <div className="creative-studio__section creative-studio__section--trivia" key={`${idx}-${block.content}`}>
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
        if (block.type === 'title') {
          return (
            <h1 className="creative-studio__title" key={`${idx}-${block.content}`}>
              {block.content}
            </h1>
          );
        }
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
        <p className="creative-studio__paste-label">Paste your menu or drop text here:</p>
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
