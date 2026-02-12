/**
 * Number answer input — for Market Match (price guess) or numeric answers.
 */
import React, { useState } from 'react';

export interface NumberAnswerInputProps {
  onSubmit: (value: number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  submitLabel?: string;
  disabled?: boolean;
  unit?: string;
}

export function NumberAnswerInput({
  onSubmit,
  placeholder = 'Enter number',
  min,
  max,
  step = 1,
  submitLabel = 'Submit',
  disabled = false,
  unit,
}: NumberAnswerInputProps) {
  const [value, setValue] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(value);
    if (Number.isNaN(n)) return;
    onSubmit(n);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p style={{ margin: 0, color: 'var(--pr-muted)', fontWeight: 500 }}>
        Thanks! Your guess is in.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="player-layout__form" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <input
          type="number"
          className="join-page__input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          style={{ flex: '1 1 120px', minWidth: 0 }}
        />
        {unit && <span style={{ color: 'var(--pr-muted)', fontSize: 14 }}>{unit}</span>}
      </div>
      <button
        type="submit"
        className="join-page__btn player-layout__cta"
        disabled={disabled || value === ''}
      >
        {submitLabel}
      </button>
    </form>
  );
}
