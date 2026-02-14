/**
 * Crowd Control Trivia — state from server (category vote → next value → question → reveal).
 * @see docs/CROWD-CONTROL-TRIVIA-SPEC.md
 */

export type CCTPhase = 'board' | 'vote' | 'question' | 'reveal';

export interface CrowdControlState {
  boardId: number;
  /** Per-category next value index (0–5); 5 = category exhausted */
  usedSlots: number[];
  phase: CCTPhase;
  voteCounts: number[];
  winningCategoryIndex: number | null;
  currentValueIndex: number | null;
  currentQuestionId: string | null;
  revealed: boolean;
  /** Points for current question (100–500 by tile value). */
  currentPoints?: number;
  /** Player scores: socketId -> total score. */
  playerScores?: Record<string, number>;
}
