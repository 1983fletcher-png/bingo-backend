/**
 * Survey Showdown (Feud) — page stack checkpoints and state.
 * Explicit round phases: SET_PROMPT -> COLLECTING -> LOCKED -> REVEALING -> SUMMARY.
 * Checkpoint IDs map to these phases for host/display UI.
 * @see docs/ACTIVITY-ROOM-SPEC.md §8.1
 */

/** High-level round phases for UI labels and flow */
export const FEUD_PHASES = [
  'SET_PROMPT',   // Host sets prompt; display shows title (STANDBY / R1_TITLE)
  'COLLECTING',   // Submissions open (R1_COLLECT)
  'LOCKED',       // Submissions closed, computing board (R1_LOCKED)
  'REVEALING',    // Revealing top answers one by one (R1_BOARD_0 … R1_BOARD_8)
  'SUMMARY',      // Round summary (R1_SUMMARY)
] as const;

export type FeudPhase = (typeof FEUD_PHASES)[number];

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

/** Map checkpoint to phase for display/host labels */
export function feudCheckpointToPhase(checkpointId: FeudCheckpointId): FeudPhase {
  if (checkpointId === 'STANDBY' || checkpointId === 'R1_TITLE') return 'SET_PROMPT';
  if (checkpointId === 'R1_COLLECT') return 'COLLECTING';
  if (checkpointId === 'R1_LOCKED') return 'LOCKED';
  if (checkpointId.startsWith('R1_BOARD_')) return 'REVEALING';
  if (checkpointId === 'R1_SUMMARY') return 'SUMMARY';
  return 'SET_PROMPT';
}

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
