/**
 * Shared game shell for Host / Player / Display.
 * Re-exports the canonical GameShell from games/shared; uses theme via usePlayroomTheme(),
 * applies scene as a separate layer with pointer-events: none, and uses CSS vars for all surfaces.
 * Structure: .pr-app > .pr-scene-layer (decorative) + .pr-gameshell__chrome (header + .pr-stage + footer).
 * @see docs/ROUTES-THEME-FEUD-REFERENCE.md
 */
export {
  GameShell,
  type GameShellProps,
  type ViewMode,
  type FooterVariant
} from '../games/shared/GameShell';
