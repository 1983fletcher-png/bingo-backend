/**
 * Activity Room presets: brewery, senior, school, corporate, sensory-friendly.
 * Apply defaults to theme, pacing, identity, scoring, printables.
 * @see docs/ACTIVITY-ROOM-SPEC.md §5
 */
export type PresetId = 'brewery' | 'senior' | 'school' | 'corporate' | 'sensory-friendly';

export interface ActivityPreset {
  id: PresetId;
  label: string;
  /** Display theme: calm recommended or default for sensory-friendly */
  displayThemeId: 'classic' | 'calm' | 'corporate';
  /** No-score default for senior/sensory-friendly */
  noScoreDefault?: boolean;
  /** Host tips (v1 text) */
  hostTips: string[];
}

export const ACTIVITY_PRESETS: ActivityPreset[] = [
  {
    id: 'brewery',
    label: 'Brewery / Venue',
    displayThemeId: 'classic',
    hostTips: [
      'Use the Display theme "Playroom Classic" for a flashy look.',
      'Keep join count visible on the Host view so you know when to start.',
      'Turn on Cascade/Bottom drop for extra energy if the room likes it.',
    ],
  },
  {
    id: 'senior',
    label: 'Senior Activities',
    displayThemeId: 'calm',
    noScoreDefault: true,
    hostTips: [
      'Use the "Calm" theme to reduce motion and flash.',
      'Emphasize printables so participants can follow along on paper.',
      'Slower pacing: give extra time for answers and reveals.',
    ],
  },
  {
    id: 'school',
    label: 'School',
    displayThemeId: 'classic',
    hostTips: [
      'Hybrid identity (real ID for host, nickname on screen) is recommended.',
      'Use Host approval for names before they appear on the TV.',
      'Assessment mode is available for graded activities.',
    ],
  },
  {
    id: 'corporate',
    label: 'Corporate',
    displayThemeId: 'corporate',
    hostTips: [
      'Use the "Corporate" theme for a professional look.',
      'Insights and exports help with follow-up and reporting.',
      'All-Ages moderation is the default.',
    ],
  },
  {
    id: 'sensory-friendly',
    label: 'Sensory-Friendly / Accessible',
    displayThemeId: 'calm',
    noScoreDefault: true,
    hostTips: [
      'Calm mode is ON by default: reduced motion and reduced audio.',
      'Slower pacing and no-score default keep the focus on participation.',
      'Offer a practice round so everyone can try without pressure.',
    ],
  },
];

export function getPreset(id: PresetId | string): ActivityPreset | undefined {
  return ACTIVITY_PRESETS.find((p) => p.id === id);
}
