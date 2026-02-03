/**
 * Generate N unique randomized bingo cards from the 75-song pool for printing.
 * Each card: 5×5, 24 unique song titles + FREE center. No repeats on a card.
 */
import { buildCardFromPool } from '../types/game';
import type { BingoCard, Song } from '../types/game';

/** Generate `count` unique cards from `pool`. Each card uses a different seed so layouts vary. */
export function generatePrintableCards(pool: Song[], count: number): BingoCard[] {
  if (pool.length < 24 || count < 1) return [];
  const cards: BingoCard[] = [];
  const seedBase = `print-${Date.now()}-`;
  for (let i = 0; i < count; i++) {
    cards.push(buildCardFromPool(pool, `${seedBase}${i}`));
  }
  return cards;
}

/** Truncate for print cell (avoid overflow). */
function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

/** Build a full HTML document for printing bingo cards. 2 cards per page, stacked vertically. Playroom Bingo branding. */
export function buildBingoCardsPrintDocument(
  cards: BingoCard[],
  options: { title?: string; cardsPerPage?: number } = {}
): string {
  const { title: gameTitle, cardsPerPage = 2 } = options;
  const brandTitle = 'Playroom Bingo';
  const maxTitleLen = 28;

  const renderCard = (card: BingoCard, cardIndex: number): string => {
    const rows: string[] = [];
    for (let row = 0; row < 5; row++) {
      const cells: string[] = [];
      for (let col = 0; col < 5; col++) {
        const idx = row * 5 + col;
        const item = card[idx];
        const text = item === 'FREE' ? 'FREE' : truncate((item as Song).title, maxTitleLen);
        cells.push(`<td class="cell">${escapeHtml(text)}</td>`);
      }
      rows.push(`<tr>${cells.join('')}</tr>`);
    }
    return `
      <div class="card">
        <div class="card-header">
          <span class="card-brand">${escapeHtml(brandTitle)}</span>
          ${gameTitle ? `<span class="card-game">${escapeHtml(gameTitle)}</span>` : ''}
        </div>
        <div class="card-label">Card ${cardIndex + 1}</div>
        <table class="card-grid"><tbody>${rows.join('')}</tbody></table>
      </div>`;
  };

  const pages: string[] = [];
  for (let p = 0; p < cards.length; p += cardsPerPage) {
    const pageCards = cards.slice(p, p + cardsPerPage);
    pages.push(`
      <div class="page">
        <div class="page-header">
          <h1 class="page-title">${escapeHtml(brandTitle)}</h1>
          ${gameTitle ? `<p class="page-subtitle">${escapeHtml(gameTitle)}</p>` : ''}
          <p class="page-meta">${cards.length} unique cards · 5 in a row wins</p>
        </div>
        <div class="cards-stack">
          ${pageCards.map((card, i) => renderCard(card, p + i)).join('')}
        </div>
        <footer class="page-footer">
          <a href="https://theplayroom.netlify.app">theplayroom.netlify.app</a>
        </footer>
      </div>`);
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(brandTitle)}${gameTitle ? ` — ${escapeHtml(gameTitle)}` : ''} — Printable Bingo Cards</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 0; font-size: 12px; color: #111; }
    .page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 12px 16px;
      page-break-after: always;
      min-height: 100vh;
    }
    .page:last-child { page-break-after: auto; }
    .page-header {
      text-align: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #333;
      width: 100%;
      max-width: 7in;
    }
    .page-title { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.02em; }
    .page-subtitle { margin: 4px 0 0 0; font-size: 14px; color: #444; }
    .page-meta { margin: 4px 0 0 0; font-size: 11px; color: #666; }
    .cards-stack {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      flex: 1;
    }
    .card {
      border: 2px solid #333;
      padding: 10px;
      width: 4.2in;
      max-width: 100%;
    }
    .card-header { text-align: center; margin-bottom: 4px; }
    .card-brand { font-weight: 700; font-size: 14px; display: block; }
    .card-game { font-size: 12px; color: #444; }
    .card-label { font-weight: 600; text-align: center; margin-bottom: 6px; font-size: 11px; }
    .card-grid { width: 100%; border-collapse: collapse; table-layout: fixed; }
    .cell { border: 1px solid #333; padding: 6px 4px; text-align: center; font-size: 10px; line-height: 1.2; }
    .cell:empty::after { content: " "; }
    .page-footer {
      margin-top: auto;
      padding-top: 12px;
      text-align: center;
      font-size: 11px;
      color: #666;
    }
    .page-footer a { color: #333; }
    @media print {
      body { padding: 0; }
      .page { page-break-after: always; padding: 10px; min-height: auto; }
      .page:last-child { page-break-after: auto; }
      .card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  ${pages.join('')}
</body>
</html>`;

  return html;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Open print window for bingo cards. */
export function printBingoCards(pool: Song[], count: number, title?: string): void {
  const cards = generatePrintableCards(pool, count);
  if (cards.length === 0) return;
  const doc = buildBingoCardsPrintDocument(cards, { title, cardsPerPage: 2 });
  const w = window.open('', '_blank');
  if (!w) {
    alert('Please allow pop-ups to print cards.');
    return;
  }
  w.document.write(doc);
  w.document.close();
  w.focus();
  w.onload = () => {
    w.print();
  };
}
