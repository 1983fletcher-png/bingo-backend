/**
 * Team building activities — structured formats for host-led sessions.
 * Complements icebreakers with slightly more structure (e.g. two truths and a lie, polls).
 */

export type ActivityType = 'two-truths' | 'prompt' | 'poll' | 'word-cloud' | 'would-you-rather';

export interface TeamBuildingActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  /** Estimated minutes */
  duration: number;
  /** Instructions for the host */
  hostInstructions: string;
  /** Optional prompt text for players */
  defaultPrompt?: string;
}

export const teamBuildingActivities: TeamBuildingActivity[] = [
  {
    id: 'two-truths',
    type: 'two-truths',
    title: 'Two Truths and a Lie',
    description: 'Each person shares three statements; the group guesses which one is the lie.',
    duration: 15,
    hostInstructions: 'Ask each person (or volunteer) to share three statements about themselves—two true, one false. Others guess the lie. Reveal after votes.',
    defaultPrompt: 'Share two truths and one lie about yourself.',
  },
  {
    id: 'one-word',
    type: 'word-cloud',
    title: 'One-Word Check-In',
    description: 'Everyone submits one word; display as a word cloud or list.',
    duration: 5,
    hostInstructions: 'Ask a focus (e.g. "How are you feeling?" or "One word for the project"). Collect responses and show the word cloud or list.',
    defaultPrompt: 'One word that describes how you\'re feeling right now.',
  },
  {
    id: 'would-you-rather',
    type: 'would-you-rather',
    title: 'Would You Rather',
    description: 'Binary poll: everyone picks A or B; show results and briefly discuss.',
    duration: 10,
    hostInstructions: 'Pose a "Would you rather X or Y?" question. Players vote; show results. Optional: ask one or two people to share why.',
    defaultPrompt: 'Would you rather coffee or tea?',
  },
  {
    id: 'small-win',
    type: 'prompt',
    title: 'Small Win Share',
    description: 'Each person shares one small win from the week.',
    duration: 10,
    hostInstructions: 'Ask everyone to share one small win (work or personal). Go in order or let volunteers speak.',
    defaultPrompt: "What's one small win you had this week?",
  },
  {
    id: 'quick-poll',
    type: 'poll',
    title: 'Quick Poll',
    description: 'Single multiple-choice or binary question; show live results.',
    duration: 5,
    hostInstructions: 'Ask one question with 2–5 options. Players vote; reveal results and optionally discuss.',
    defaultPrompt: 'Which best describes your morning? (Early bird / Night owl / Depends)',
  },
];
