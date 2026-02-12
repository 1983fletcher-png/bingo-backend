/**
 * Host controls for Survey Showdown (Feud). Transport bar + prompt + lock + reveal/strike.
 * @see docs/ACTIVITY-ROOM-SPEC.md §8.1
 */
import { useState, useEffect } from 'react';
import { TransportBar } from './TransportBar';
import type { FeudState, FeudCheckpointId } from '../types/feud';
import { FEUD_CHECKPOINTS, feudCheckpointToPhase } from '../types/feud';
import { getStoredAudioSettings, saveAudioSettings, type AudioSettings, type AudioProfileId } from '../lib/audioCues';

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

type Props = {
  gameCode: string;
  feud: FeudState;
  onFeudState: (state: FeudState) => void;
  socket: import('socket.io-client').Socket | null;
  joinUrl: string;
  displayUrl: string;
  /** Called when host ends session (e.g. navigate away). */
  onEndSession?: () => void;
};

export function FeudHostPanel({ gameCode, feud, onFeudState, socket, joinUrl, displayUrl, onEndSession }: Props) {
  const [promptDraft, setPromptDraft] = useState(feud.prompt);

  const hostToken = typeof localStorage !== 'undefined' ? localStorage.getItem(HOST_TOKEN_KEY(gameCode)) : null;

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
  };

  const strike = (index: number) => {
    if (!socket) return;
    socket.emit('feud:strike', { code: gameCode, hostToken, index });
  };

  const checkpoints = FEUD_CHECKPOINTS.map((id) => ({ id, label: id }));
  const handleJump = (id: string) => setCheckpoint(id as FeudCheckpointId);
  const [auditOpen, setAuditOpen] = useState(false);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(() => getStoredAudioSettings());
  useEffect(() => {
    setAudioSettings(getStoredAudioSettings());
  }, []);
  const updateAudio = (next: Partial<AudioSettings>) => {
    const s = { ...audioSettings, ...next };
    setAudioSettings(s);
    saveAudioSettings(s);
  };
  const lastRevealedIndex = feud.topAnswers.findIndex((a) => a.revealed && !a.strike);
  const replayLastReveal = () => {
    if (lastRevealedIndex <= 0) return;
    const prev: FeudCheckpointId = lastRevealedIndex === 1 ? 'R1_BOARD_0' : `R1_BOARD_${lastRevealedIndex - 1}` as FeudCheckpointId;
    const next: FeudCheckpointId = `R1_BOARD_${lastRevealedIndex}` as FeudCheckpointId;
    setCheckpoint(prev);
    setTimeout(() => setCheckpoint(next), 400);
  };

  const inLobby = feud.checkpointId === 'STANDBY' || feud.checkpointId === 'R1_TITLE';
  const canStartRound = inLobby && !!socket;
  const phase = feudCheckpointToPhase(feud.checkpointId);
  const isCollecting = feud.checkpointId === 'R1_COLLECT';
  const canLock = isCollecting && !!socket;

  return (
    <div className="feud-host-panel">
      <div className="feud-host-panel__phase" style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
        Phase: {phase} · Submissions: {feud.submissions?.length ?? 0}
      </div>
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
      />
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
      <div className="feud-host-panel__section">
        <label className="feud-host-panel__label">Round prompt</label>
        <input
          type="text"
          className="feud-host-panel__input"
          value={promptDraft}
          onChange={(e) => setPromptDraft(e.target.value)}
          onBlur={applyPrompt}
          placeholder="e.g. Name something you find at the beach"
        />
        <p className="feud-host-panel__hint">Prompt ideas:</p>
        <div className="feud-host-panel__prompt-ideas">
          {FEUD_PROMPT_IDEAS.map((text) => (
            <button
              key={text}
              type="button"
              className="feud-host-panel__prompt-idea-btn"
              onClick={() => {
                setPromptDraft(text);
                onFeudState({ ...feud, prompt: text });
                if (socket) {
                  socket.emit('feud:set-prompt', { code: gameCode, hostToken, prompt: text });
                }
              }}
            >
              {text}
            </button>
          ))}
        </div>
        <button type="button" className="feud-host-panel__btn" onClick={() => setCheckpoint('R1_COLLECT')}>
          Show collect screen
        </button>
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
      <div className="feud-host-panel__section feud-host-panel__replay">
        <button type="button" className="feud-host-panel__btn" onClick={replayLastReveal} disabled={lastRevealedIndex <= 0}>
          Replay last reveal
        </button>
        <button type="button" className="feud-host-panel__btn" onClick={() => setCheckpoint('R1_SUMMARY')}>
          Replay round summary
        </button>
      </div>
      <div className="feud-host-panel__section">
        <span className="feud-host-panel__label">Scoring</span>
        <label className="feud-host-panel__toggle">
          <input
            type="checkbox"
            checked={feud.showScores}
            onChange={(e) => {
              const v = e.target.checked;
              onFeudState({ ...feud, showScores: v });
              socket?.emit('feud:set-show-scores', { code: gameCode, hostToken, showScores: v });
            }}
          />
          Show scores on board
        </label>
      </div>
      <div className="feud-host-panel__section">
        <span className="feud-host-panel__label">Display effects (default OFF)</span>
          <label className="feud-host-panel__toggle">
            <input
              type="checkbox"
              checked={feud.cascadeEffect ?? false}
              onChange={(e) => {
                const v = e.target.checked;
                onFeudState({ ...feud, cascadeEffect: v });
                socket?.emit('feud:set-effects', { code: gameCode, hostToken, cascadeEffect: v });
              }}
            />
            Cascade
          </label>
          <label className="feud-host-panel__toggle">
            <input
              type="checkbox"
              checked={feud.bottomDropEffect ?? false}
              onChange={(e) => {
                const v = e.target.checked;
                onFeudState({ ...feud, bottomDropEffect: v });
                socket?.emit('feud:set-effects', { code: gameCode, hostToken, bottomDropEffect: v });
              }}
            />
            Bottom drop
          </label>
      </div>
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
      <div className="feud-host-panel__section">
        <h3 className="feud-host-panel__title">Audio (Activity Room)</h3>
        <p className="feud-host-panel__hint">Sound on/off, volume, and profile. Applied across Activity Room games.</p>
        <label className="feud-host-panel__toggle">
          <input
            type="checkbox"
            checked={audioSettings.enabled}
            onChange={(e) => updateAudio({ enabled: e.target.checked })}
          />
          Sound on
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <label className="feud-host-panel__label" style={{ marginBottom: 0 }}>Volume</label>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(audioSettings.volume * 100)}
            onChange={(e) => updateAudio({ volume: Number(e.target.value) / 100 })}
            style={{ width: 120 }}
          />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{Math.round(audioSettings.volume * 100)}%</span>
        </div>
        <div style={{ marginTop: 8 }}>
          <span className="feud-host-panel__label">Profile</span>
          <select
            value={audioSettings.profile}
            onChange={(e) => updateAudio({ profile: e.target.value as AudioProfileId })}
            style={{ marginLeft: 8, padding: '4px 8px', borderRadius: 6 }}
          >
            <option value="classic">Playroom Classic</option>
            <option value="calm">Calm</option>
            <option value="corporate">Corporate</option>
          </select>
        </div>
      </div>
      <p className="feud-host-panel__urls">
        <a href={joinUrl} target="_blank" rel="noopener noreferrer">Player view</a>
        {' · '}
        <a href={displayUrl} target="_blank" rel="noopener noreferrer">Display (TV)</a>
      </p>
    </div>
  );
}
