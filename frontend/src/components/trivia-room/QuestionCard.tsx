/**
 * Shared QuestionCard — big question text, optional media.
 * Used by Host, Player, and Display panels.
 */
import type { TriviaQuestionModel } from '../../lib/models';

export interface QuestionCardProps {
  question: TriviaQuestionModel | null;
  /** Scale for display vs player (e.g. "display" = larger) */
  size?: 'compact' | 'normal' | 'display';
  className?: string;
}

const sizeStyles = {
  compact: { fontSize: 18, padding: 12 },
  normal: { fontSize: 20, padding: 16 },
  display: { fontSize: 'clamp(24px, 4vw, 48px)', padding: 24 },
};

export function QuestionCard({ question, size = 'normal', className = '' }: QuestionCardProps) {
  if (!question) return null;
  const style = sizeStyles[size];
  return (
    <div
      className={className}
      style={{
        padding: style.padding,
        background: 'var(--surface)',
        borderRadius: 12,
        border: '1px solid var(--border)',
      }}
    >
      <p style={{ margin: 0, fontWeight: 600, lineHeight: 1.4, fontSize: style.fontSize }}>
        {question.prompt}
      </p>
      {question.media?.kind === 'image' && question.media.url && (
        <div style={{ marginTop: 16 }}>
          <img src={question.media.url} alt="" style={{ maxWidth: '100%', borderRadius: 8 }} />
        </div>
      )}
      {question.media?.kind === 'audio' && question.media.url && (
        <div style={{ marginTop: 16 }}>
          <audio src={question.media.url} controls style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
}
