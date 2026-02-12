/**
 * Shared Card — theme tokens only.
 */

import React from 'react';
import './ui.css';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return <div className={`pr-ui-card ${className}`.trim()}>{children}</div>;
}
