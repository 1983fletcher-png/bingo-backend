/**
 * Icebreaker packs — prompts and activities for get-to-know-you, team building, and mixers.
 * Used when gameType is 'icebreaker' or in team-building flows (future).
 */

export interface IcebreakerPrompt {
  id: string;
  text: string;
  /** Optional category for filtering */
  category?: 'corporate' | 'social' | 'remote' | 'onboarding' | 'fun';
}

export interface IcebreakerPack {
  id: string;
  title: string;
  description: string;
  prompts: IcebreakerPrompt[];
}

const corporatePrompts: IcebreakerPrompt[] = [
  { id: 'c1', text: "What's one small win you had this week?", category: 'corporate' },
  { id: 'c2', text: "What's the best piece of advice you've received at work?", category: 'corporate' },
  { id: 'c3', text: "What's one thing you're looking forward to this month?", category: 'corporate' },
  { id: 'c4', text: "What's your go-to way to recharge after a busy day?", category: 'corporate' },
  { id: 'c5', text: "What's a skill you're currently learning or want to learn?", category: 'corporate' },
  { id: 'c6', text: "What's one word that describes how you're feeling about the team right now?", category: 'corporate' },
  { id: 'c7', text: "What's a communication style that works best for you?", category: 'corporate' },
  { id: 'c8', text: "What's one thing that would make our meetings more effective?", category: 'corporate' },
];

const socialPrompts: IcebreakerPrompt[] = [
  { id: 's1', text: "If you could have dinner with anyone (living or historical), who and why?", category: 'social' },
  { id: 's2', text: "What's your go-to karaoke song?", category: 'social' },
  { id: 's3', text: "What's a hobby you've picked up in the last year?", category: 'social' },
  { id: 's4', text: "Beach or mountains?", category: 'social' },
  { id: 's5', text: "Coffee or tea?", category: 'social' },
  { id: 's6', text: "What's the best snack?", category: 'social' },
  { id: 's7', text: "What's one word that describes you?", category: 'social' },
  { id: 's8', text: "What's a movie or show you could rewatch forever?", category: 'social' },
];

const remotePrompts: IcebreakerPrompt[] = [
  { id: 'r1', text: "What's in the background of your workspace (or what would you want)?", category: 'remote' },
  { id: 'r2', text: "What's one thing you miss about being in an office (or love about remote)?", category: 'remote' },
  { id: 'r3', text: "What's your favorite way to start the workday?", category: 'remote' },
  { id: 'r4', text: "What's one word for how you're feeling right now?", category: 'remote' },
  { id: 'r5', text: "What's a small ritual that helps you focus?", category: 'remote' },
];

const onboardingPrompts: IcebreakerPrompt[] = [
  { id: 'o1', text: "What's your name and one fun fact about you?", category: 'onboarding' },
  { id: 'o2', text: "What's your role and one thing you're excited to work on?", category: 'onboarding' },
  { id: 'o3', text: "What's something you're really good at that might surprise people?", category: 'onboarding' },
  { id: 'o4', text: "Where are you from or where do you call home?", category: 'onboarding' },
  { id: 'o5', text: "What's the best thing that happened to you this week?", category: 'onboarding' },
];

export const icebreakerPacks: IcebreakerPack[] = [
  {
    id: 'corporate',
    title: 'Corporate & Teams',
    description: 'Wins, advice, and light reflection for work groups',
    prompts: corporatePrompts,
  },
  {
    id: 'social',
    title: 'Social & Mixers',
    description: 'Fun, would-you-rather style and favorites',
    prompts: socialPrompts,
  },
  {
    id: 'remote',
    title: 'Remote & Hybrid',
    description: 'Check-ins and rituals for distributed teams',
    prompts: remotePrompts,
  },
  {
    id: 'onboarding',
    title: 'Onboarding & New Teams',
    description: 'Introductions and one fun fact',
    prompts: onboardingPrompts,
  },
  {
    id: 'mixed',
    title: 'Mix It Up',
    description: 'Blend of corporate, social, and fun',
    prompts: [...corporatePrompts.slice(0, 3), ...socialPrompts.slice(0, 3), ...remotePrompts.slice(0, 2)],
  },
];

export const defaultIcebreakerPack = icebreakerPacks[0];
