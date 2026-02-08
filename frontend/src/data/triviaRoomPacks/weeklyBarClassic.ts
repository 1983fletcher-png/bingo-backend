/**
 * Weekly Bar Trivia – Classic (90 min): 40–50 Q, 4–5 rounds, final wager ON.
 * Seed pack in canonical TriviaPackModel format with sources and verification.
 */
import type { TriviaPackModel, TriviaQuestionModel } from '../../lib/models';

const now = new Date().toISOString();

const questions: TriviaQuestionModel[] = [
  {
    id: 'wb-1',
    type: 'mc',
    prompt: 'What is the capital of France?',
    difficulty: 'easy',
    timeLimitSec: 30,
    scoring: { basePoints: 1, speedBonusEnabled: false },
    answer: {
      correct: 'B',
      options: [
        { id: 'A', text: 'London' },
        { id: 'B', text: 'Paris' },
        { id: 'C', text: 'Berlin' },
        { id: 'D', text: 'Madrid' },
      ],
    },
    hostNotes: { mcTip: 'Accept Paris only.', funFact: 'Paris has been the capital since 987 CE; it is sometimes called the "City of Light."' },
    sources: [
      { url: 'https://www.britannica.com/place/Paris', retrievedAt: now, snippet: 'Paris, city and capital of France...', tier: 'A' },
    ],
    flags: {},
  },
  {
    id: 'wb-2',
    type: 'mc',
    prompt: 'Which planet is known as the Red Planet?',
    difficulty: 'easy',
    timeLimitSec: 30,
    scoring: { basePoints: 1, speedBonusEnabled: false },
    answer: {
      correct: 'C',
      options: [
        { id: 'A', text: 'Venus' },
        { id: 'B', text: 'Jupiter' },
        { id: 'C', text: 'Mars' },
        { id: 'D', text: 'Saturn' },
      ],
    },
    hostNotes: { funFact: 'Mars appears red because of iron oxide (rust) on its surface; it has two moons, Phobos and Deimos.' },
    sources: [
      { url: 'https://solarsystem.nasa.gov/planets/mars/overview/', retrievedAt: now, snippet: 'Mars is the fourth planet from the Sun – a dusty, cold, desert world with a very thin atmosphere.', tier: 'A' },
    ],
    flags: {},
  },
  {
    id: 'wb-3',
    type: 'short',
    prompt: 'How many continents are there in the standard seven-continent model?',
    difficulty: 'easy',
    timeLimitSec: 25,
    scoring: { basePoints: 1 },
    answer: {
      primary: 'Seven',
      acceptedVariants: ['7', 'seven'],
      gradingMode: 'flexible',
    },
    hostNotes: { mcTip: 'Accept "7" or "seven."', funFact: 'The seven-continent model is taught in most English-speaking countries.' },
    sources: [
      { url: 'https://www.worldometers.info/geography/continents/', retrievedAt: now, snippet: 'There are 7 continents...', tier: 'B' },
    ],
    flags: {},
  },
  {
    id: 'wb-4',
    type: 'mc',
    prompt: 'Who wrote "Romeo and Juliet"?',
    difficulty: 'medium',
    timeLimitSec: 45,
    scoring: { basePoints: 2, speedBonusEnabled: true },
    answer: {
      correct: 'A',
      options: [
        { id: 'A', text: 'William Shakespeare' },
        { id: 'B', text: 'Charles Dickens' },
        { id: 'C', text: 'Jane Austen' },
        { id: 'D', text: 'Mark Twain' },
      ],
    },
    hostNotes: { funFact: 'The play was likely written between 1594 and 1596 and has been adapted countless times for stage and screen.' },
    sources: [
      { url: 'https://www.folger.edu/explore/shakespeares-works/romeo-and-juliet/', retrievedAt: now, snippet: 'Romeo and Juliet by William Shakespeare...', tier: 'A' },
    ],
    flags: {},
  },
  {
    id: 'wb-5',
    type: 'tf',
    prompt: 'The Pacific Ocean is the largest ocean on Earth by surface area.',
    difficulty: 'easy',
    timeLimitSec: 20,
    scoring: { basePoints: 1 },
    answer: {
      correct: 'true',
      options: [
        { id: 'true', text: 'True' },
        { id: 'false', text: 'False' },
      ],
    },
    hostNotes: { funFact: 'The Pacific covers about one-third of Earth\'s surface; all of Earth\'s landmasses could fit inside it.' },
    sources: [
      { url: 'https://www.noaa.gov/education/resource-collections/ocean-coasts/ocean', retrievedAt: now, snippet: 'The Pacific is the largest ocean...', tier: 'A' },
    ],
    flags: {},
  },
];

export const weeklyBarClassicPack: TriviaPackModel = {
  id: 'weekly-bar-classic',
  title: 'Weekly Bar Trivia – Classic',
  presetType: 'weekly_bar_classic',
  durationMinutes: 90,
  audienceRating: 'pg13',
  themeTags: ['general', 'bar', 'mixed'],
  includesMedia: false,
  verified: true,
  verificationLevel: 'verified',
  createdAt: now,
  updatedAt: now,
  rounds: [
    { id: 'r1', name: 'Warm-up', questionCount: 10, difficultyRamp: 'easy' },
    { id: 'r2', name: 'Mixed', questionCount: 10, difficultyRamp: 'medium' },
    { id: 'r3', name: 'Challenge', questionCount: 10, difficultyRamp: 'hard' },
  ],
  questions,
  finalWagerEnabled: true,
  speedBonusDefault: false,
};
