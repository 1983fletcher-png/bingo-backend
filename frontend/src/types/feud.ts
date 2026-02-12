/**
 * Survey Showdown (Feud) — page stack checkpoints and state.
 * Explicit session state: lobby (STANDBY/R1_TITLE) -> collecting (R1_COLLECT) -> locked (R1_LOCKED) -> reveal (R1_BOARD_*) -> summary (R1_SUMMARY).
 * @see docs/ACTIVITY-ROOM-SPEC.md §8.1
 */

export const FEUD_CHECKPOINTS = [
  'STANDBY',
  'R1_TITLE',
  'R1_COLLECT',
  'R1_LOCKED',
  'R1_BOARD_0',
  'R1_BOARD_1',
  'R1_BOARD_2',
  'R1_BOARD_3',
  'R1_BOARD_4',
  'R1_BOARD_5',
  'R1_BOARD_6',
  'R1_BOARD_7',
  'R1_BOARD_8',
  'R1_SUMMARY',
] as const;

export type FeudCheckpointId = (typeof FEUD_CHECKPOINTS)[number];

export interface FeudBoardItem {
  answer: string;
  count: number;
  points?: number;
  revealed: boolean;
  strike?: boolean;
}

export interface FeudState {
  roundIndex: number;
  checkpointId: FeudCheckpointId;
  prompt: string;
  submissions: { playerId: string; displayName: string; answers: string[] }[];
  locked: boolean;
  topAnswers: FeudBoardItem[];
  showScores: boolean;
  /** Cascade / Bottom drop effects (default OFF; obey Calm) */
  cascadeEffect?: boolean;
  bottomDropEffect?: boolean;
}

export const DEFAULT_FEUD_STATE: FeudState = {
  roundIndex: 1,
  checkpointId: 'R1_TITLE',
  prompt: '',
  submissions: [],
  locked: false,
  topAnswers: [],
  showScores: true,
};
