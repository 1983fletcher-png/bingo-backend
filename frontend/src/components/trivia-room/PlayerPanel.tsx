/**
 * Trivia Room — Player panel: question, MC/TF/short-answer/list, wager, timer, leaderboard.
 * Players can change their answer until the host reveals (no lock until REVEAL).
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Socket } from 'socket.io-client';
import type { RoomModel, PlayerModel, TriviaQuestionModel } from '../../lib/models';
import { QuestionCard } from './QuestionCard';
import { AnswerCard } from './AnswerCard';
import { TimerPill } from './TimerPill';
import { LeaderboardList } from './LeaderboardList';

export interface RoomPlayerPanelProps {
  room: RoomModel;
  currentQuestion: TriviaQuestionModel | null;
  pack?: { title?: string; questions?: unknown[]; finalWagerEnabled?: boolean };
  socket: Socket | null;
  roomId: string;
  leaderboardTop: PlayerModel[];
  /** Current player's ID (from stored identity when joined this room). */
  playerId: string | undefined;
}

const TF_OPTIONS = [
  { id: 'true', text: 'True' },
  { id: 'false', text: 'False' },
] as const;

export function RoomPlayerPanel({
  room,
  currentQuestion,
  pack,
  socket,
  roomId,
  leaderboardTop,
  playerId,
}: RoomPlayerPanelProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [shortAnswer, setShortAnswer] = useState('');
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [wager, setWager] = useState<number>(0);

  const totalQuestions = pack?.questions?.length ?? 0;
  const currentIndex = room.runtime.currentQuestionIndex ?? 0;
  const isLastQuestion = totalQuestions > 0 && currentIndex === totalQuestions - 1;
  const finalWagerEnabled = Boolean(pack?.finalWagerEnabled);
  const wagerCap = 10;
  const canChangeAnswer = room.state === 'ACTIVE_ROUND';

  useEffect(() => {
    setSelectedOption(null);
    setShortAnswer('');
    setOrderedIds([]);
    setWager(0);
  }, [currentQuestion?.id]);

  useEffect(() => {
    if (currentQuestion?.type === 'list' && currentQuestion.answer && 'acceptedItems' in currentQuestion.answer) {
      const items = (currentQuestion.answer as { acceptedItems?: string[] }).acceptedItems ?? [];
      const shuffled = [...items].sort(() => Math.random() - 0.5);
      setOrderedIds(shuffled);
    }
  }, [currentQuestion?.id, currentQuestion?.type, currentQuestion?.answer]);

  const submitOption = (optionId: string) => {
    if (!socket?.connected || !playerId || !currentQuestion || !canChangeAnswer) return;
    setSelectedOption(optionId);
    const payload: { optionId: string; wager?: number } = { optionId };
    if (isLastQuestion && finalWagerEnabled && wager > 0) payload.wager = Math.min(wager, wagerCap);
    socket.emit('room:submit-response', {
      roomId,
      questionId: currentQuestion.id,
      playerId,
      payload,
    });
  };

  const submitShortAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket?.connected || !playerId || !currentQuestion || !canChangeAnswer) return;
    const text = shortAnswer.trim();
    if (!text) return;
    const payload: { text: string; wager?: number } = { text };
    if (isLastQuestion && finalWagerEnabled && wager > 0) payload.wager = Math.min(wager, wagerCap);
    socket.emit('room:submit-response', {
      roomId,
      questionId: currentQuestion.id,
      playerId,
      payload,
    });
  };

  const moveListItem = (index: number, direction: 'up' | 'down') => {
    const next = [...orderedIds];
    const j = direction === 'up' ? index - 1 : index + 1;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setOrderedIds(next);
  };

  const submitListOrder = () => {
    if (!socket?.connected || !playerId || !currentQuestion || !canChangeAnswer) return;
    socket.emit('room:submit-response', {
      roomId,
      questionId: currentQuestion.id,
      playerId,
      payload: { orderedIds: [...orderedIds] },
    });
  };

  const options = currentQuestion?.type === 'mc' && currentQuestion.answer && 'options' in currentQuestion.answer
    ? (currentQuestion.answer.options || [])
    : [];
  const isTf = currentQuestion?.type === 'tf';
  const hasShortAnswer = room.state === 'ACTIVE_ROUND' && currentQuestion && !isTf && options.length === 0 && currentQuestion.type !== 'list';
  const isList = currentQuestion?.type === 'list';
  const listItems = isList && currentQuestion?.answer && 'acceptedItems' in currentQuestion.answer
    ? (currentQuestion.answer as { acceptedItems?: string[] }).acceptedItems ?? []
    : [];
  const labels = ['A', 'B', 'C', 'D'];
  const showLeaderboard = room.settings?.leaderboardsVisibleToPlayers !== false && leaderboardTop.length > 0;

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto', minHeight: '100vh' }}>
      <p style={{ margin: '0 0 16px', fontSize: 14 }}>
        <Link to="/">Leave room</Link>
      </p>
      <div style={{ marginBottom: 16, fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span>{pack?.title || 'Trivia'} · {room.state} · Q{room.runtime.currentQuestionIndex + 1}</span>
        {room.state === 'ACTIVE_ROUND' && (room.runtime.timeLimitSec ?? currentQuestion?.timeLimitSec) != null && (
          <TimerPill
            questionStartAt={room.runtime.questionStartAt}
            timeLimitSec={room.runtime.timeLimitSec ?? currentQuestion?.timeLimitSec}
            active={room.state === 'ACTIVE_ROUND'}
          />
        )}
      </div>
      {room.state === 'WAITING_ROOM' || room.state === 'READY_CHECK' ? (
        <p style={{ fontSize: 18 }}>Waiting for host to start the round…</p>
      ) : currentQuestion ? (
        <>
          <QuestionCard question={currentQuestion} size="normal" />
          {room.state === 'ACTIVE_ROUND' && isLastQuestion && finalWagerEnabled && (
            <div style={{ marginTop: 16, padding: 12, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <label style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>Final wager (optional, max {wagerCap} pts)</label>
              <input
                type="number"
                min={0}
                max={wagerCap}
                value={wager || ''}
                onChange={(e) => setWager(Math.max(0, Math.min(wagerCap, parseInt(e.target.value, 10) || 0)))}
                className="join-page__input"
                style={{ width: 80, marginBottom: 0 }}
                placeholder="0"
              />
            </div>
          )}
          {room.state === 'ACTIVE_ROUND' && options.length > 0 && !isTf && (
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 8px' }}>Tap to choose (you can change until reveal).</p>
              {options.map((opt, i) => (
                <AnswerCard
                  key={opt.id}
                  option={opt}
                  label={labels[i] ?? opt.id}
                  selected={selectedOption === opt.id}
                  locked={!canChangeAnswer}
                  onTap={() => submitOption(opt.id)}
                  disabled={!canChangeAnswer}
                  size="compact"
                />
              ))}
            </div>
          )}
          {room.state === 'ACTIVE_ROUND' && isTf && (
            <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <p style={{ width: '100%', fontSize: 13, color: 'var(--text-muted)', margin: '0 0 8px' }}>Tap True or False (you can change until reveal).</p>
              {TF_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="join-page__btn"
                  style={{
                    flex: 1,
                    minWidth: 120,
                    padding: 16,
                    fontSize: 18,
                    fontWeight: 700,
                    background: selectedOption === opt.id ? 'var(--accent)' : 'var(--surface)',
                    color: selectedOption === opt.id ? '#fff' : 'var(--text)',
                    border: selectedOption === opt.id ? '2px solid var(--accent)' : '2px solid var(--border)',
                  }}
                  disabled={!canChangeAnswer}
                  onClick={() => submitOption(opt.id)}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          )}
          {room.state === 'ACTIVE_ROUND' && isList && listItems.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 12px' }}>Tap ↑/↓ to reorder (correct order wins).</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {orderedIds.map((id, i) => (
                  <div
                    key={`${id}-${i}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 12px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--text-muted)', minWidth: 24 }}>{i + 1}.</span>
                    <span style={{ flex: 1 }}>{id}</span>
                    <button
                      type="button"
                      aria-label="Move up"
                      disabled={!canChangeAnswer || i === 0}
                      onClick={() => moveListItem(i, 'up')}
                      style={{ padding: '6px 10px', fontSize: 14, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg)', cursor: canChangeAnswer && i > 0 ? 'pointer' : 'not-allowed' }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      disabled={!canChangeAnswer || i === orderedIds.length - 1}
                      onClick={() => moveListItem(i, 'down')}
                      style={{ padding: '6px 10px', fontSize: 14, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg)', cursor: canChangeAnswer && i < orderedIds.length - 1 ? 'pointer' : 'not-allowed' }}
                    >
                      ↓
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="join-page__btn" disabled={!canChangeAnswer || !socket?.connected} onClick={submitListOrder}>
                Submit order
              </button>
            </div>
          )}
          {hasShortAnswer && (
            <form onSubmit={submitShortAnswer} style={{ marginTop: 20 }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 8px' }}>You can change and resubmit until reveal.</p>
              <input
                type="text"
                placeholder="Your answer"
                value={shortAnswer}
                onChange={(e) => setShortAnswer(e.target.value)}
                className="join-page__input"
                style={{ marginBottom: 12, width: '100%', maxWidth: 400 }}
                autoComplete="off"
                disabled={!canChangeAnswer}
              />
              <button type="submit" className="join-page__btn" disabled={!canChangeAnswer || !shortAnswer.trim() || !socket?.connected}>
                Submit answer
              </button>
            </form>
          )}
          {room.state === 'REVEAL' && (
            <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Answer revealed. Next question soon.</p>
          )}
        </>
      ) : (
        <p style={{ color: 'var(--text-muted)' }}>No question right now.</p>
      )}
      {showLeaderboard && (
        <div style={{ marginTop: 24 }}>
          <LeaderboardList players={leaderboardTop} limit={10} showPercentage />
        </div>
      )}
    </div>
  );
}
