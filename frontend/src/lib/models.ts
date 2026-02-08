/**
 * Canonical Trivia Room models — Host Room state machine, packs, trust pipeline.
 * See docs/TRIVIA-ROOM-IMPLEMENTATION.md for full spec and phases.
 */

// —— Preset & pack ——

export type PresetType =
  | 'weekly_bar_classic'
  | 'weekly_bar_extended'
  | 'quick_bar_happy_hour'
  | 'display_automated'
  | 'theme_night_fan'
  | 'family_friendly'
  | 'speed_trivia'
  | 'seasonal_holiday';

export type AudienceRating = 'family' | 'pg13' | 'adult';

export type VerificationLevel = 'verified' | 'review_required' | 'draft';

export interface RoundSpec {
  id: string;
  name: string;
  questionCount: number;
  difficultyRamp?: 'easy' | 'medium' | 'hard';
}

export interface TriviaSource {
  url: string;
  retrievedAt: string; // ISO
  snippet: string;
  tier?: 'A' | 'B' | 'C';
}

export interface TriviaQuestionFlags {
  timeSensitive?: boolean;
  ambiguity?: boolean;
  needsReview?: boolean;
}

export type QuestionType = 'mc' | 'tf' | 'short' | 'numeric' | 'list' | 'image' | 'audio';

export interface McTfAnswer {
  correct: string; // option id for mc, "true"|"false" for tf
  options?: { id: string; text: string }[];
}

export interface ShortAnswer {
  primary: string;
  acceptedVariants: string[];
  gradingMode: 'flexible' | 'exact' | 'host_review';
}

export interface NumericAnswer {
  value: number;
  mode: 'exact' | 'closest';
  tolerance?: number;
}

export interface ListAnswer {
  acceptedItems: string[];
  maxCount: number;
  perItemPoints: number;
}

export type AnswerSpec = McTfAnswer | ShortAnswer | NumericAnswer | ListAnswer;

export interface TriviaQuestionHostNotes {
  mcTip?: string;
  banter?: string;
  funFact?: string;
}

export interface TriviaQuestionModel {
  id: string;
  type: QuestionType;
  prompt: string;
  media?: { kind: 'image' | 'audio'; url: string; attribution?: string; license?: string };
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimitSec?: number;
  scoring: {
    basePoints: number;
    speedBonusEnabled?: boolean;
    wagerEnabled?: boolean;
  };
  answer: AnswerSpec;
  hostNotes?: TriviaQuestionHostNotes;
  sources: TriviaSource[];
  flags?: TriviaQuestionFlags;
  asOfDate?: string; // ISO; required for verified if timeSensitive
}

export interface TriviaPackModel {
  id: string;
  title: string;
  presetType: PresetType;
  durationMinutes: number;
  audienceRating: AudienceRating;
  themeTags: string[];
  includesMedia: boolean;
  verified: boolean;
  verificationLevel: VerificationLevel;
  createdAt: string;
  updatedAt: string;
  rounds?: RoundSpec[];
  questions: TriviaQuestionModel[];
  /** Display-only automated: no join required, loop Q→timer→answer→fun fact */
  displayOnly?: boolean;
  /** Final wager enabled for last question */
  finalWagerEnabled?: boolean;
  /** Default speed bonus for pack */
  speedBonusDefault?: boolean;
}

// —— Room state machine ——

export type RoomState =
  | 'ROOM_CREATED'
  | 'WAITING_ROOM'
  | 'READY_CHECK'
  | 'ACTIVE_ROUND'
  | 'REVEAL'
  | 'LEADERBOARD'
  | 'REVIEW'
  | 'END_ROOM';

export interface RoomSettings {
  leaderboardsVisibleToPlayers: boolean;
  leaderboardsVisibleOnDisplay: boolean;
  mcTipsEnabled: boolean;
  autoAdvanceEnabled: boolean;
  speedBonusEnabled: boolean;
  finalWagerCap?: number;
}

export interface RoomRuntime {
  currentQuestionIndex: number;
  roundIndex?: number;
  questionStartAt?: string;
  revealAt?: string;
  endedAt?: string;
}

export interface RoomModel {
  roomId: string;
  createdAt: string;
  state: RoomState;
  mode: 'trivia';
  packId: string;
  hostId: string;
  settings: RoomSettings;
  runtime: RoomRuntime;
}

// —— Player & response ——

export interface PlayerModel {
  playerId: string;
  displayName: string;
  isAnonymous: boolean;
  joinedAt: string;
  lastSeenAt: string;
  score: number;
  correctCount: number;
  answeredCount: number;
}

export interface ResponseModel {
  roomId: string;
  questionId: string;
  playerId: string;
  submittedAt: string;
  payload: unknown;
  isCorrect?: boolean;
  pointsAwarded?: number;
  normalizedAnswer?: string;
}

// —— Realtime contract (client ↔ server) ——

export interface JoinRoomPayload {
  roomId: string;
  role: 'host' | 'player' | 'display';
  playerId?: string;
  displayName?: string;
  isAnonymous?: boolean;
}

export interface RoomSnapshotPayload {
  room: RoomModel;
  players: PlayerModel[];
  currentQuestion: TriviaQuestionModel | null;
  responsesCount: number;
  leaderboardTop: PlayerModel[];
  pack?: TriviaPackModel;
}

export interface HostSetStatePayload {
  roomId: string;
  nextState: RoomState;
}

export interface SubmitResponsePayload {
  roomId: string;
  questionId: string;
  playerId: string;
  payload: unknown;
  wager?: number;
}

export interface HostDisputeResolvePayload {
  roomId: string;
  questionId: string;
  action: 'confirm' | 'accept_variant' | 'void';
  variantText?: string;
}

// —— State transition helpers ——

export const ROOM_STATE_ORDER: RoomState[] = [
  'ROOM_CREATED',
  'WAITING_ROOM',
  'READY_CHECK',
  'ACTIVE_ROUND',
  'REVEAL',
  'LEADERBOARD',
  'REVIEW',
  'END_ROOM',
];

export function canTransitionTo(from: RoomState, to: RoomState): boolean {
  const i = ROOM_STATE_ORDER.indexOf(from);
  const j = ROOM_STATE_ORDER.indexOf(to);
  if (i < 0 || j < 0) return false;
  // Allow same state (no-op) and forward/back for LEADERBOARD/REVIEW
  if (to === 'ACTIVE_ROUND' && (from === 'REVEAL' || from === 'LEADERBOARD' || from === 'READY_CHECK')) return true;
  if (to === 'LEADERBOARD' && (from === 'REVEAL' || from === 'ACTIVE_ROUND')) return true;
  if (to === 'REVIEW' && from === 'LEADERBOARD') return true;
  if (to === 'END_ROOM' && (from === 'REVIEW' || from === 'LEADERBOARD' || from === 'WAITING_ROOM')) return true;
  if (to === 'REVEAL' && from === 'ACTIVE_ROUND') return true;
  if (to === 'READY_CHECK' && from === 'WAITING_ROOM') return true;
  if (to === 'WAITING_ROOM' && from === 'ROOM_CREATED') return true;
  return j === i + 1;
}

export function isStartButtonEnabled(state: RoomState, packLoaded: boolean, hostConnected: boolean): boolean {
  return state === 'READY_CHECK' && packLoaded && hostConnected;
}

export function isRevealButtonEnabled(state: RoomState): boolean {
  return state === 'ACTIVE_ROUND';
}

export function isNextButtonEnabled(state: RoomState): boolean {
  return state === 'REVEAL' || state === 'LEADERBOARD' || state === 'REVIEW';
}
