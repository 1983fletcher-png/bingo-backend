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

/** Build a full HTML document for printing bingo cards. 2 cards per page, no header—cards use full page. */
export function buildBingoCardsPrintDocument(
  cards: BingoCard[],
  options: { title?: string; cardsPerPage?: number } = {}
): string {
  const { cardsPerPage = 2 } = options;
  const maxTitleLen = 28;

  const renderCard = (card: BingoCard, _cardIndex: number): string => {
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
        <table class="card-grid"><tbody>${rows.join('')}</tbody></table>
      </div>`;
  };

  const pages: string[] = [];
  for (let p = 0; p < cards.length; p += cardsPerPage) {
    const pageCards = cards.slice(p, p + cardsPerPage);
    pages.push(`
      <div class="page">
        <div class="cards-stack">
          ${pageCards.map((card, i) => renderCard(card, p + i)).join('')}
        </div>
      </div>`);
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Printable Bingo Cards</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 0; font-size: 12px; color: #111; }
    .page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 0.2in 0.3in;
      page-break-after: always;
      min-height: 100vh;
      gap: 0.15in;
    }
    .page:last-child { page-break-after: auto; }
    .cards-stack {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      flex: 1;
      gap: 0.2in;
      width: 100%;
      max-width: 8in;
    }
    .card {
      border: 2px solid #333;
      padding: 0.12in;
      flex: 1 1 0;
      min-height: 4.2in;
      max-width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card-grid { width: 100%; height: 100%; max-width: 5in; border-collapse: collapse; table-layout: fixed; }
    .cell { border: 1px solid #333; padding: 0.14in 0.08in; text-align: center; font-size: 12px; line-height: 1.3; }
    .cell:empty::after { content: " "; }
    @media print {
      body { padding: 0; }
      .page { page-break-after: always; padding: 0.2in 0.3in; min-height: 100vh; }
      .page:last-child { page-break-after: auto; }
      .card { -webkit-print-color-adjust: exact; print-color-adjust: exact; break-inside: avoid; }
      .cards-stack { gap: 0.15in; }
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
