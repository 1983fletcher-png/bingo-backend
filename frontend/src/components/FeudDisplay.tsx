/**
 * Survey Showdown (Feud) TV/Display view. Checkpoint-based: STANDBY, R1_TITLE, R1_COLLECT, board with hinge-down reveal, R1_SUMMARY.
 * @see docs/ACTIVITY-ROOM-SPEC.md §8.1
 */
import type { FeudState, FeudCheckpointId } from '../types/feud';
import { feudCheckpointToPhase } from '../types/feud';
import '../styles/feud-display.css';

type Props = {
  feud: FeudState;
  joinUrl: string;
  code: string;
  eventTitle?: string;
  theme: { bg: string; panel: string; text: string; muted: string; accent: string; border: string };
  calmMode?: boolean;
};

export function FeudDisplay({ feud, joinUrl, code, eventTitle, theme, calmMode }: Props) {
  const checkpoint: FeudCheckpointId = feud.checkpointId;
  const phase = feudCheckpointToPhase(checkpoint);
  const submissionCount = feud.submissions?.length ?? 0;
  const qrUrl = joinUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(joinUrl)}`
    : '';

  if (checkpoint === 'STANDBY') {
    return (
      <div className="feud-display feud-display--standby" style={{ background: theme.bg, color: theme.text }}>
        <div className="feud-display__standby-card">
          <p className="feud-display__standby-message">Host reviewing — next question starting soon.</p>
        </div>
      </div>
    );
  }

  if (checkpoint === 'R1_TITLE') {
    return (
      <div className="feud-display feud-display--title" style={{ background: theme.bg, color: theme.text }}>
        <h1 className="feud-display__game-name">{eventTitle || 'Survey Showdown'}</h1>
        <p className="feud-display__round">Round {feud.roundIndex}</p>
      </div>
    );
  }

  if (checkpoint === 'R1_COLLECT') {
    const allAnswers: string[] = [];
    (feud.submissions ?? []).forEach((s) => {
      (s.answers ?? []).forEach((a) => {
        const t = (a || '').trim();
        if (t) allAnswers.push(t);
      });
    });
    return (
      <div className="feud-display feud-display--collect" style={{ background: theme.bg, color: theme.text }}>
        <div className="feud-display__collect-inner">
          <h2 className="feud-display__prompt">{feud.prompt || 'Submit your answers…'}</h2>
          <p className="feud-display__muted" style={{ marginTop: 8, marginBottom: 8 }}>
            Submissions open — answer on your phone.
          </p>
          {qrUrl && (
            <div className="feud-display__qr-wrap">
              <img src={qrUrl} alt="Scan to join" className="feud-display__qr" />
              <p className="feud-display__code">{code}</p>
            </div>
          )}
          <p className="feud-display__muted" style={{ marginTop: 12, marginBottom: 8, fontSize: '0.95rem' }}>
            {submissionCount} player{submissionCount !== 1 ? 's' : ''} have answered · {allAnswers.length} answer{allAnswers.length !== 1 ? 's' : ''} so far
          </p>
          {allAnswers.length > 0 && (
            <div className="feud-display__live-answers">
              <p className="feud-display__muted" style={{ fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Answers still coming in</p>
              <ul className="feud-display__live-answers-list">
                {allAnswers.slice(-24).map((a, i) => (
                  <li key={`${i}-${a}`} className="feud-display__live-answers-item" style={{ color: theme.text }}>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  const isBoard = checkpoint.startsWith('R1_BOARD_');
  const revealUpTo = isBoard ? Math.max(0, parseInt(checkpoint.replace('R1_BOARD_', ''), 10)) : 0;
  const hasBoardData = (feud.topAnswers?.length ?? 0) > 0;

  if (checkpoint === 'R1_LOCKED' && !hasBoardData) {
    return (
      <div className="feud-display feud-display--locked" style={{ background: theme.bg, color: theme.text }}>
        <p className="feud-display__muted" style={{ fontSize: 12, marginBottom: 8 }}>Phase: {phase}</p>
        <h2 className="feud-display__prompt">{feud.prompt || 'Answers locked'}</h2>
        <p className="feud-display__muted">Revealing top answers…</p>
      </div>
    );
  }

  if (isBoard || checkpoint === 'R1_SUMMARY' || (checkpoint === 'R1_LOCKED' && hasBoardData)) {
    const showAll = checkpoint === 'R1_SUMMARY';
    const raw = feud.topAnswers ?? [];
    const boardItems = raw.length >= 8 ? raw : [...raw, ...Array.from({ length: 8 - raw.length }, () => ({ answer: '', count: 0, revealed: false, strike: false }))];
    return (
      <div className="feud-display feud-display--board" style={{ background: theme.bg, color: theme.text }}>
        <h2 className="feud-display__prompt feud-display__prompt--small">{feud.prompt || 'Top answers'}</h2>
        <div className="feud-display__board-frame">
          <div className="feud-display__board">
            {boardItems.slice(0, 8).map((item, i) => {
              const revealed = item.revealed || (feud.showScores && (showAll || i < revealUpTo));
              const strike = item.strike;
              const displayAnswer = (revealed && item.answer) ? (item.answer.charAt(0).toUpperCase() + item.answer.slice(1)) : (revealed ? '???' : '???');
              return (
                <div
                  key={i}
                  className={`feud-display__plate ${revealed ? 'feud-display__plate--revealed' : ''} ${strike ? 'feud-display__plate--strike' : ''} ${!calmMode ? 'feud-display__plate--hinge' : ''}`}
                  style={{ ['--reveal-order' as string]: i }}
                >
                  <div className="feud-display__plate-front" />
                  <div className="feud-display__plate-back" style={{ background: theme.panel, borderColor: theme.border }}>
                    {strike ? <span className="feud-display__strike">✕</span> : null}
                    <span className="feud-display__plate-answer">{displayAnswer}</span>
                    {revealed && item.count != null && item.count > 0 && (
                      <span className="feud-display__plate-votes" style={{ color: theme.accent }}>{item.count}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feud-display" style={{ background: theme.bg, color: theme.text }}>
      <p className="feud-display__muted">{checkpoint}</p>
    </div>
  );
}
