/**
 * AnswerCard — MC option with A/B/C/D badge; tap to select, second tap to lock; press animation.
 * Min 44px tap target; optional highlight when correct/wrong (for display on REVEAL).
 */
import { useState } from 'react';

export interface McOption {
  id: string;
  text: string;
}

export interface AnswerCardProps {
  option: McOption;
  /** A, B, C, D label */
  label: string;
  selected: boolean;
  locked: boolean;
  onTap: () => void;
  /** REVEAL state: true = correct, false = wrong, undefined = not revealed */
  revealedCorrect?: boolean;
  disabled?: boolean;
  /** 'compact' = single column small; 'display' = big for TV */
  size?: 'compact' | 'display';
}

export function AnswerCard({
  option,
  label,
  selected,
  locked,
  onTap,
  revealedCorrect,
  disabled = false,
  size = 'compact',
}: AnswerCardProps) {
  const [pressing, setPressing] = useState(false);
  const isDisplay = size === 'display';
  const minHeight = 44;
  const padding = isDisplay ? 24 : 14;
  const fontSize = isDisplay ? 'clamp(18px, 2.5vw, 28px)' : 16;

  let bg = 'var(--surface)';
  let border = '1px solid var(--border)';
  let opacity = 1;
  if (revealedCorrect === true) {
    bg = 'var(--accent)';
    border = '3px solid var(--accent)';
  } else if (revealedCorrect === false) {
    opacity = 0.6;
  } else if (selected) {
    bg = 'var(--accent)';
    border = '2px solid var(--accent)';
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onTap()}
      onPointerDown={() => setPressing(true)}
      onPointerUp={() => setPressing(false)}
      onPointerLeave={() => setPressing(false)}
      className="join-page__btn"
      style={{
        minHeight,
        padding: `${padding}px 18px`,
        background: bg,
        border,
        borderRadius: 12,
        fontSize,
        fontWeight: 600,
        opacity,
        textAlign: 'left',
        cursor: disabled ? 'default' : 'pointer',
        transform: pressing ? 'scale(0.98)' : 'scale(1)',
        transition: 'transform 0.1s ease, opacity 0.2s ease',
        color: bg === 'var(--accent)' ? '#111' : 'var(--text)',
      }}
    >
      <span style={{ marginRight: 10, opacity: 0.9 }}>{label}.</span>
      {option.text}
      {locked && selected && ' ✓ Locked'}
    </button>
  );
}
