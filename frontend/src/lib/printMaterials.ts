/**
 * Printable materials: trivia quiz sheet and flashcards.
 */
import type { TriviaQuestion } from '../types/trivia';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Build HTML document for printing a trivia quiz (questions + blank lines for answers). */
export function buildTriviaQuizPrintDocument(
  questions: TriviaQuestion[],
  title?: string
): string {
  const t = title || 'Trivia Quiz';
  const items = questions
    .map(
      (q, i) => `
    <tr>
      <td class="num">${i + 1}.</td>
      <td class="q">${escapeHtml(q.question)}</td>
      <td class="line">_________________________</td>
    </tr>`
    )
    .join('');

  const hasAnswerKey = questions.some((q) => q.correctAnswer || q.hostNotes || q.funFact);
  const answerKeyRows = hasAnswerKey
    ? questions
        .map(
          (q, i) => `
    <tr>
      <td class="num">${i + 1}.</td>
      <td class="ans">${escapeHtml(q.correctAnswer)}</td>
      <td class="notes">${[q.hostNotes, q.funFact].filter(Boolean).map((n) => escapeHtml(n!)).join(' — ')}</td>
    </tr>`
        )
        .join('')
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(t)} — Quiz</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 16px; font-size: 14px; color: #111; max-width: 700px; margin: 0 auto; padding: 16px; }
    h1 { font-size: 18px; margin-bottom: 8px; }
    h2 { font-size: 14px; margin-top: 24px; margin-bottom: 8px; color: #333; }
    table { width: 100%; border-collapse: collapse; }
    .num { width: 28px; vertical-align: top; padding: 8px 4px 8px 0; }
    .q { padding: 8px 0; }
    .line { width: 200px; padding-left: 12px; color: #666; }
    .ans { padding: 6px 0; font-weight: 600; }
    .notes { padding: 6px 0; font-size: 12px; color: #555; }
    @media print { body { padding: 12px; } .answer-key { page-break-before: always; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(t)}</h1>
  <p style="color:#666; font-size: 12px;">Name: _________________________ &nbsp; Date: _________</p>
  <table>
    ${items}
  </table>
  ${answerKeyRows ? `
  <div class="answer-key">
    <h2>Answer key (host only)</h2>
    <table>
      ${answerKeyRows}
    </table>
  </div>
  ` : ''}
</body>
</html>`;
}

/** Build HTML document for printing flashcards (question on one half, answer on the other; cut and fold). */
export function buildFlashcardsPrintDocument(
  questions: TriviaQuestion[],
  title?: string
): string {
  const t = title || 'Trivia';
  const cards = questions
    .map(
      (q, i) => `
    <div class="card">
      <div class="front"><span class="card-num">${i + 1}</span> ${escapeHtml(q.question)}</div>
      <div class="back"><span class="card-num">${i + 1}</span> ${escapeHtml(q.correctAnswer)}${q.funFact ? `<br><span class="fun-fact">${escapeHtml(q.funFact)}</span>` : ''}</div>
    </div>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(t)} — Flashcards</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 12px; font-size: 12px; color: #111; }
    h1 { font-size: 16px; margin-bottom: 8px; }
    .deck { display: flex; flex-wrap: wrap; gap: 12px; }
    .card { width: 280px; border: 1px solid #333; page-break-inside: avoid; }
    .front, .back { padding: 12px; min-height: 70px; border-bottom: 1px dashed #999; }
    .back { border-bottom: none; background: #f5f5f5; }
    .card-num { font-weight: 700; margin-right: 6px; color: #555; }
    .fun-fact { font-size: 10px; color: #555; display: block; margin-top: 6px; }
    @media print {
      .card { break-inside: avoid; }
      .front, .back { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(t)} — Flashcards</h1>
  <p style="font-size: 11px; color: #666;">Cut along the lines. Fold to hide the answer. ${questions.length} cards.</p>
  <div class="deck">${cards}</div>
</body>
</html>`;
}

/** Calendar print pack: page 1 = big grid, page 2 = observances index (with optional blank lines), pages 3+ = planning sheets. */
export type CalendarPrintDay = {
  day: number;
  primaryName: string | null;
};
export type CalendarPlanningDay = {
  day: number;
  dateLabel: string;
  selectedNames: string[];
  noteText: string;
};
export type ObservancesIndexDay = {
  day: number;
  observances: { name: string; category?: string }[];
  noteText: string;
};

export type CalendarPrintStyle = 'fun' | 'neutral' | 'bw';

export function buildCalendarPrintPack(
  year: number,
  _month: number,
  monthName: string,
  daysInMonth: number,
  startWeekday: number,
  gridDays: CalendarPrintDay[],
  planningDays: CalendarPlanningDay[],
  options: {
    printStyle?: CalendarPrintStyle;
    observancesIndex?: ObservancesIndexDay[];
    includeBlankLinesUnderObservances?: boolean;
  } = {}
): string {
  const { printStyle = 'neutral', observancesIndex = [], includeBlankLinesUnderObservances = true } = options;

  const dayCells: string[] = [];
  for (let i = 0; i < startWeekday; i++) {
    dayCells.push('<div class="cal-cell cal-cell--empty"></div>');
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const info = gridDays.find((g) => g.day === d);
    const primary = info?.primaryName ?? '';
    dayCells.push(`
      <div class="cal-cell">
        <div class="cal-day-num">${d}</div>
        <div class="cal-primary">${escapeHtml(primary)}</div>
        <div class="cal-blank">&nbsp;</div>
      </div>`);
  }

  const renderObsRows = (dayBlocks: ObservancesIndexDay[]) =>
    dayBlocks.flatMap((dayBlock) => {
      const dayHeader = `<div class="obs-index-day">${escapeHtml(monthName)} ${dayBlock.day}</div>`;
      const obsRows = dayBlock.observances.flatMap((o) => {
        const line = `<div class="obs-index-line">${escapeHtml(o.name)}${o.category ? ` <span class="obs-cat">(${escapeHtml(o.category)})</span>` : ''}</div>`;
        const blank = includeBlankLinesUnderObservances ? '<div class="obs-index-blank">_________________________</div>' : '';
        return [line, blank];
      });
      const noteBlock = dayBlock.noteText.trim()
        ? `<div class="obs-index-notes"><strong>Notes:</strong> ${escapeHtml(dayBlock.noteText)}</div>`
        : '';
      return [dayHeader, ...obsRows, noteBlock].filter(Boolean);
    });

  const observancesIndexPages =
    observancesIndex.length === 0
      ? ''
      : (() => {
          const firstHalf = observancesIndex.filter((d) => d.day <= 15);
          const secondHalf = observancesIndex.filter((d) => d.day > 15);
          const page1 =
            firstHalf.length > 0
              ? `
  <div class="print-pack-page observances-index-page">
    <h2 class="observances-index-title">This month's observances — 1–15</h2>
    <div class="obs-index-list">${renderObsRows(firstHalf).join('')}</div>
  </div>`
              : '';
          const page2 =
            secondHalf.length > 0
              ? `
  <div class="print-pack-page observances-index-page">
    <h2 class="observances-index-title">This month's observances — 16–${daysInMonth}</h2>
    <div class="obs-index-list">${renderObsRows(secondHalf).join('')}</div>
  </div>`
              : '';
          return page1 + page2;
        })();

  const planningPage =
    planningDays.length === 0
      ? ''
      : `
  <div class="print-pack-page planning-table-page">
    <h2 class="planning-table-title">Planning — ${escapeHtml(monthName)} ${year}</h2>
    <table class="planning-table">
      <thead><tr><th>Date</th><th>Selected observances</th><th>Notes</th></tr></thead>
      <tbody>
        ${planningDays
          .map(
            (p) => `
        <tr>
          <td class="planning-date-cell">${escapeHtml(p.dateLabel)}</td>
          <td class="planning-selections-cell">${(p.selectedNames.length ? p.selectedNames : ['—']).map((n) => escapeHtml(n)).join(', ')}</td>
          <td class="planning-notes-cell">${p.noteText ? escapeHtml(p.noteText) : '—'}</td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>
    <p class="planning-table-blank">Meeting / planning notes: _________________________________________</p>
    <p class="planning-table-blank">_________________________________________</p>
  </div>`;

  const isBw = printStyle === 'bw';
  const isFun = printStyle === 'fun';
  const bodyClass = `print-style-${printStyle}`;
  const accentColor = isBw ? '#111' : isFun ? '#6366f1' : '#475569';
  const borderColor = isBw ? '#333' : '#666';
  const calCellBg = isBw ? '#fff' : isFun ? '#f5f3ff' : '#f8fafc';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(monthName)} ${year} — Activity Calendar</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 12px; font-size: 13px; color: #111; }
    body.print-style-bw { color: #111; }
    body.print-style-neutral { color: #334155; }
    body.print-style-fun { color: #1e1b4b; }
    .print-pack-page { page-break-after: always; }
    .print-pack-page:last-child { page-break-after: auto; }
    .cal-page { position: relative; display: flex; flex-direction: column; min-height: 0; }
    .cal-scaled { display: flex; flex-direction: column; flex: 1; min-height: 0; }
    .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); grid-auto-rows: 1fr; gap: 6px; flex: 1; min-height: 0; }
    .cal-cell { border: 1px solid ${borderColor}; padding: 8px; min-height: 0; background: ${calCellBg}; display: flex; flex-direction: column; }
    .cal-cell--empty { border-color: #ccc; background: #f9f9f9; }
    .cal-day-num { font-weight: 700; font-size: 1.05rem; margin-bottom: 4px; color: ${accentColor}; }
    .cal-primary { font-size: 0.8rem; color: #333; line-height: 1.3; }
    .cal-blank { flex: 1; min-height: 16px; }
    .cal-header { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-bottom: 6px; text-align: center; font-weight: 600; font-size: 0.9rem; color: ${accentColor}; }
    .observances-index-page { padding: 14px 0; }
    .observances-index-title { font-size: 1rem; margin: 0 0 14px; color: ${accentColor}; }
    .obs-index-list { }
    .obs-index-day { font-weight: 700; margin-top: 12px; margin-bottom: 4px; font-size: 0.9rem; color: ${accentColor}; break-after: avoid; }
    .obs-index-day:first-of-type { margin-top: 0; }
    .obs-index-line { margin: 2px 0 0 10px; font-size: 0.85rem; line-height: 1.4; }
    .obs-index-blank { margin: 4px 0 8px 20px; color: #999; font-size: 0.8rem; }
    .obs-index-notes { margin: 6px 0 4px 10px; font-size: 0.8rem; color: #555; line-height: 1.35; }
    .obs-cat { color: #64748b; font-size: 0.9em; }
    .planning-table-page { padding: 8px 0; }
    .planning-table-title { font-size: 1rem; margin: 0 0 8px; color: ${accentColor}; }
    .planning-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
    .planning-table th, .planning-table td { border: 1px solid #ccc; padding: 4px 8px; text-align: left; vertical-align: top; }
    .planning-table th { background: #f0f0f0; font-weight: 600; }
    .planning-date-cell { white-space: nowrap; width: 1%; }
    .planning-selections-cell { max-width: 200px; }
    .planning-notes-cell { font-size: 0.75rem; white-space: pre-wrap; max-width: 240px; }
    .planning-table-blank { margin: 8px 0 0; font-size: 0.8rem; color: #999; }
    @media print {
      body { padding: 6px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .cal-page { height: 11in; min-height: 11in; max-height: 11in; box-sizing: border-box; overflow: hidden; }
      .cal-scaled { transform: scale(0.67); transform-origin: top left; width: 149.25%; height: 149.25%; position: absolute; top: 0; left: 0; }
      .cal-grid { flex: 1; min-height: 0; }
      .cal-cell { min-height: 0; }
      .obs-index-day { break-after: avoid; }
    }
  </style>
</head>
<body class="${bodyClass}">
  <div class="print-pack-page cal-page">
    <div class="cal-scaled">
      <h1 style="margin: 0 0 8px; font-size: 1.1rem; color: ${accentColor};">${escapeHtml(monthName)} ${year} — Calendar</h1>
      <div class="cal-header">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>
      <div class="cal-grid">${dayCells.join('')}</div>
    </div>
  </div>
  ${observancesIndexPages}
  ${planningPage}
  <script>
    window.onload = function() { window.print(); };
    window.onafterprint = function() { window.close(); };
  <\/script>
</body>
</html>`;
}
