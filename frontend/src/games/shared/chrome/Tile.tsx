import React from 'react';
import type { TileStyle } from '../../../theme/theme.types';
import './Tile.css';

export interface TileProps {
  variant?: TileStyle;
  selected?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Tile(props: TileProps) {
  const {
    variant = 'flat',
    selected = false,
    disabled = false,
    children,
    className = '',
    onClick
  } = props;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      className={`pr-tile pr-tile--${variant} ${selected ? 'pr-tile--selected' : ''} ${disabled ? 'pr-tile--disabled' : ''} ${onClick ? 'pr-focus-ring' : ''} ${className}`.trim()}
      data-tile={variant}
      onClick={disabled ? undefined : onClick}
      onKeyDown={onClick && !disabled ? handleKeyDown : undefined}
    >
      {children}
    </div>
  );
}
