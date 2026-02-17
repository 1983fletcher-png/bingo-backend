/**
 * Host controls for Survey Showdown (Feud). Top bar (title + code + transport) + prompt + lock + reveal/strike.
 * @see docs/ACTIVITY-ROOM-SPEC.md §8.1
 */
import { useState, useEffect, type MutableRefObject } from 'react';
import { Link } from 'react-router-dom';
import { TransportBar } from './TransportBar';
import type { FeudState, FeudCheckpointId } from '../types/feud';
import { FEUD_CHECKPOINTS, feudCheckpointToPhase } from '../types/feud';

const HOST_TOKEN_KEY = (code: string) => `playroom:hostToken:${code}`;

/** Example prompts for blank-slate prompt builder (Survey Showdown). */
const FEUD_PROMPT_IDEAS = [
  'Name something you find at the beach',
  'Name a food you eat at a cookout',
  'Name something you’re afraid of',
  'Name a famous duo',
  'Name something you do when you’re bored',
  'Name a place where you wait in line',
];

export type HostKeyboardRef = MutableRefObject<{ forward?: () => void; back?: () => void } | null>;

type Props = {
  gameCode: string;
  feud: FeudState;
  onFeudState: (state: FeudState) => void;
  socket: import('socket.io-client').Socket | null;
  joinUrl: string;
  displayUrl: string;
  /** Called when host ends session (e.g. navigate away). */
  onEndSession?: () => void;
  /** Called when host clicks Back to Playroom (clear game, navigate to /host). */
  onBackToPlayroom?: () => void;
  /** Optional ref for host keyboard shortcuts (Space/←/→). */
  hostKeyboardRef?: HostKeyboardRef | null;
  /** When true, TopCommandBar/Sidebar are provided by HostConsoleLayout; hide top bar (Back, title, TransportBar, code). */
  embeddedInConsole?: boolean;
};

const IS_DEV = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

export function FeudHostPanel({ gameCode, feud, onFeudState, socket, joinUrl: _joinUrl, displayUrl: _displayUrl, onEndSession, onBackToPlayroom, hostKeyboardRef, embeddedInConsole = false }: Props) {
  const [promptDraft, setPromptDraft] = useState(feud.prompt);
  const [promptOpen, setPromptOpen] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const [lastEvent, setLastEvent] = useState<{ name: string; ts: number } | null>(null);

  const hostToken = typeof localStorage !== 'undefined' ? localStorage.getItem(HOST_TOKEN_KEY(gameCode)) : null;

  useEffect(() => {
    if (!socket || !IS_DEV) return;
    const onFeud = () => setLastEvent({ name: 'feud:state', ts: Date.now() });
    socket.on('feud:state', onFeud);
    return () => {
      socket.off('feud:state', onFeud);
    };
  }, [socket]);

  const setCheckpoint = (checkpointId: FeudCheckpointId) => {
    if (!socket) return;
    socket.emit('feud:set-checkpoint', { code: gameCode, hostToken, checkpointId });
    onFeudState({ ...feud, checkpointId });
  };

  const applyPrompt = () => {
    if (!socket) return;
    socket.emit('feud:set-prompt', { code: gameCode, hostToken, prompt: promptDraft });
    onFeudState({ ...feud, prompt: promptDraft });
  };

  const lock = () => {
    if (!socket) return;
    socket.emit('feud:lock', { code: gameCode, hostToken });
  };

  const reveal = (index: number) => {
    if (!socket) return;
    socket.emit('feud:reveal', { code: gameCode, hostToken, index });
    socket.emit('feud:set-checkpoint', { code: gameCode, hostToken, checkpointId: `R1_BOARD_${index}` as FeudCheckpointId });
  };

  const strike = (index: number) => {
    if (!socket) return;
    socket.emit('feud:strike', { code: gameCode, hostToken, index });
  };

  const checkpoints = FEUD_CHECKPOINTS.map((id) => ({ id, label: id }));
  const handleJump = (id: string) => setCheckpoint(id as FeudCheckpointId);
  const [auditOpen, setAuditOpen] = useState(false);

  const inLobby = feud.checkpointId === 'STANDBY' || feud.checkpointId === 'R1_TITLE';
  const canStartRound = inLobby && !!socket;
  const phase = feudCheckpointToPhase(feud.checkpointId);
  const isCollecting = feud.checkpointId === 'R1_COLLECT';
  const canLock = isCollecting && !!socket;

  const submissionCount = feud.submissions?.length ?? 0;
  const connectionStatus = socket?.connected ? 'connected' : 'disconnected';

  useEffect(() => {
    if (!hostKeyboardRef) return;
    const cp = feud.checkpointId;
    const forward = () => {
      if (inLobby && canStartRound) setCheckpoint('R1_COLLECT');
      else if (isCollecting && canLock) lock();
      else if (cp === 'R1_LOCKED' && feud.topAnswers.length > 0) reveal(0);
      else if (cp.startsWith('R1_BOARD_')) {
        const n = parseInt(cp.replace('R1_BOARD_', ''), 10);
        if (n < 8) reveal(n + 1);
        else if (n === 8) setCheckpoint('R1_SUMMARY');
      }
    };
    const back = () => {
      if (cp === 'R1_COLLECT') setCheckpoint('R1_TITLE');
      else if (cp === 'R1_LOCKED') setCheckpoint('R1_COLLECT');
      else if (cp === 'R1_BOARD_0') setCheckpoint('R1_LOCKED');
      else if (cp.startsWith('R1_BOARD_')) {
        const n = parseInt(cp.replace('R1_BOARD_', ''), 10);
        if (n >= 1) setCheckpoint(`R1_BOARD_${n - 1}` as FeudCheckpointId);
      } else if (cp === 'R1_SUMMARY') setCheckpoint('R1_BOARD_8');
    };
    hostKeyboardRef.current = { forward, back };
    return () => {
      hostKeyboardRef.current = null;
    };
  }, [hostKeyboardRef, feud.checkpointId, feud.topAnswers.length, inLobby, canStartRound, isCollecting, canLock]);

  return (
    <div className="feud-host-panel">
      {!embeddedInConsole && (
        <div className="feud-host-panel__top-bar">
          {onBackToPlayroom != null && (
            <Link to="/host" onClick={onBackToPlayroom} className="feud-host-panel__back-link">
              ← Back to Playroom
            </Link>
          )}
          <span className="feud-host-panel__top-title">Survey Showdown</span>
          <div className="feud-host-panel__transport-wrap">
            <TransportBar
              onBack={() => setCheckpoint('STANDBY')}
              onNext={() => {
                const i = FEUD_CHECKPOINTS.indexOf(feud.checkpointId);
                if (i < FEUD_CHECKPOINTS.length - 1) setCheckpoint(FEUD_CHECKPOINTS[i + 1]);
              }}
              onJump={handleJump}
              jumpCheckpoints={checkpoints}
              onResetRound={() => setCheckpoint('STANDBY')}
              onEndSession={onEndSession}
              endSessionConfirmMessage="Are you sure you want to end the game?"
              endSessionButtonLabel="End game"
            />
          </div>
          <span className="feud-host-panel__top-code" aria-label="Room code">{gameCode.toUpperCase()}</span>
        </div>
      )}
      <div className="feud-host-panel__phase" style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
        Phase: {phase} · Submissions: <strong data-feud-submissions-count>{submissionCount}</strong>
      </div>
      {IS_DEV && (
        <div className="feud-host-panel__debug" style={{ marginBottom: 8 }}>
          <button
            type="button"
            onClick={() => setDebugOpen((o) => !o)}
            style={{ fontSize: 11, padding: '4px 8px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            {debugOpen ? 'Hide' : 'Show'} session debug
          </button>
          {debugOpen && (
            <pre
              style={{
                marginTop: 6,
                padding: 8,
                fontSize: 11,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                color: 'var(--text)',
                overflow: 'auto',
                maxHeight: 120,
              }}
            >
              {JSON.stringify(
                {
                  roomCode: gameCode,
                  connectionStatus,
                  submissionsCount: submissionCount,
                  lastEvent: lastEvent ? `${lastEvent.name} @ ${new Date(lastEvent.ts).toISOString()}` : null,
                },
                null,
                2
              )}
            </pre>
          )}
        </div>
      )}
      {inLobby && (
        <div className="feud-host-panel__section" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
          <button
            type="button"
            className="feud-host-panel__btn feud-host-panel__btn--primary"
            style={{ fontSize: '1rem', padding: '0.75rem 1.25rem' }}
            onClick={() => setCheckpoint('R1_COLLECT')}
            disabled={!canStartRound}
          >
            Start round / Open submissions
          </button>
          <p className="feud-host-panel__hint" style={{ marginTop: 8, marginBottom: 0 }}>
            Moves to COLLECTING — players see the prompt and can submit answers.
          </p>
        </div>
      )}
      {isCollecting && (
        <div className="feud-host-panel__section" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
          <button
            type="button"
            className="feud-host-panel__btn"
            onClick={lock}
            disabled={!canLock}
          >
            Lock submissions → LOCKED
          </button>
          <p className="feud-host-panel__hint" style={{ marginTop: 8, marginBottom: 0 }}>
            Stops new answers and computes top answers for reveal.
          </p>
        </div>
      )}
      <div className="feud-host-panel__section feud-host-panel__prompt-block">
        <details className="feud-host-panel__prompt-details" open={promptOpen} onToggle={(e) => setPromptOpen((e.target as HTMLDetailsElement).open)}>
          <summary className="feud-host-panel__prompt-summary">
            Round prompt {promptDraft ? `— ${promptDraft.slice(0, 40)}${promptDraft.length > 40 ? '…' : ''}` : ''}
          </summary>
          <div className="feud-host-panel__prompt-body">
            <input
              type="text"
              className="feud-host-panel__input"
              value={promptDraft}
              onChange={(e) => setPromptDraft(e.target.value)}
              onBlur={applyPrompt}
              placeholder="e.g. Name something you find at the beach"
            />
            <div className="feud-host-panel__prompt-ideas-row">
              <span className="feud-host-panel__label">Quick ideas:</span>
              <select
                className="feud-host-panel__prompt-select"
                value=""
                onChange={(e) => {
                  const text = e.target.value;
                  if (!text) return;
                  setPromptDraft(text);
                  onFeudState({ ...feud, prompt: text });
                  if (socket) socket.emit('feud:set-prompt', { code: gameCode, hostToken, prompt: text });
                  e.target.value = '';
                }}
                aria-label="Pick a prompt idea"
              >
                <option value="">Choose one…</option>
                {FEUD_PROMPT_IDEAS.map((text) => (
                  <option key={text} value={text}>{text}</option>
                ))}
              </select>
            </div>
          </div>
        </details>
      </div>
      <div className="feud-host-panel__section">
        <button type="button" className="feud-host-panel__btn feud-host-panel__btn--primary" onClick={lock} disabled={feud.locked}>
          {feud.locked ? 'Locked' : 'Lock submissions'}
        </button>
        <button type="button" className="feud-host-panel__btn" onClick={() => setAuditOpen((o) => !o)}>
          {auditOpen ? 'Hide raw answers' : 'Audit raw answers'}
        </button>
        <p className="feud-host-panel__hint">{feud.submissions.length} submission(s)</p>
      </div>
      {auditOpen && (
        <div className="feud-host-panel__audit">
          <h3 className="feud-host-panel__title">Raw answers (before merge)</h3>
          <ul className="feud-host-panel__audit-list">
            {feud.submissions.flatMap((s, i) =>
              s.answers.map((a, j) => (
                <li key={`${i}-${j}`} className="feud-host-panel__audit-item">
                  <span>{a}</span>
                  <span className="feud-host-panel__audit-meta">{s.displayName}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
      {feud.locked && feud.topAnswers.length > 0 && (
        <div className="feud-host-panel__section">
          <h3 className="feud-host-panel__title">Top answers — reveal or strike</h3>
          <ul className="feud-host-panel__board">
            {feud.topAnswers.map((item, i) => (
              <li key={i} className="feud-host-panel__board-item">
                <span className="feud-host-panel__board-answer">
                  {item.revealed ? item.answer : '???'} {item.revealed && item.count != null && `(${item.count})`}
                </span>
                {!item.revealed && !item.strike && (
                  <>
                    <button type="button" className="feud-host-panel__btn-small" onClick={() => reveal(i)}>Reveal</button>
                    <button type="button" className="feud-host-panel__btn-small feud-host-panel__btn--danger" onClick={() => strike(i)}>Strike</button>
                  </>
                )}
                {item.strike && <span className="feud-host-panel__strike">✕</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
