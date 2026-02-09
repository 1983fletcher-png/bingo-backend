/**
 * Weekly Bar Trivia – Extended (120 min). Longer, harder bar trivia. Full question set.
 */
import type { TriviaPackModel, TriviaQuestionModel } from '../../lib/models';

const now = new Date().toISOString();

function mc(id: string, prompt: string, correct: string, options: { id: string; text: string }[], difficulty: 'easy' | 'medium' | 'hard' = 'easy', points = 1): TriviaQuestionModel {
  return {
    id,
    type: 'mc',
    prompt,
    difficulty,
    timeLimitSec: difficulty === 'hard' ? 45 : difficulty === 'medium' ? 35 : 25,
    scoring: { basePoints: points, speedBonusEnabled: points > 1 },
    answer: { correct, options },
    hostNotes: { funFact: 'Bar trivia.' },
    sources: [{ url: 'https://example.com/bar', retrievedAt: now, snippet: 'Bar trivia', tier: 'B' }],
    flags: {},
  };
}

function tf(id: string, prompt: string, correct: 'true' | 'false', difficulty: 'easy' | 'medium' | 'hard' = 'easy'): TriviaQuestionModel {
  return {
    id,
    type: 'tf',
    prompt,
    difficulty,
    timeLimitSec: 20,
    scoring: { basePoints: 1 },
    answer: { correct, options: [{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }] },
    hostNotes: { funFact: 'Bar trivia.' },
    sources: [{ url: 'https://example.com/bar', retrievedAt: now, snippet: 'Bar trivia', tier: 'B' }],
    flags: {},
  };
}

const questions: TriviaQuestionModel[] = [
  mc('wbe-1', 'What is the capital of Japan?', 'B', [
    { id: 'A', text: 'Seoul' }, { id: 'B', text: 'Tokyo' }, { id: 'C', text: 'Beijing' }, { id: 'D', text: 'Bangkok' },
  ]),
  tf('wbe-2', 'The Nile is the longest river in the world.', 'true'),
  mc('wbe-3', 'Who wrote "Hamlet"?', 'A', [
    { id: 'A', text: 'William Shakespeare' }, { id: 'B', text: 'Charles Dickens' }, { id: 'C', text: 'Jane Austen' }, { id: 'D', text: 'Mark Twain' },
  ]),
  mc('wbe-4', 'In what year did the Titanic sink?', 'B', [
    { id: 'A', text: '1910' }, { id: 'B', text: '1912' }, { id: 'C', text: '1915' }, { id: 'D', text: '1920' },
  ], 'medium', 2),
  tf('wbe-5', 'Light travels in a straight line in a vacuum.', 'true'),
  mc('wbe-6', 'Which country gave the Statue of Liberty to the USA?', 'B', [
    { id: 'A', text: 'United Kingdom' }, { id: 'B', text: 'France' }, { id: 'C', text: 'Italy' }, { id: 'D', text: 'Spain' },
  ]),
  mc('wbe-7', 'What is the smallest prime number?', 'A', [
    { id: 'A', text: '2' }, { id: 'B', text: '1' }, { id: 'C', text: '0' }, { id: 'D', text: '3' },
  ]),
  tf('wbe-8', 'The human heart has four chambers.', 'true'),
  mc('wbe-9', 'Which planet is known as the "Giant Red Spot"?', 'B', [
    { id: 'A', text: 'Mars' }, { id: 'B', text: 'Jupiter' }, { id: 'C', text: 'Saturn' }, { id: 'D', text: 'Neptune' },
  ], 'medium', 2),
  mc('wbe-10', 'Who painted the Sistine Chapel ceiling?', 'B', [
    { id: 'A', text: 'Leonardo da Vinci' }, { id: 'B', text: 'Michelangelo' }, { id: 'C', text: 'Raphael' }, { id: 'D', text: 'Donatello' },
  ], 'medium', 2),
  tf('wbe-11', 'DNA stands for deoxyribonucleic acid.', 'true'),
  mc('wbe-12', 'Which language is spoken in Brazil?', 'B', [
    { id: 'A', text: 'Spanish' }, { id: 'B', text: 'Portuguese' }, { id: 'C', text: 'French' }, { id: 'D', text: 'Italian' },
  ]),
  mc('wbe-13', 'What is the chemical symbol for silver?', 'A', [
    { id: 'A', text: 'Ag' }, { id: 'B', text: 'Au' }, { id: 'C', text: 'Fe' }, { id: 'D', text: 'Cu' },
  ], 'medium', 2),
  tf('wbe-14', 'The Great Wall of China is visible from the Moon.', 'false'),
  mc('wbe-15', 'In which continent is the Sahara Desert?', 'A', [
    { id: 'A', text: 'Africa' }, { id: 'B', text: 'Asia' }, { id: 'C', text: 'Australia' }, { id: 'D', text: 'South America' },
  ]),
  mc('wbe-16', 'Who developed the theory of general relativity?', 'B', [
    { id: 'A', text: 'Isaac Newton' }, { id: 'B', text: 'Albert Einstein' }, { id: 'C', text: 'Stephen Hawking' }, { id: 'D', text: 'Niels Bohr' },
  ], 'medium', 2),
  tf('wbe-17', 'A hexagon has six sides.', 'true'),
  mc('wbe-18', 'Which country is home to the Acropolis?', 'C', [
    { id: 'A', text: 'Italy' }, { id: 'B', text: 'Turkey' }, { id: 'C', text: 'Greece' }, { id: 'D', text: 'Egypt' },
  ]),
  mc('wbe-19', 'What is the hardest natural substance on Earth?', 'B', [
    { id: 'A', text: 'Gold' }, { id: 'B', text: 'Diamond' }, { id: 'C', text: 'Platinum' }, { id: 'D', text: 'Titanium' },
  ], 'medium', 2),
  tf('wbe-20', 'The speed of light is approximately 300,000 km/s.', 'true'),
  mc('wbe-21', 'Who wrote "Pride and Prejudice"?', 'C', [
    { id: 'A', text: 'Emily Brontë' }, { id: 'B', text: 'Charlotte Brontë' }, { id: 'C', text: 'Jane Austen' }, { id: 'D', text: 'Mary Shelley' },
  ], 'medium', 2),
  mc('wbe-22', 'Which organ in the body filters blood and produces urine?', 'B', [
    { id: 'A', text: 'Liver' }, { id: 'B', text: 'Kidney' }, { id: 'C', text: 'Heart' }, { id: 'D', text: 'Lung' },
  ]),
  tf('wbe-23', 'The Amazon River is in South America.', 'true'),
  mc('wbe-24', 'In what year did World War I begin?', 'B', [
    { id: 'A', text: '1912' }, { id: 'B', text: '1914' }, { id: 'C', text: '1916' }, { id: 'D', text: '1918' },
  ], 'medium', 2),
  mc('wbe-25', 'What is the main gas in Earth\'s atmosphere?', 'A', [
    { id: 'A', text: 'Nitrogen' }, { id: 'B', text: 'Oxygen' }, { id: 'C', text: 'Carbon dioxide' }, { id: 'D', text: 'Argon' },
  ], 'medium', 2),
  tf('wbe-26', 'Octopuses have three hearts.', 'true'),
  mc('wbe-27', 'Which country invented paper?', 'B', [
    { id: 'A', text: 'Japan' }, { id: 'B', text: 'China' }, { id: 'C', text: 'Egypt' }, { id: 'D', text: 'India' },
  ]),
  mc('wbe-28', 'What is the largest internal organ in the human body?', 'A', [
    { id: 'A', text: 'Liver' }, { id: 'B', text: 'Brain' }, { id: 'C', text: 'Heart' }, { id: 'D', text: 'Kidney' },
  ]),
  tf('wbe-29', 'The Moon has its own light.', 'false'),
  mc('wbe-30', 'Who discovered penicillin?', 'B', [
    { id: 'A', text: 'Louis Pasteur' }, { id: 'B', text: 'Alexander Fleming' }, { id: 'C', text: 'Marie Curie' }, { id: 'D', text: 'Robert Koch' },
  ], 'hard', 2),
];

export const weeklyBarExtendedPack: TriviaPackModel = {
  id: 'weekly-bar-extended-stub',
  title: 'Weekly Bar Trivia – Extended',
  presetType: 'weekly_bar_extended',
  durationMinutes: 120,
  audienceRating: 'pg13',
  themeTags: ['bar', 'extended'],
  includesMedia: false,
  verified: true,
  verificationLevel: 'verified',
  createdAt: now,
  updatedAt: now,
  questions,
  finalWagerEnabled: true,
};
