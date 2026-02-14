/**
 * Crowd Control Trivia — local question bank from seed (playroom.trivia_seed.v1).
 * Board 0 = Crowd Pleasers; categories × value ladder; question lookup by id.
 */
import seed from './trivia-seed-v1.json';

/** Display values for tiles (100–500). Question IDs in seed still use 200–600; valueIndex 0→100, 1→200, etc. */
export const VALUE_LADDER = [100, 200, 300, 400, 500] as const;

type SeedBoard = {
  board_id: string;
  name: string;
  categories: string[];
  question_ids: string[];
};
type SeedQuestion = {
  id: string;
  value: number;
  questionType: string;
  prompt_variants: Array<{
    variant_id: string;
    prompt_text: string;
    answer_spec: { correct_answer: string; options?: string[] };
    explanation_short?: string;
    citation_url?: string;
  }>;
};

const boards: SeedBoard[] = seed.boards ?? [];
const questionsList: SeedQuestion[] = seed.questions ?? [];

const questionsById = new Map<string, SeedQuestion>();
for (const q of questionsList) {
  if (q.id) questionsById.set(q.id, q);
}

export interface CCTQuestionDisplay {
  id: string;
  prompt: string;
  options: string[] | null;
  correctAnswer: string;
  explanation?: string;
  citation?: string;
}

export function getBoard(boardIndex: number): { name: string; categories: string[]; questionIds: string[] } | null {
  const b = boards[boardIndex];
  if (!b) return null;
  return {
    name: b.name ?? '',
    categories: Array.isArray(b.categories) ? b.categories : [],
    questionIds: Array.isArray(b.question_ids) ? b.question_ids : []
  };
}

export function getQuestion(questionId: string | null): CCTQuestionDisplay | null {
  if (!questionId) return null;
  const q = questionsById.get(questionId);
  if (!q || !q.prompt_variants?.[0]) return null;
  const v = q.prompt_variants[0];
  const spec = v.answer_spec ?? {};
  const options = Array.isArray(spec.options) ? spec.options : null;
  return {
    id: q.id,
    prompt: v.prompt_text ?? '',
    options,
    correctAnswer: spec.correct_answer ?? '',
    explanation: v.explanation_short,
    citation: v.citation_url
  };
}

export function getQuestionIdForSlot(boardIndex: number, categoryIndex: number, valueIndex: number): string | null {
  const board = getBoard(boardIndex);
  if (!board || valueIndex < 0 || valueIndex >= 5) return null;
  const idx = categoryIndex * 5 + valueIndex;
  return board.questionIds[idx] ?? null;
}
