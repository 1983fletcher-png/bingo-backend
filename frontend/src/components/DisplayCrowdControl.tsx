/**
 * Crowd Control Trivia display — Jeopardy-style board (categories × values) and question/reveal view.
 * Use inside GameShell mainSlot for /display/:code when gameType is crowd-control-trivia.
 */
import React from 'react';
import type { CrowdControlState } from '../types/crowdControlTrivia';
import { getBoard, getQuestion, VALUE_LADDER } from '../data/crowdControlTriviaDataset';

export interface DisplayCrowdControlProps {
  state: CrowdControlState | null;
}

export function DisplayCrowdControl({ state }: DisplayCrowdControlProps) {
  const board = state ? getBoard(state.boardId ?? 0) : null;
  const phase = state?.phase ?? 'board';
  const question = getQuestion(state?.currentQuestionId ?? null);
  const isQuestion = phase === 'question' || phase === 'reveal';
  const revealed = state?.revealed === true;
  const usedSlots = state?.usedSlots ?? [0, 0, 0, 0, 0, 0];

  if (isQuestion && question) {
    return (
      <div style={{ padding: 32, textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ margin: '0 0 24px', fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: 600, color: 'var(--pr-text)' }}>
          {question.prompt}
        </h2>
        {!revealed && question.options && question.options.length > 0 && (
          <ul style={{ margin: '0 0 24px', paddingLeft: 24, textAlign: 'left', display: 'inline-block' }}>
            {question.options.map((opt, i) => (
              <li key={i} style={{ marginBottom: 8, fontSize: 18 }}>{opt}</li>
            ))}
          </ul>
        )}
        {!revealed && <p style={{ color: 'var(--pr-muted)' }}>Answer on your phone — host will reveal.</p>}
        {revealed && (
          <div style={{ marginTop: 24, padding: '20px 24px', background: 'var(--pr-surface2)', borderRadius: 12, display: 'inline-block' }}>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--pr-brand)' }}>{question.correctAnswer}</p>
            {question.explanation && (
              <p style={{ margin: '12px 0 0', fontSize: 16, color: 'var(--pr-muted)' }}>{question.explanation}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  if (board) {
    return (
      <div style={{ padding: 24, overflow: 'auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `minmax(120px, 1fr) repeat(${VALUE_LADDER.length}, minmax(72px, 1fr))`,
            gap: 8,
            background: 'var(--pr-surface2)',
            padding: 16,
            borderRadius: 12,
            border: '1px solid var(--pr-border)',
            maxWidth: 800,
            margin: '0 auto',
          }}
        >
          <div style={{ padding: 12, fontWeight: 600, fontSize: 14, color: 'var(--pr-muted)' }}>Category</div>
          {VALUE_LADDER.map((v) => (
            <div key={v} style={{ padding: 12, fontWeight: 600, fontSize: 14, textAlign: 'center', color: 'var(--pr-muted)' }}>${v}</div>
          ))}
          {(board.categories ?? []).map((cat, ci) => {
            const used = usedSlots[ci] ?? 0;
            return (
              <React.Fragment key={ci}>
                <div style={{ padding: 12, fontSize: 14, fontWeight: 500 }}>{cat}</div>
                {VALUE_LADDER.map((_, vi) => {
                  const usedCell = used > vi;
                  return (
                    <div
                      key={vi}
                      style={{
                        padding: 12,
                        textAlign: 'center',
                        fontSize: 14,
                        background: usedCell ? 'var(--pr-surface)' : 'transparent',
                        color: usedCell ? 'var(--pr-muted)' : 'var(--pr-text)',
                        borderRadius: 6,
                      }}
                    >
                      {usedCell ? '✓' : '$' + VALUE_LADDER[vi]}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
        {phase === 'vote' && (
          <p style={{ marginTop: 16, textAlign: 'center', color: 'var(--pr-muted)' }}>Pick the next category on your phone!</p>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: 48, textAlign: 'center', color: 'var(--pr-muted)' }}>Board loading…</div>
  );
}
