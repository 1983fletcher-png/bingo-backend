/**
 * Shared Button — theme tokens only; variants: primary, secondary, ghost, danger.
 */

import React from 'react';
import './ui.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const sizeClass = size !== 'md' ? ` pr-ui-btn--${size}` : '';
  return (
    <button
      type="button"
      className={`pr-ui-btn pr-ui-btn--${variant}${sizeClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
