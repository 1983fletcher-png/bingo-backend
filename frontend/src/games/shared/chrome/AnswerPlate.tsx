import React from 'react';
import type { AnswerPlateStyle } from '../../../theme/theme.types';
import './AnswerPlate.css';

export interface AnswerPlateProps {
  variant?: AnswerPlateStyle;
  revealed?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function AnswerPlate(props: AnswerPlateProps) {
  const { variant = 'flat', revealed = false, children, className = '' } = props;
  return (
    <div
      className={`pr-answer-plate pr-answer-plate--${variant} ${revealed ? 'pr-answer-plate--revealed' : ''} ${className}`.trim()}
      data-plate={variant}
    >
      <div className="pr-answer-plate__face">{children}</div>
    </div>
  );
}
