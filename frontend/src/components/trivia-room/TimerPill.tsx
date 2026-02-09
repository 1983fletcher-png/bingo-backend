/**
 * TimerPill — Countdown for ACTIVE_ROUND (per-question timer).
 * Uses questionStartAt (ISO string) + timeLimitSec to show remaining seconds.
 */
import { useEffect, useState } from 'react';

export interface TimerPillProps {
  /** When the current question started (ISO string from server) */
  questionStartAt: string | null | undefined;
  /** Question time limit in seconds; if missing, no countdown */
  timeLimitSec: number | null | undefined;
  /** Only show countdown when round is active */
  active?: boolean;
  className?: string;
  /** Optional callback when timer hits 0 */
  onExpire?: () => void;
}

function getRemainingSec(startAt: string | null | undefined, limitSec: number | null | undefined): number | null {
  if (!startAt || limitSec == null || limitSec <= 0) return null;
  const start = new Date(startAt).getTime();
  const now = Date.now();
  const elapsed = Math.floor((now - start) / 1000);
  const remaining = Math.max(0, limitSec - elapsed);
  return remaining;
}

export function TimerPill({
  questionStartAt,
  timeLimitSec,
  active = true,
  className = '',
  onExpire,
}: TimerPillProps) {
  const [remaining, setRemaining] = useState<number | null>(() =>
    active ? getRemainingSec(questionStartAt, timeLimitSec) : null
  );

  useEffect(() => {
    if (!active || remaining === null) return;
    if (remaining <= 0) {
      onExpire?.();
      return;
    }
    const t = setInterval(() => {
      const next = getRemainingSec(questionStartAt, timeLimitSec ?? undefined);
      setRemaining(next);
      if (next !== null && next <= 0) onExpire?.();
    }, 1000);
    return () => clearInterval(t);
  }, [active, questionStartAt, timeLimitSec, remaining, onExpire]);

  useEffect(() => {
    if (active) setRemaining(getRemainingSec(questionStartAt, timeLimitSec ?? undefined));
    else setRemaining(null);
  }, [active, questionStartAt, timeLimitSec]);

  if (remaining === null) return null;

  const display = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`;
  const isLow = remaining <= 10;

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 16px',
        borderRadius: 999,
        background: isLow ? 'var(--accent)' : 'var(--surface)',
        border: `2px solid ${isLow ? 'var(--accent)' : 'var(--border)'}`,
        fontSize: 18,
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        color: isLow ? '#111' : 'var(--text)',
      }}
    >
      {display}
    </div>
  );
}
