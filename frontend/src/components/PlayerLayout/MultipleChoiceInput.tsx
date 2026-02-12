/**
 * Multiple choice input — for Crowd Control Trivia or single-select options.
 */
import React, { useState } from 'react';

export interface MultipleChoiceInputProps {
  options: string[];
  onSubmit: (selectedIndex: number) => void;
  submitLabel?: string;
  disabled?: boolean;
}

export function MultipleChoiceInput({
  options,
  onSubmit,
  submitLabel = 'Submit',
  disabled = false,
}: MultipleChoiceInputProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected === null) return;
    onSubmit(selected);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p style={{ margin: 0, color: 'var(--pr-muted)', fontWeight: 500 }}>
        Thanks! Your answer is in.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="player-layout__form" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map((label, i) => (
          <button
            key={i}
            type="button"
            className="join-page__btn"
            style={{
              width: '100%',
              textAlign: 'left',
              background: selected === i ? 'var(--pr-brand)' : 'var(--pr-surface2)',
              color: selected === i ? 'var(--pr-accent-contrast, #0b0f14)' : 'var(--pr-text)',
            }}
            onClick={() => setSelected(i)}
            disabled={disabled}
          >
            {label}
          </button>
        ))}
      </div>
      <button
        type="submit"
        className="join-page__btn player-layout__cta"
        disabled={disabled || selected === null}
      >
        {submitLabel}
      </button>
    </form>
  );
}
