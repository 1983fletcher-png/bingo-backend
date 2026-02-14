/**
 * Crowd Control Trivia — host panel: board grid, category vote, question modal.
 */
import { useState, useEffect, useRef, type MutableRefObject } from 'react';
import type { Socket } from 'socket.io-client';
import type { CrowdControlState } from '../types/crowdControlTrivia';
import { VALUE_LADDER, getBoard, getQuestion } from '../data/crowdControlTriviaDataset';
import './CrowdControlHostPanel.css';

export type HostKeyboardRef = MutableRefObject<{ forward?: () => void; back?: () => void } | null>;

export interface CrowdControlHostPanelProps {
  gameCode: string;
  hostToken: string | null;
  crowdControl: CrowdControlState;
  socket: Socket | null;
  joinUrl: string;
  displayUrl: string;
  onEndSession: () => void;
  hostKeyboardRef?: HostKeyboardRef | null;
}

const HOST_TOKEN_KEY = (code: string) => `playroom:hostToken:${code}`;

export function CrowdControlHostPanel({
  gameCode,
  hostToken: hostTokenProp,
  crowdControl,
  socket,
  joinUrl,
  displayUrl,
  onEndSession,
  hostKeyboardRef
}: CrowdControlHostPanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const hostToken =
    hostTokenProp ?? (typeof localStorage !== 'undefined' ? localStorage.getItem(HOST_TOKEN_KEY(gameCode)) : null);

  const board = getBoard(crowdControl.boardId ?? 0);
  const categories = board?.categories ?? [];
  const usedSlots = crowdControl.usedSlots ?? [0, 0, 0, 0, 0, 0];
  const phase = crowdControl.phase ?? 'board';
  const voteCounts = crowdControl.voteCounts ?? [0, 0, 0, 0, 0, 0];
  const currentQuestionId = crowdControl.currentQuestionId ?? null;
  const revealed = crowdControl.revealed === true;
  const question = getQuestion(currentQuestionId);
  const valueIndex = crowdControl.currentValueIndex ?? 0;
  const points = VALUE_LADDER[valueIndex] ?? 100;
  const lastSentQuestionId = useRef<string | null>(null);

  useEffect(() => {
    if (!hostKeyboardRef) return;
    const forward = () => {
      if (phase === 'vote') lockVote();
      else if ((phase === 'question' || phase === 'reveal') && !revealed) reveal();
    };
    const back = () => {
      if (phase === 'question' || phase === 'reveal') backToBoard();
    };
    hostKeyboardRef.current = { forward, back };
    return () => {
      hostKeyboardRef.current = null;
    };
  }, [hostKeyboardRef, phase, revealed]);

  useEffect(() => {
    if (phase !== 'question' || !currentQuestionId || !question || !socket || !gameCode || !hostToken) return;
    if (lastSentQuestionId.current === currentQuestionId) return;
    lastSentQuestionId.current = currentQuestionId;
    socket.emit('cct:question-details', {
      code: gameCode,
      hostToken,
      correctAnswer: question.correctAnswer,
      points,
      options: question.options ?? undefined
    });
  }, [phase, currentQuestionId, question, socket, gameCode, hostToken]);

  const openVote = () => {
    if (socket && gameCode && hostToken) {
      socket.emit('cct:open-vote', { code: gameCode, hostToken });
    }
  };

  const lockVote = () => {
    if (socket && gameCode && hostToken) {
      socket.emit('cct:lock-vote', { code: gameCode, hostToken });
      setModalOpen(true);
    }
  };

  const reveal = () => {
    if (socket && gameCode && hostToken) {
      socket.emit('cct:reveal', { code: gameCode, hostToken });
    }
  };

  const backToBoard = () => {
    if (socket && gameCode && hostToken) {
      lastSentQuestionId.current = null;
      socket.emit('cct:back-to-board', { code: gameCode, hostToken });
      setModalOpen(false);
    }
  };

  const isVoting = phase === 'vote';
  const isQuestion = phase === 'question' || phase === 'reveal';

  return (
    <div className="host-room__panel" style={{ padding: 24 }}>
      {/* Board: same Jeopardy layout as TV display — category left, $100–$500 columns */}
      {board && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 18 }}>{board.name}</h3>
          <div className="cct-host-board">
            <div className="cct-host-board__head" aria-hidden="true">
              <div className="cct-host-board__head-cell cct-host-board__head-cell--category">Category</div>
              {VALUE_LADDER.map((v) => (
                <div key={v} className="cct-host-board__head-cell">${v}</div>
              ))}
            </div>
            {categories.map((cat, ci) => (
              <div key={ci} className="cct-host-board__row">
                <div className="cct-host-board__category">{cat}</div>
                {VALUE_LADDER.map((_, vi) => {
                  const used = (usedSlots[ci] ?? 0) > vi;
                  const isCurrent =
                    isQuestion &&
                    crowdControl.winningCategoryIndex === ci &&
                    crowdControl.currentValueIndex === vi;
                  return (
                    <div
                      key={vi}
                      className={`cct-host-board__tile ${used ? 'cct-host-board__tile--used' : ''} ${isCurrent ? 'cct-host-board__tile--current' : ''}`}
                    >
                      {used ? (isCurrent ? '▶' : '✓') : '—'}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vote / Lock controls */}
      {phase === 'board' && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <button type="button" className="host-room__start-btn" onClick={openVote}>
            Open category vote
          </button>
        </div>
      )}
      {isVoting && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ margin: '0 0 8px', fontSize: 14 }}>Players are voting. Vote counts:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {categories.map((cat, i) => (
              <span key={i} style={{ padding: '6px 12px', background: 'var(--surface2)', borderRadius: 6, fontSize: 13 }}>
                {cat}: <strong>{voteCounts[i] ?? 0}</strong>
              </span>
            ))}
          </div>
          <button type="button" className="host-room__start-btn" onClick={lockVote}>
            Lock vote & show question
          </button>
        </div>
      )}

      {/* Question modal */}
      {(isQuestion || modalOpen) && question && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 24
          }}
          onClick={(e) => e.target === e.currentTarget && revealed && backToBoard()}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{
              background: 'var(--bg)',
              borderRadius: 12,
              border: '1px solid var(--border)',
              maxWidth: 520,
              width: '100%',
              padding: 24,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: 20 }}>{question.prompt}</h3>
            {!revealed && (
              <>
                {question.options && question.options.length > 0 && (
                  <ul style={{ margin: '0 0 16px', paddingLeft: 20 }}>
                    {question.options.map((opt, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>
                        {opt}
                      </li>
                    ))}
                  </ul>
                )}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" className="host-room__start-btn" onClick={reveal}>
                    Reveal answer
                  </button>
                  <button type="button" className="host-room__btn-secondary" onClick={backToBoard}>
                    Skip (back to board)
                  </button>
                </div>
              </>
            )}
            {revealed && (
              <>
                <p style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600, color: 'var(--accent)' }}>
                  {question.correctAnswer}
                </p>
                {question.explanation && (
                  <p style={{ margin: '0 0 8px', fontSize: 14, color: 'var(--text-muted)' }}>
                    {question.explanation}
                  </p>
                )}
                {question.citation && (
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{question.citation}</p>
                )}
                <button
                  type="button"
                  className="host-room__start-btn"
                  style={{ marginTop: 16 }}
                  onClick={backToBoard}
                >
                  Back to board
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
        Share the join link with players; open Display on the TV.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <a href={joinUrl} target="_blank" rel="noopener noreferrer" className="host-room__link-btn">
          Player link
        </a>
        <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="host-room__link-btn">
          Display (TV)
        </a>
        <button type="button" onClick={onEndSession} className="host-room__btn-secondary">
          End session
        </button>
      </div>
    </div>
  );
}
