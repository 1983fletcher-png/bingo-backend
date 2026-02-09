/**
 * Stub packs for remaining preset types — minimal Q set so pack picker shows all 8 presets.
 * Expand with full content later.
 */
import type { TriviaPackModel, TriviaQuestionModel } from '../../lib/models';

const now = new Date().toISOString();

const stubQuestions: TriviaQuestionModel[] = [
  {
    id: 'stub-1',
    type: 'mc',
    prompt: 'Sample question (stub pack).',
    difficulty: 'easy',
    timeLimitSec: 30,
    scoring: { basePoints: 1 },
    answer: {
      correct: 'A',
      options: [
        { id: 'A', text: 'Correct' },
        { id: 'B', text: 'Wrong' },
      ],
    },
    sources: [{ url: 'https://example.com', retrievedAt: now, snippet: 'Stub', tier: 'C' }],
    flags: {},
  },
];

function stubPack(overrides: Partial<TriviaPackModel> & { id: string; title: string; presetType: TriviaPackModel['presetType'] }): TriviaPackModel {
  return {
    durationMinutes: 30,
    audienceRating: 'pg13',
    themeTags: [],
    includesMedia: false,
    verified: false,
    verificationLevel: 'draft',
    createdAt: now,
    updatedAt: now,
    questions: stubQuestions,
    ...overrides,
  };
}

export const weeklyBarExtendedStub = stubPack({
  id: 'weekly-bar-extended-stub',
  title: 'Weekly Bar Trivia – Extended',
  presetType: 'weekly_bar_extended',
  durationMinutes: 120,
  themeTags: ['bar', 'extended'],
});

export const quickHappyHourStub = stubPack({
  id: 'quick-happy-hour-stub',
  title: 'Quick Happy Hour',
  presetType: 'quick_bar_happy_hour',
  durationMinutes: 30,
  themeTags: ['bar', 'quick'],
});

export const displayAutomatedStub = stubPack({
  id: 'display-automated-stub',
  title: 'Display Automated',
  presetType: 'display_automated',
  durationMinutes: 45,
  displayOnly: true,
  themeTags: ['display', 'automated'],
});

export const themeNightStub = stubPack({
  id: 'theme-night-stub',
  title: 'Theme Night',
  presetType: 'theme_night_fan',
  durationMinutes: 60,
  themeTags: ['theme', 'fan'],
});

export const familyFriendlyStub = stubPack({
  id: 'family-friendly-stub',
  title: 'Family-Friendly',
  presetType: 'family_friendly',
  durationMinutes: 45,
  audienceRating: 'family',
  themeTags: ['family'],
});

export const speedTriviaStub = stubPack({
  id: 'speed-trivia-stub',
  title: 'Speed Trivia',
  presetType: 'speed_trivia',
  durationMinutes: 20,
  speedBonusDefault: true,
  themeTags: ['speed'],
});

export const seasonalStub = stubPack({
  id: 'seasonal-stub',
  title: 'Seasonal / Holiday',
  presetType: 'seasonal_holiday',
  durationMinutes: 45,
  themeTags: ['seasonal', 'holiday'],
});
