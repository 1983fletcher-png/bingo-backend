/** Single trivia question */
export interface TriviaQuestion {
  question: string;
  correctAnswer: string;
  points?: number;
  /** Host-only: timing, accept alternate answers, discussion prompts */
  hostNotes?: string;
  /** Optional fun fact or extra tidbit to share after revealing the answer */
  funFact?: string;
  /** Optional category for filtering/display (e.g. Geography, Pop Culture). Difficulty is host-dependent. */
  category?: string;
}

/** Round structure for session templates (e.g. bar: 8 + 10 + 10 + 10 + 10) */
export interface TriviaRoundInfo {
  name: string;
  questionCount: number;
}

/** Pack metadata + questions (20–30+ per pack for longer games) */
export interface TriviaPack {
  id: string;
  title: string;
  description?: string;
  questions: TriviaQuestion[];
  /** Optional round breakdown for builder/session display */
  rounds?: TriviaRoundInfo[];
}
