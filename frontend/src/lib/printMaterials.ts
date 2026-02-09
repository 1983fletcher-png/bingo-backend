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

/** Calendar print pack: page 1 = big grid, pages 2+ = planning sheets for days with selections/notes. */
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

export function buildCalendarPrintPack(
  year: number,
  _month: number,
  monthName: string,
  daysInMonth: number,
  startWeekday: number,
  gridDays: CalendarPrintDay[],
  planningDays: CalendarPlanningDay[]
): string {
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

  const planningPages =
    planningDays.length === 0
      ? ''
      : planningDays
          .map(
            (p) => `
    <div class="planning-sheet">
      <h2 class="planning-date">${escapeHtml(p.dateLabel)}</h2>
      <div class="planning-section">
        <strong>Selected observances</strong>
        <ul>${(p.selectedNames.length ? p.selectedNames : ['(none)']).map((n) => `<li>${escapeHtml(n)}</li>`).join('')}</ul>
      </div>
      <div class="planning-section">
        <strong>Notes</strong>
        <p class="planning-notes">${p.noteText ? escapeHtml(p.noteText) : '(none)'}</p>
      </div>
      <div class="planning-section planning-blank">
        <strong>Meeting notes</strong>
        <p class="blank-lines">_________________________________________</p>
        <p class="blank-lines">_________________________________________</p>
        <p class="blank-lines">_________________________________________</p>
        <p class="blank-lines">_________________________________________</p>
      </div>
    </div>`
          )
          .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(monthName)} ${year} — Activity Calendar</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 16px; font-size: 14px; color: #111; }
    .print-pack-page { page-break-after: always; }
    .print-pack-page:last-child { page-break-after: auto; }
    .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; min-height: 90vh; }
    .cal-cell { border: 1px solid #333; padding: 10px; min-height: 100px; }
    .cal-cell--empty { border-color: #ccc; background: #f9f9f9; }
    .cal-day-num { font-weight: 700; font-size: 1.1rem; margin-bottom: 4px; }
    .cal-primary { font-size: 0.75rem; color: #333; }
    .cal-blank { flex: 1; min-height: 40px; }
    .cal-header { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-bottom: 6px; text-align: center; font-weight: 600; font-size: 0.9rem; }
    .planning-sheet { padding: 16px 0; page-break-before: always; page-break-inside: avoid; }
.planning-sheet:first-of-type { page-break-before: auto; }
    .planning-date { font-size: 1.1rem; margin: 0 0 12px; }
    .planning-section { margin-bottom: 16px; }
    .planning-notes { white-space: pre-wrap; margin: 4px 0 0; }
    .planning-blank .blank-lines { margin: 4px 0; color: #999; }
    @media print {
      body { padding: 8px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .cal-grid { min-height: 80vh; }
      .cal-cell { min-height: 90px; }
    }
  </style>
</head>
<body>
  <div class="print-pack-page">
    <h1 style="margin: 0 0 12px; font-size: 1.25rem;">${escapeHtml(monthName)} ${year} — Calendar</h1>
    <div class="cal-header">
      <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
    </div>
    <div class="cal-grid">${dayCells.join('')}</div>
  </div>
  ${planningPages ? `<div class="print-pack-page">${planningPages}</div>` : ''}
</body>
</html>`;
}
