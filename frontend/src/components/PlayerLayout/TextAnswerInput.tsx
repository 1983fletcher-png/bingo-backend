/**
 * Text answer input — single or multiple lines. Used by Survey Showdown (1–3 answers).
 */
import React, { useState } from 'react';

export interface TextAnswerInputProps {
  onSubmit: (values: string[]) => void;
  placeholder?: string;
  /** Max number of text fields (e.g. 3 for feud) */
  maxFields?: number;
  submitLabel?: string;
  disabled?: boolean;
}

export function TextAnswerInput({
  onSubmit,
  placeholder = 'Your answer',
  maxFields = 1,
  submitLabel = 'Submit',
  disabled = false,
}: TextAnswerInputProps) {
  const [values, setValues] = useState<string[]>(() => Array(maxFields).fill(''));
  const [submitted, setSubmitted] = useState(false);

  const update = (index: number, value: string) => {
    setValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = values.map((v) => v.trim()).filter(Boolean);
    if (trimmed.length === 0) return;
    onSubmit(trimmed);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p style={{ margin: 0, color: 'var(--pr-muted)', fontWeight: 500 }}>
        Thanks! Your answers are in.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="player-layout__form" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: maxFields }, (_, i) => (
        <input
          key={i}
          type="text"
          className="join-page__input"
          placeholder={i === 0 ? placeholder : `${placeholder} ${i + 1} (optional)`}
          value={values[i]}
          onChange={(e) => update(i, e.target.value)}
          autoComplete="off"
          disabled={disabled}
          style={{ width: '100%' }}
        />
      ))}
      <button
        type="submit"
        className="join-page__btn player-layout__cta"
        disabled={disabled || !values.some((v) => v.trim())}
      >
        {submitLabel}
      </button>
    </form>
  );
}
