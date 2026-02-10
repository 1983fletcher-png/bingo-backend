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

/** Calendar print pack: 3 sheets. Page 1 = full-page calendar (landscape). Page 2 = observances list (portrait). Page 3 = planning & notes (portrait). */
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
  const { printStyle = 'neutral', observancesIndex = [] } = options;

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

  // Page 2: Single observances page — all days, clearly labeled. One table so it fits on one portrait sheet.
  const observancesRows = observancesIndex.map(
    (dayBlock) =>
      `<tr>
        <td class="obs-table-date">${escapeHtml(monthName)} ${dayBlock.day}</td>
        <td class="obs-table-observances">${dayBlock.observances.map((o) => escapeHtml(o.name)).join(', ')}</td>
        <td class="obs-table-notes"></td>
      </tr>`
  );
  const observancesPage =
    `<div class="print-pack-page observances-index-page">
    <h2 class="observances-index-title">This month's observances — ${escapeHtml(monthName)} ${year}</h2>
    <p class="observances-index-sub">Use for planning and post-event notes. Discuss in meetings and brainstorm ideas. Write notes in the right column.</p>
    <table class="obs-table">
      <thead><tr><th>Date</th><th>Observances</th><th>Notes</th></tr></thead>
      <tbody>${observancesRows.join('')}</tbody>
    </table>
  </div>`;

  // Page 3: Planning & notes — always included so we have exactly 3 pages and no blank sheet.
  const planningRows =
    planningDays.length > 0
      ? planningDays.map(
          (p) => `
        <tr>
          <td class="planning-date-cell">${escapeHtml(p.dateLabel)}</td>
          <td class="planning-selections-cell">${(p.selectedNames.length ? p.selectedNames : ['—']).map((n) => escapeHtml(n)).join(', ')}</td>
          <td class="planning-notes-cell">${p.noteText ? escapeHtml(p.noteText) : '—'}</td>
        </tr>`
        ).join('')
      : `<tr><td colspan="3" class="planning-empty">Add selections and notes in the app, then reprint. Use the lines below for meeting notes.</td></tr>`;

  const planningPage = `
  <div class="print-pack-page planning-table-page">
    <h2 class="planning-table-title">Planning & post-event notes — ${escapeHtml(monthName)} ${year}</h2>
    <p class="planning-table-sub">Selected observances and space for meeting notes and follow-up.</p>
    <table class="planning-table">
      <thead><tr><th>Date</th><th>Selected observances</th><th>Notes</th></tr></thead>
      <tbody>${planningRows}</tbody>
    </table>
    <p class="planning-table-blank">Meeting / planning notes: _________________________________________</p>
    <p class="planning-table-blank">_________________________________________</p>
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
    body { font-family: system-ui, sans-serif; margin: 0; padding: 0; font-size: 13px; color: #111; }
    body.print-style-bw { color: #111; }
    body.print-style-neutral { color: #334155; }
    body.print-style-fun { color: #1e1b4b; }
    .print-pack-page { page-break-after: always; }
    .print-pack-page:last-child { page-break-after: auto; }

    /* Page 1: Full-page calendar (landscape). Maximize grid on first sheet. */
    .cal-page { display: flex; flex-direction: column; padding: 0.15in 0.2in; box-sizing: border-box; min-height: 100vh; }
    .cal-page-title { margin: 0 0 0.08in; font-size: 0.8rem; font-weight: 700; color: ${accentColor}; flex-shrink: 0; }
    .cal-header-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 2px; text-align: center; font-weight: 600; font-size: 0.65rem; color: ${accentColor}; flex-shrink: 0; }
    .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); grid-template-rows: repeat(6, 1fr); gap: 2px; flex: 1; min-height: 0; }
    .cal-cell { border: 1px solid ${borderColor}; padding: 2px; min-height: 0; background: ${calCellBg}; display: flex; flex-direction: column; font-size: 0.55rem; }
    .cal-cell--empty { border-color: #ccc; background: #f5f5f5; }
    .cal-day-num { font-weight: 700; font-size: 0.75rem; margin-bottom: 0; color: ${accentColor}; flex-shrink: 0; }
    .cal-primary { font-size: 0.52rem; color: #333; line-height: 1.15; flex: 1; overflow: hidden; min-height: 0; }
    .cal-blank { flex: 1; min-height: 1px; }

    /* Page 2: This month's observances — for planning & post-event notes. */
    .observances-index-page { padding: 0.4in; }
    .observances-index-title { font-size: 1rem; margin: 0 0 4px; color: ${accentColor}; }
    .observances-index-sub { font-size: 0.8rem; color: #555; margin: 0 0 10px; }
    .obs-table { width: 100%; border-collapse: collapse; font-size: 9px; }
    .obs-table th, .obs-table td { border: 1px solid #ccc; padding: 3px 6px; text-align: left; vertical-align: top; }
    .obs-table th { background: #f0f0f0; font-weight: 600; }
    .obs-table-date { white-space: nowrap; width: 0.9in; }
    .obs-table-observances { min-width: 2.2in; }
    .obs-table-notes { min-width: 1.8in; min-height: 1em; }

    /* Page 3: Planning & post-event notes (portrait). */
    .planning-table-page { padding: 0.4in; }
    .planning-table-title { font-size: 1rem; margin: 0 0 4px; color: ${accentColor}; }
    .planning-table-sub { font-size: 0.8rem; color: #555; margin: 0 0 8px; }
    .planning-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
    .planning-table th, .planning-table td { border: 1px solid #ccc; padding: 4px 8px; text-align: left; vertical-align: top; }
    .planning-table th { background: #f0f0f0; font-weight: 600; }
    .planning-date-cell { white-space: nowrap; width: 1%; }
    .planning-selections-cell { max-width: 200px; }
    .planning-notes-cell { font-size: 0.75rem; white-space: pre-wrap; max-width: 240px; }
    .planning-empty { font-size: 0.85rem; color: #666; font-style: italic; }
    .planning-table-blank { margin: 8px 0 0; font-size: 0.8rem; color: #999; }

    @media print {
      @page { size: portrait; }
      @page :first { size: landscape; }
      body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .cal-page { width: 11in; height: 8.5in; margin: 0; padding: 0.12in 0.18in; min-height: 8.5in; height: 8.5in; }
      .cal-grid { flex: 1; min-height: 0; }
      .cal-cell { min-height: 0; }
    }
  </style>
</head>
<body class="${bodyClass}">
  <div class="print-pack-page cal-page">
    <h1 class="cal-page-title">${escapeHtml(monthName)} ${year}</h1>
    <div class="cal-header-row">
      <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
    </div>
    <div class="cal-grid">${dayCells.join('')}</div>
  </div>
  ${observancesPage}
  ${planningPage}
  <script>
    window.onload = function() { window.print(); };
    window.onafterprint = function() { window.close(); };
  <\/script>
</body>
</html>`;
}
