/**
 * Survey Showdown (Feud) shared state — apply feud:state updates from server.
 * Host controls emit socket events; server broadcasts feud:state; clients apply here.
 * @see docs/ROUTES-THEME-FEUD-REFERENCE.md
 */

import type { FeudState } from '../../types/feud';

export type { FeudState };
export type Submission = FeudState['submissions'][number];
export type RevealedSlot = FeudState['topAnswers'][number];

/** Apply server feud:state payload to current state (replace). */
export function applyFeudState(_current: FeudState | null, payload: FeudState): FeudState {
  return payload;
}

/** Check if we have submissions and can show live list. */
export function hasSubmissions(state: FeudState | null): boolean {
  return (state?.submissions?.length ?? 0) > 0;
}

/** Check if a slot index is revealed. */
export function isSlotRevealed(state: FeudState | null, index: number): boolean {
  const item = state?.topAnswers?.[index];
  return !!item?.revealed;
}
