/**
 * Game chrome — marquee / pop-out title or banner.
 * Uses theme tokens for glow + bevel.
 */

import './MarqueeHeader.css';

export type MarqueeVariant = 'marqueePop' | 'banner' | 'minimal';

export interface MarqueeHeaderProps {
  title: string;
  subtitle?: string;
  variant?: MarqueeVariant;
  className?: string;
}

export function MarqueeHeader({
  title,
  subtitle,
  variant = 'marqueePop',
  className = ''
}: MarqueeHeaderProps) {
  return (
    <header
      className={`pr-marquee pr-marquee--${variant} ${className}`.trim()}
      data-variant={variant}
    >
      <div className="pr-marquee__inner">
        <h1 className="pr-marquee__title">{title}</h1>
        {subtitle && <p className="pr-marquee__subtitle">{subtitle}</p>}
      </div>
    </header>
  );
}
