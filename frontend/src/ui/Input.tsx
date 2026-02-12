/**
 * Shared Input — theme tokens only; default variant.
 */

import React from 'react';
import './ui.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Optional label (not rendered; use a wrapping label if needed) */
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = '', ...rest },
  ref
) {
  return <input ref={ref} className={`pr-ui-input ${className}`.trim()} {...rest} />;
});
