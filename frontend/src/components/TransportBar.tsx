/**
 * Global Transport Bar for Host View. Present on all Host screens per Activity Room spec.
 * Back (Display Only), Next, Pause, Jump, Reset Round, End Session.
 * @see docs/ACTIVITY-ROOM-SPEC.md §9
 */
import { useState } from 'react';

export type TransportBarProps = {
  onBack?: () => void;
  onNext?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onJump?: (checkpointId: string) => void;
  onResetRound?: () => void;
  onEndSession?: () => void;
  paused?: boolean;
  jumpCheckpoints?: { id: string; label: string }[];
  disabled?: boolean;
  /** Override confirm dialog message for End session */
  endSessionConfirmMessage?: string;
  /** Override confirm button label */
  endSessionButtonLabel?: string;
};

export function TransportBar({
  onBack,
  onNext,
  onPause,
  onResume,
  onJump,
  onResetRound,
  onEndSession,
  paused = false,
  jumpCheckpoints = [],
  disabled = false,
  endSessionConfirmMessage,
  endSessionButtonLabel,
}: TransportBarProps) {
  const [showJump, setShowJump] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  return (
    <div className="transport-bar" role="toolbar" aria-label="Host transport controls">
      <div className="transport-bar__row">
        {onBack != null && (
          <button
            type="button"
            className="transport-bar__btn transport-bar__btn--secondary"
            onClick={onBack}
            disabled={disabled}
            title="Back (display only)"
          >
            Back
          </button>
        )}
        {onNext != null && (
          <button
            type="button"
            className="transport-bar__btn transport-bar__btn--primary"
            onClick={onNext}
            disabled={disabled}
            title="Next"
          >
            Next
          </button>
        )}
        {(onPause != null || onResume != null) && (
          <button
            type="button"
            className="transport-bar__btn transport-bar__btn--secondary"
            onClick={paused ? onResume : onPause}
            disabled={disabled}
            title={paused ? 'Resume' : 'Pause'}
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
        )}
        {onJump != null && jumpCheckpoints.length > 0 && (
          <div className="transport-bar__jump-wrap">
            <button
              type="button"
              className="transport-bar__btn transport-bar__btn--secondary"
              onClick={() => setShowJump((v) => !v)}
              disabled={disabled}
              title="Jump to…"
              aria-expanded={showJump}
            >
              Jump to…
            </button>
            {showJump && (
              <ul className="transport-bar__jump-list">
                {jumpCheckpoints.map((cp) => (
                  <li key={cp.id}>
                    <button
                      type="button"
                      className="transport-bar__jump-item"
                      onClick={() => {
                        onJump(cp.id);
                        setShowJump(false);
                      }}
                    >
                      {cp.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {onResetRound != null && (
          <>
            <button
              type="button"
              className="transport-bar__btn transport-bar__btn--danger"
              onClick={() => setShowReset(true)}
              disabled={disabled}
              title="Reset round"
            >
              Reset round
            </button>
            {showReset && (
              <div className="transport-bar__confirm" role="dialog" aria-label="Confirm reset">
                <p>Reset this round? This only affects the display.</p>
                <div className="transport-bar__confirm-actions">
                  <button type="button" className="transport-bar__btn transport-bar__btn--secondary" onClick={() => setShowReset(false)}>Cancel</button>
                  <button type="button" className="transport-bar__btn transport-bar__btn--danger" onClick={() => { onResetRound(); setShowReset(false); }}>Reset</button>
                </div>
              </div>
            )}
          </>
        )}
        {onEndSession != null && (
          <>
            <button
              type="button"
              className="transport-bar__btn transport-bar__btn--danger"
              onClick={() => setShowEnd(true)}
              disabled={disabled}
              title="End session"
            >
              End session
            </button>
            {showEnd && (
              <div className="transport-bar__confirm" role="dialog" aria-label="Confirm end game">
                <p>{endSessionConfirmMessage ?? 'End this session? Players will be disconnected.'}</p>
                <div className="transport-bar__confirm-actions">
                  <button type="button" className="transport-bar__btn transport-bar__btn--secondary" onClick={() => setShowEnd(false)}>Cancel</button>
                  <button type="button" className="transport-bar__btn transport-bar__btn--danger" onClick={() => { onEndSession(); setShowEnd(false); }}>{endSessionButtonLabel ?? 'End session'}</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
