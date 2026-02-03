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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(t)} — Quiz</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 16px; font-size: 14px; color: #111; max-width: 700px; margin: 0 auto; padding: 16px; }
    h1 { font-size: 18px; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; }
    .num { width: 28px; vertical-align: top; padding: 8px 4px 8px 0; }
    .q { padding: 8px 0; }
    .line { width: 200px; padding-left: 12px; color: #666; }
    @media print { body { padding: 12px; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(t)}</h1>
  <p style="color:#666; font-size: 12px;">Name: _________________________ &nbsp; Date: _________</p>
  <table>
    ${items}
  </table>
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
      <div class="back"><span class="card-num">${i + 1}</span> ${escapeHtml(q.correctAnswer)}</div>
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
