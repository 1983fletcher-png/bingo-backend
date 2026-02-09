import type { TriviaQuestionModel } from '../../lib/models';

/** Get the correct-answer display text for host/display when revealed (mc/tf: option text; short: primary). */
export function getAnswerDisplayText(q: TriviaQuestionModel | null): string {
  if (!q?.answer) return '';
  const ans = q.answer as unknown as Record<string, unknown>;
  if (ans.options && Array.isArray(ans.options) && typeof ans.correct === 'string') {
    const opt = (ans.options as { id: string; text: string }[]).find((o) => o.id === ans.correct);
    return opt?.text ?? String(ans.correct);
  }
  if (typeof ans.primary === 'string') return ans.primary;
  if (q.type === 'tf' && (ans.correct === 'true' || ans.correct === 'false')) return ans.correct === 'true' ? 'True' : 'False';
  return String(ans.correct ?? '');
}
