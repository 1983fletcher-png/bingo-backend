/**
 * Crowd Control Trivia display — game-show stage: 6 subjects on top, tiles 100–500.
 * Board and question/reveal views use SurveyShowdownStage (marquee, shiny floor, panels).
 */
import type { CrowdControlState } from '../types/crowdControlTrivia';
import { getBoard, getQuestion, VALUE_LADDER } from '../data/crowdControlTriviaDataset';
import { SurveyShowdownStage } from '../games/feud/SurveyShowdownStage';
import './DisplayCrowdControl.css';

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
  const winningCategoryIndex = state?.winningCategoryIndex ?? null;
  const currentValueIndex = state?.currentValueIndex ?? null;

  if (isQuestion && question) {
    return (
      <SurveyShowdownStage variant="tv" contentSlot={
        <div className="cct-question-block">
          <h2 className="cct-question-prompt">{question.prompt}</h2>
          {!revealed && question.options && question.options.length > 0 && (
            <ul className="cct-question-options">
              {question.options.map((opt, i) => (
                <li key={i} className="cct-question-option">{opt}</li>
              ))}
            </ul>
          )}
          {!revealed && <p className="cct-question-muted">Answer on your phone — host will reveal.</p>}
          {revealed && (
            <div className="cct-reveal-answer">
              <p className="cct-reveal-answer-text">{question.correctAnswer}</p>
              {question.explanation && (
                <p className="cct-reveal-explanation">{question.explanation}</p>
              )}
            </div>
          )}
        </div>
      } />
    );
  }

  if (board) {
    const categories = board.categories ?? [];
    return (
      <SurveyShowdownStage
        variant="tv"
        contentSlot={
          <div className="cct-stage-wrap">
            {/* Categories across top (golden header), values 100–500 down the left */}
            <div className="cct-board">
              {/* Header row: corner + 6 category names */}
              <div className="cct-board-head" aria-hidden="true">
                <div className="cct-board-head-cell cct-board-head-cell--corner"> </div>
                {categories.slice(0, 6).map((cat, ci) => (
                  <div key={ci} className="cct-board-head-cell cct-board-head-cell--category">{cat}</div>
                ))}
              </div>
              {/* One row per value: $100, $200, … down the left, then 6 tiles (one per category) */}
              {VALUE_LADDER.map((value, vi) => (
                <div key={vi} className="cct-board-row">
                  <div className="cct-board-value">{value}</div>
                  {categories.slice(0, 6).map((_, ci) => {
                    const used = (usedSlots[ci] ?? 0) > vi;
                    const current =
                      phase !== 'board' &&
                      winningCategoryIndex === ci &&
                      currentValueIndex === vi;
                    return (
                      <div
                        key={ci}
                        className={`cct-tile ${used ? 'cct-tile--used' : ''} ${current ? 'cct-tile--current' : ''}`}
                      >
                        {used ? (current ? '▶' : '✓') : value}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            {phase === 'vote' && (
              <p className="cct-vote-prompt">Pick the next category on your phone!</p>
            )}
          </div>
        }
      />
    );
  }

  return (
    <SurveyShowdownStage
      variant="tv"
      contentSlot={
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--pr-muted)' }}>
          Board loading…
        </div>
      }
    />
  );
}
