/**
 * Survey Showdown (Feud) TV/Display view. Checkpoint-based: STANDBY, R1_TITLE, R1_COLLECT, board with hinge-down reveal, R1_SUMMARY.
 * @see docs/ACTIVITY-ROOM-SPEC.md §8.1
 */
import type { FeudState, FeudCheckpointId } from '../types/feud';
import { feudCheckpointToPhase } from '../types/feud';
import { SurveyShowdownFrame } from '../games/feud/SurveyShowdownFrame';
import { SurveyShowdownBoard } from '../games/feud/SurveyShowdownBoard';
import '../styles/feud-display.css';

type Props = {
  feud: FeudState;
  joinUrl: string;
  code: string;
  eventTitle?: string;
  theme: { bg: string; panel: string; text: string; muted: string; accent: string; border: string };
  calmMode?: boolean;
};

export function FeudDisplay({ feud, joinUrl, code, eventTitle, theme }: Props) {
  const checkpoint: FeudCheckpointId = feud.checkpointId || 'STANDBY';
  const phase = feudCheckpointToPhase(checkpoint);
  const submissionCount = feud.submissions?.length ?? 0;
  const qrUrl = joinUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(joinUrl)}`
    : '';

  if (checkpoint === 'STANDBY') {
    return (
      <div className="feud-display feud-display--standby feud-display--inframe" style={{ background: 'transparent', color: theme.text }}>
        <SurveyShowdownFrame variant="tv">
          <div className="feud-display__standby-inframe">
            <div className="feud-display__standby-card feud-display__standby-card--gameshow">
              <p className="feud-display__standby-message">Host reviewing — next question starting soon.</p>
              <p className="feud-display__standby-sub">Lights, camera, action!</p>
            </div>
          </div>
        </SurveyShowdownFrame>
      </div>
    );
  }

  if (checkpoint === 'R1_TITLE') {
    return (
      <div className="feud-display feud-display--title feud-display--inframe" style={{ background: 'transparent', color: theme.text }}>
        <SurveyShowdownFrame variant="tv">
          <div className="feud-display__hud">
            <h1 className="feud-display__game-name">{eventTitle || 'Survey Showdown'}</h1>
            <p className="feud-display__round">Round {feud.roundIndex}</p>
          </div>
        </SurveyShowdownFrame>
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
      <div className="feud-display feud-display--collect feud-display--inframe" style={{ background: 'transparent', color: theme.text }}>
        <SurveyShowdownFrame variant="tv">
          <div className="feud-display__collect-inner feud-display__collect-inner--inframe">
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
        </SurveyShowdownFrame>
      </div>
    );
  }

  const isBoard = checkpoint.startsWith('R1_BOARD_');
  const hasBoardData = (feud.topAnswers?.length ?? 0) > 0;

  if (checkpoint === 'R1_LOCKED' && !hasBoardData) {
    return (
      <div className="feud-display feud-display--locked feud-display--inframe" style={{ background: 'transparent', color: theme.text }}>
        <SurveyShowdownFrame variant="tv">
          <div className="feud-display__hud">
            <p className="feud-display__muted" style={{ fontSize: 12, marginBottom: 8 }}>Phase: {phase}</p>
            <h2 className="feud-display__prompt feud-display__prompt--inframe">{feud.prompt || 'Answers locked'}</h2>
            <p className="feud-display__muted">Revealing top answers…</p>
          </div>
        </SurveyShowdownFrame>
      </div>
    );
  }

  if (isBoard || checkpoint === 'R1_SUMMARY' || (checkpoint === 'R1_LOCKED' && hasBoardData)) {
    return (
      <div className="feud-display feud-display--board feud-display--board-live feud-display--inframe" style={{ background: 'transparent', color: theme.text }}>
        <SurveyShowdownFrame variant="tv">
          <div className="feud-display__hud">
            <h2 className="feud-display__prompt feud-display__prompt--inframe">
              {feud.prompt || 'Top answers'}
            </h2>
          </div>
          <div className="feud-display__boardWrap">
            <SurveyShowdownBoard variant="tv" feud={feud} />
          </div>
        </SurveyShowdownFrame>
      </div>
    );
  }

  return (
    <div className="feud-display" style={{ background: theme.bg, color: theme.text }}>
      <p className="feud-display__muted">{checkpoint}</p>
    </div>
  );
}
