/** Single trivia question */
export interface TriviaQuestion {
  question: string;
  correctAnswer: string;
  points?: number;
}

/** Pack metadata + questions (20–30+ per pack for longer games) */
export interface TriviaPack {
  id: string;
  title: string;
  description?: string;
  questions: TriviaQuestion[];
}
