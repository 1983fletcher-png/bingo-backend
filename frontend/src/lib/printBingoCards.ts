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

/** Build a full HTML document for printing bingo cards. 2 cards per page. */
export function buildBingoCardsPrintDocument(
  cards: BingoCard[],
  options: { title?: string; cardsPerPage?: number } = {}
): string {
  const { title = 'Music Bingo', cardsPerPage = 2 } = options;
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
        <div class="card-label">Card ${cardIndex + 1}</div>
        <table class="card-grid"><tbody>${rows.join('')}</tbody></table>
      </div>`;
  };

  const pages: string[] = [];
  for (let p = 0; p < cards.length; p += cardsPerPage) {
    const pageCards = cards.slice(p, p + cardsPerPage);
    pages.push(`
      <div class="page">
        ${pageCards.map((card, i) => renderCard(card, p + i)).join('')}
      </div>`);
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)} — Printable Bingo Cards</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; margin: 0; padding: 8px; font-size: 12px; color: #111; }
    .page { display: flex; flex-wrap: wrap; gap: 24px; justify-content: center; align-items: flex-start; padding: 12px; page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    .card { border: 2px solid #333; padding: 8px; width: 280px; }
    .card-label { font-weight: 700; text-align: center; margin-bottom: 6px; font-size: 11px; }
    .card-grid { width: 100%; border-collapse: collapse; table-layout: fixed; }
    .cell { border: 1px solid #333; padding: 6px 4px; text-align: center; font-size: 10px; line-height: 1.2; }
    .cell:empty::after { content: " "; }
    @media print {
      body { padding: 0; }
      .page { page-break-after: always; padding: 10px; }
      .page:last-child { page-break-after: auto; }
      .card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <h1 style="text-align:center; margin:0 0 12px 0; font-size: 16px;">${escapeHtml(title)} — Bingo Cards</h1>
  <p style="text-align:center; margin:0 0 12px 0; font-size: 11px;">${cards.length} unique cards · 5 in a row wins</p>
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
