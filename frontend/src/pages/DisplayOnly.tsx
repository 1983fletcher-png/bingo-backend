/**
 * Display-only trivia — automated loop: question → timer → answer → fun fact.
 * No join, no host. Loads pack by id and cycles through questions.
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPack } from '../data/triviaRoomPacks';
import { QuestionCard, TimerPill } from '../components/trivia-room';
import type { TriviaQuestionModel } from '../lib/models';

type Phase = 'question' | 'reveal';

function getAnswerDisplayText(q: TriviaQuestionModel | null): string {
  if (!q?.answer) return '';
  const ans = q.answer as unknown as Record<string, unknown>;
  if (ans.options && Array.isArray(ans.options) && typeof ans.correct === 'string') {
    const opt = (ans.options as { id: string; text: string }[]).find((o) => o.id === ans.correct);
    return opt?.text ?? String(ans.correct);
  }
  if (typeof ans.primary === 'string') return ans.primary;
  return String(ans.correct ?? '');
}

const REVEAL_DURATION_MS = 6000;

export default function DisplayOnly() {
  const { packId } = useParams<{ packId: string }>();
  const pack = packId ? getPack(packId) : null;
  const questions = pack?.questions ?? [];
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('question');
  const [questionStartAt, setQuestionStartAt] = useState<string>(() => new Date().toISOString());

  const currentQuestion = questions[index] ?? null;
  const timeLimitSec = currentQuestion?.timeLimitSec ?? 30;

  useEffect(() => {
    setPhase('question');
    setQuestionStartAt(new Date().toISOString());
  }, [index]);

  const goReveal = () => setPhase('reveal');

  useEffect(() => {
    if (phase !== 'reveal') return;
    const t = setTimeout(() => {
      setIndex((i) => (i + 1 >= questions.length ? 0 : i + 1));
    }, REVEAL_DURATION_MS);
    return () => clearTimeout(t);
  }, [phase, questions.length]);

  if (!pack || questions.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p>Pack not found or empty.</p>
        <Link to="/">Go home</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 20, color: 'var(--text-muted)', marginBottom: 16 }}>{pack.title} · Display only</div>

      {phase === 'question' && currentQuestion && (
        <>
          <QuestionCard question={currentQuestion} size="display" />
          <div style={{ marginTop: 24 }}>
            <TimerPill
              questionStartAt={questionStartAt}
              timeLimitSec={timeLimitSec}
              active
              onExpire={goReveal}
            />
          </div>
        </>
      )}

      {phase === 'reveal' && currentQuestion && (
        <>
          <QuestionCard question={currentQuestion} size="display" />
          <p style={{ margin: '24px 0 0', padding: '24px 32px', background: 'var(--accent)', color: '#111', borderRadius: 12, fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700 }}>
            Answer: {getAnswerDisplayText(currentQuestion)}
          </p>
          {currentQuestion.hostNotes?.funFact && (
            <p style={{ marginTop: 24, fontSize: 'clamp(16px, 2vw, 22px)', color: 'var(--text-muted)', maxWidth: 700, textAlign: 'center' }}>
              {currentQuestion.hostNotes.funFact}
            </p>
          )}
          <p style={{ marginTop: 32, fontSize: 14, color: 'var(--text-muted)' }}>Next question in a moment…</p>
        </>
      )}

      <Link to="/" style={{ position: 'absolute', top: 16, left: 16, fontSize: 14 }}>← Exit</Link>
    </div>
  );
}
