/**
 * Survey Showdown (Feud) — authoritative session state types.
 * Live submissions + reveal wiring.
 */

export type FeudPhase = 'collect' | 'reveal' | 'summary';

export type FeudSubmission = {
  id: string;
  playerId: string;
  nickname: string;
  text: string;
  ts: number;
};

export type FeudCluster = {
  id: string;
  canonical: string;
  variants: string[];
  count: number;
  revealed: boolean;
  points?: number;
};

export type FeudSettings = {
  topN: number;
  allowUpTo: number;
  showScores: boolean;
  cascade: boolean;
  bottomDrop: boolean;
};

export type FeudSessionState = {
  roomCode: string;
  title: 'Survey Showdown';
  prompt: string;
  round: number;
  phase: FeudPhase;
  submissionsOpen: boolean;
  submissions: FeudSubmission[];
  clusters: FeudCluster[];
  settings: FeudSettings;
  themeOverride?: {
    theme?: string;
    scene?: string;
    motion?: string;
  };
};
