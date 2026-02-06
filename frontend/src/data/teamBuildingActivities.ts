/**
 * Team building activities — structured formats for host-led sessions.
 * Extensive set: Two Truths, Would You Rather, Quick Energizers, Polls, Word Clouds, and Connection exercises.
 */
import type { TriviaPack, TriviaQuestion } from '../types/trivia';

export type ActivityType = 'two-truths' | 'prompt' | 'poll' | 'word-cloud' | 'would-you-rather' | 'energizer' | 'connection';

/** Used to group activities into selectable packs on the host create flow. */
export type TeamBuildingPackId = 'two-truths' | 'would-you-rather' | 'energizers' | 'polls-word-clouds' | 'connection-retro' | 'mix';

export interface TeamBuildingActivity {
  id: string;
  type: ActivityType;
  /** Which pack this activity belongs to (for dropdown). */
  packId: TeamBuildingPackId;
  title: string;
  description: string;
  /** Estimated minutes */
  duration: number;
  /** Instructions for the host */
  hostInstructions: string;
  /** Optional prompt text for players */
  defaultPrompt?: string;
}

const activities: TeamBuildingActivity[] = [
  // —— Two Truths & a Lie ——
  {
    id: 'two-truths-general',
    type: 'two-truths',
    packId: 'two-truths',
    title: 'Two Truths and a Lie (General)',
    description: 'Each person shares three statements about themselves; the group guesses which one is the lie.',
    duration: 15,
    hostInstructions: 'Ask each person (or a few volunteers) to share three statements—two true, one false. Give the group a moment to guess, then have the speaker reveal the lie. Optional: take a quick vote before the reveal.',
    defaultPrompt: 'Share two truths and one lie about yourself. The group will guess the lie.',
  },
  {
    id: 'two-truths-childhood',
    type: 'two-truths',
    packId: 'two-truths',
    title: 'Two Truths and a Lie (Childhood)',
    description: 'Focus on childhood, hometown, or family. Two true stories, one lie; group guesses.',
    duration: 15,
    hostInstructions: 'Ask everyone to think of two true facts and one lie about their childhood, where they grew up, or their family. One person shares at a time; the group guesses the lie. Reveal and briefly discuss.',
    defaultPrompt: 'Two truths and one lie about your childhood or where you grew up.',
  },
  {
    id: 'two-truths-career',
    type: 'two-truths',
    packId: 'two-truths',
    title: 'Two Truths and a Lie (Career)',
    description: 'Statements about jobs, education, or career path. Great for onboarding or cross-team intros.',
    duration: 15,
    hostInstructions: 'Each person shares three statements about their job history, education, or career path—two true, one false. Group guesses; speaker reveals. Good for new teams or mixed departments.',
    defaultPrompt: 'Two truths and one lie about your job, education, or career path.',
  },
  {
    id: 'two-truths-travel',
    type: 'two-truths',
    packId: 'two-truths',
    title: 'Two Truths and a Lie (Travel & Adventures)',
    description: 'Hobbies, travels, or adventures. Two real, one made up.',
    duration: 15,
    hostInstructions: 'Ask for two true and one false statement about travel, hobbies, or something adventurous. Vote on the lie, then reveal. Encourages storytelling.',
    defaultPrompt: 'Two truths and a lie about your hobbies, travels, or adventures.',
  },
  {
    id: 'two-truths-this-year',
    type: 'two-truths',
    packId: 'two-truths',
    title: 'Two Truths and a Lie (This Year)',
    description: 'Something that happened to you in the last 12 months. Two real, one lie.',
    duration: 12,
    hostInstructions: 'Focus on the past year: two things that really happened, one that didn’t. Group guesses; reveal. Good for annual or quarterly kickoffs.',
    defaultPrompt: 'Two truths and a lie about something that happened to you this year.',
  },
  // —— Would You Rather ——
  {
    id: 'wyr-coffee-tea',
    type: 'would-you-rather',
    packId: 'would-you-rather',
    title: 'Would You Rather: Coffee or Tea',
    description: 'Binary poll; discuss why. Quick and universal.',
    duration: 5,
    hostInstructions: 'Pose: "Would you rather have coffee or tea for the rest of your life?" Everyone votes (show hands, poll, or chat). Share a couple of reasons. Light and fast.',
    defaultPrompt: 'Would you rather have coffee or tea for the rest of your life?',
  },
  {
    id: 'wyr-fly-invisible',
    type: 'would-you-rather',
    packId: 'would-you-rather',
    title: 'Would You Rather: Fly or Be Invisible',
    description: 'Classic fun choice; great for energy.',
    duration: 5,
    hostInstructions: 'Ask: "Would you rather be able to fly or be invisible?" Take a vote. Ask one or two people to explain their choice. Keeps the energy up.',
    defaultPrompt: 'Would you rather be able to fly or be invisible?',
  },
  {
    id: 'wyr-meeting-style',
    type: 'would-you-rather',
    packId: 'would-you-rather',
    title: 'Would You Rather: Meeting Style',
    description: 'Long meeting that ends early vs short that runs over. Sparks discussion on norms.',
    duration: 8,
    hostInstructions: 'Pose: "Would you rather have a long meeting that always ends early or a short meeting that often runs over?" Vote and briefly discuss what that says about how we run meetings.',
    defaultPrompt: 'Would you rather have a long meeting that ends early or a short meeting that runs over?',
  },
  {
    id: 'wyr-work-location',
    type: 'would-you-rather',
    packId: 'would-you-rather',
    title: 'Would You Rather: Beach or Cabin',
    description: 'Work from the beach or from a cabin in the mountains.',
    duration: 5,
    hostInstructions: 'Ask: "Would you rather work from the beach or from a cabin in the mountains?" Quick vote; optional short share. Good for remote/hybrid teams.',
    defaultPrompt: 'Would you rather work from the beach or from a cabin in the mountains?',
  },
  {
    id: 'wyr-vacation-budget',
    type: 'would-you-rather',
    packId: 'would-you-rather',
    title: 'Would You Rather: Vacation vs Lunch Budget',
    description: 'Unlimited vacation days or unlimited lunch budget.',
    duration: 6,
    hostInstructions: 'Pose: "Would you rather have unlimited vacation days or unlimited budget for lunch?" Vote and ask one or two people to justify. Fun and quick.',
    defaultPrompt: 'Would you rather have unlimited vacation days or unlimited budget for lunch?',
  },
  {
    id: 'wyr-weekend-vacation',
    type: 'would-you-rather',
    packId: 'would-you-rather',
    title: 'Would You Rather: 3-Day Weekends vs Extra Month',
    description: '3-day weekend every week or an extra month of vacation once a year.',
    duration: 6,
    hostInstructions: 'Ask: "Would you rather have a 3-day weekend every week or an extra month of vacation once a year?" Vote; brief discussion on work-life balance.',
    defaultPrompt: 'Would you rather have a 3-day weekend every week or an extra month of vacation once a year?',
  },
  {
    id: 'wyr-specialist-generalist',
    type: 'would-you-rather',
    packId: 'would-you-rather',
    title: 'Would You Rather: Best at One Thing or Good at Many',
    description: 'Reflect on strengths and preferences.',
    duration: 8,
    hostInstructions: 'Pose: "Would you rather be the best at one thing or pretty good at many things?" Vote and invite 1–2 people to share why. Ties to how the team works together.',
    defaultPrompt: 'Would you rather be the best at one thing or pretty good at many things?',
  },
  {
    id: 'wyr-presentation-hero',
    type: 'would-you-rather',
    packId: 'would-you-rather',
    title: 'Would You Rather: Big Presentation or 1:1 with Hero',
    description: 'Present to 100 people or have a 1:1 with your hero.',
    duration: 6,
    hostInstructions: 'Ask: "Would you rather give a presentation to 100 people or have a 1:1 with your hero?" Vote and optional share. Good for introvert/extrovert reflection.',
    defaultPrompt: 'Would you rather give a presentation to 100 people or have a 1:1 with your hero?',
  },
  // —— Quick Energizers ——
  {
    id: 'energizer-one-word-mood',
    type: 'energizer',
    packId: 'energizers',
    title: 'One-Word Mood',
    description: 'Everyone shares one word for their current mood. Fast check-in.',
    duration: 3,
    hostInstructions: 'Go around (or in chat): "In one word, how are you feeling right now?" No discussion needed—just collect words. Optional: show as a word cloud or list.',
    defaultPrompt: "One word: How are you feeling right now?",
  },
  {
    id: 'energizer-energy-number',
    type: 'energizer',
    packId: 'energizers',
    title: 'Energy Level 1–10',
    description: 'Rate your energy; quick pulse check.',
    duration: 3,
    hostInstructions: 'Ask everyone to rate their energy 1–10 (hold up fingers, type in chat, or say the number). Acknowledge the range. No need to elaborate.',
    defaultPrompt: "What's your energy level right now (1–10)?",
  },
  {
    id: 'energizer-weather',
    type: 'energizer',
    packId: 'energizers',
    title: 'Weather Check',
    description: 'What’s the weather where you are? Great for distributed teams.',
    duration: 3,
    hostInstructions: 'Ask: "What’s the weather like where you are?" Quick round (one word or one sentence). Helps remote folks feel present.',
    defaultPrompt: "What's the weather like where you are?",
  },
  {
    id: 'energizer-one-thing-needed',
    type: 'energizer',
    packId: 'energizers',
    title: 'One Thing You Need',
    description: 'What do you need from this session? Sets intention.',
    duration: 5,
    hostInstructions: 'Ask: "In one word or short phrase, what do you need from this session?" Quick round. Use it to shape the agenda if possible.',
    defaultPrompt: "What do you need from this session? (One word or short phrase.)",
  },
  {
    id: 'energizer-superpower-today',
    type: 'energizer',
    packId: 'energizers',
    title: 'Superpower for Today',
    description: 'One word: your superpower for today.',
    duration: 4,
    hostInstructions: 'Ask: "What’s one word for your superpower today?" Quick share. Positive framing to start the meeting.',
    defaultPrompt: "One word: Your superpower for today.",
  },
  {
    id: 'energizer-morning-win',
    type: 'energizer',
    packId: 'energizers',
    title: 'One Win This Morning',
    description: 'Something that went well this morning.',
    duration: 5,
    hostInstructions: 'Ask: "What’s one thing that went well this morning?" Quick round. Celebrates small wins.',
    defaultPrompt: "What's one thing that went well this morning?",
  },
  {
    id: 'energizer-three-words-week',
    type: 'energizer',
    packId: 'energizers',
    title: 'Three Words for Your Week',
    description: 'Describe your week in three words.',
    duration: 5,
    hostInstructions: 'Ask everyone to describe their week so far in exactly three words. Go fast; no need to explain unless someone wants to.',
    defaultPrompt: "Describe your week so far in three words.",
  },
  {
    id: 'energizer-early-bird-night-owl',
    type: 'energizer',
    packId: 'energizers',
    title: 'Early Bird or Night Owl',
    description: 'Quick binary; see how the room splits.',
    duration: 3,
    hostInstructions: 'Ask: "Early bird or night owl?" Show of hands or poll. Optional: "Depends" as third option. Quick and fun.',
    defaultPrompt: "Are you an early bird or a night owl?",
  },
  // —— Polls & Word Clouds ——
  {
    id: 'poll-one-word-check-in',
    type: 'word-cloud',
    packId: 'polls-word-clouds',
    title: 'One-Word Check-In',
    description: 'Everyone submits one word; display as word cloud or list.',
    duration: 5,
    hostInstructions: 'Choose a focus (e.g. "How are you feeling?" or "One word for the project"). Collect responses in chat or a tool; show the word cloud or list. Comment on patterns.',
    defaultPrompt: "One word that describes how you're feeling right now.",
  },
  {
    id: 'poll-morning-type',
    type: 'poll',
    packId: 'polls-word-clouds',
    title: 'Quick Poll: Morning Type',
    description: 'Early bird / Night owl / Depends. Show results.',
    duration: 4,
    hostInstructions: 'Ask: "Which best describes your morning? Early bird / Night owl / Depends." Use poll or show of hands. Share results; move on.',
    defaultPrompt: 'Which best describes your morning? (Early bird / Night owl / Depends)',
  },
  {
    id: 'poll-communication-style',
    type: 'poll',
    packId: 'polls-word-clouds',
    title: 'Poll: How Do You Prefer to Communicate?',
    description: 'Slack, email, video, or in-person. Discuss norms.',
    duration: 6,
    hostInstructions: 'Pose: "How do you prefer to communicate at work? Slack / Email / Video call / In person." Vote; briefly discuss what that means for the team.',
    defaultPrompt: 'How do you prefer to communicate? (Slack / Email / Video / In person)',
  },
  {
    id: 'word-cloud-project-vibe',
    type: 'word-cloud',
    packId: 'polls-word-clouds',
    title: 'Word Cloud: Project Vibe',
    description: 'One word for how the project (or sprint) feels. Build shared language.',
    duration: 6,
    hostInstructions: 'Ask: "One word for how the project (or this sprint) feels to you." Collect and display as word cloud. Highlight common themes and one or two surprises.',
    defaultPrompt: "One word for how the project (or this sprint) feels to you.",
  },
  {
    id: 'poll-focus-time',
    type: 'poll',
    packId: 'polls-word-clouds',
    title: 'Poll: Best Focus Time',
    description: 'Morning / Afternoon / Flexible. Helps with scheduling.',
    duration: 4,
    hostInstructions: 'Ask: "When do you do your best focus work? Morning / Afternoon / It depends." Vote; share results. Useful for planning deep-work blocks.',
    defaultPrompt: 'When do you do your best focus work? (Morning / Afternoon / It depends)',
  },
  // —— Connection & Retrospectives ——
  {
    id: 'connection-small-win',
    type: 'prompt',
    packId: 'connection-retro',
    title: 'Small Win Share',
    description: 'Each person shares one small win from the week.',
    duration: 10,
    hostInstructions: 'Ask everyone to share one small win (work or personal). Go in order or let volunteers speak. Keep it to one sentence each. Celebrates progress.',
    defaultPrompt: "What's one small win you had this week?",
  },
  {
    id: 'connection-appreciation',
    type: 'connection',
    packId: 'connection-retro',
    title: 'Appreciation Round',
    description: 'Name one person and one thing you appreciate about them.',
    duration: 10,
    hostInstructions: 'Ask each person to name someone on the call (or in the room) and one thing they appreciate about them. Keep it brief. Builds psychological safety and connection.',
    defaultPrompt: "Who's one person here and one thing you appreciate about them?",
  },
  {
    id: 'connection-looking-forward',
    type: 'prompt',
    packId: 'connection-retro',
    title: 'What Are You Looking Forward To?',
    description: 'One thing you’re looking forward to in the next few weeks.',
    duration: 8,
    hostInstructions: 'Ask everyone to share one thing they’re looking forward to (work or life) in the next few weeks. Quick round. Positive and forward-looking.',
    defaultPrompt: "What's one thing you're looking forward to in the next few weeks?",
  },
  {
    id: 'connection-rose-thorn-bud',
    type: 'prompt',
    packId: 'connection-retro',
    title: 'Rose, Thorn, Bud',
    description: 'Rose = win, Thorn = challenge, Bud = hope. Classic retro format.',
    duration: 15,
    hostInstructions: 'Each person shares: Rose (one win), Thorn (one challenge), Bud (one hope or opportunity). Great for retros or project check-ins. Keep to one sentence per category.',
    defaultPrompt: 'Share one Rose (win), one Thorn (challenge), and one Bud (hope or opportunity).',
  },
  {
    id: 'connection-one-question',
    type: 'connection',
    packId: 'connection-retro',
    title: 'One Question You’d Ask the Group',
    description: 'Each person asks one question they’d want to hear the group answer.',
    duration: 12,
    hostInstructions: 'Ask everyone to think of one question they’d like to hear the group answer (e.g. "What would make our meetings better?"). Share the questions; pick one or two to answer together.',
    defaultPrompt: "What's one question you'd want to ask this group?",
  },
  {
    id: 'connection-gratitude',
    type: 'connection',
    packId: 'connection-retro',
    title: 'Gratitude Round',
    description: 'One thing you’re grateful for (work or life).',
    duration: 8,
    hostInstructions: 'Go around: "What’s one thing you’re grateful for right now?" Work or life, one sentence. No cross-talk; just listen.',
    defaultPrompt: "What's one thing you're grateful for right now?",
  },
  {
    id: 'connection-lesson-learned',
    type: 'prompt',
    packId: 'connection-retro',
    title: 'One Lesson Learned',
    description: 'Something you learned recently (work or life).',
    duration: 10,
    hostInstructions: 'Ask each person to share one lesson they’ve learned recently—work or life. Keeps it reflective and builds shared learning.',
    defaultPrompt: "What's one lesson you've learned recently?",
  },
];

export const teamBuildingActivities = activities;

/** Build trivia-style packs by grouping activities by packId. Host picks one pack; each activity becomes one "question" (prompt) for the game. */
export function teamBuildingAsTriviaPacks(): TriviaPack[] {
  const packMeta: Record<TeamBuildingPackId, { title: string; description: string }> = {
    'two-truths': {
      title: 'Two Truths & a Lie',
      description: 'Classic game with multiple themes: general, childhood, career, travel, this year. 5 activities.',
    },
    'would-you-rather': {
      title: 'Would You Rather',
      description: 'Binary, fun choices for voting and discussion. 8 activities.',
    },
    'energizers': {
      title: 'Quick Energizers',
      description: 'Short, high-energy check-ins. One word, mood, weather, superpower. 8 activities.',
    },
    'polls-word-clouds': {
      title: 'Polls & Word Clouds',
      description: 'One-word check-ins, quick polls, and word clouds. 5 activities.',
    },
    'connection-retro': {
      title: 'Connection & Retrospectives',
      description: 'Small wins, appreciation, Rose/Thorn/Bud, gratitude, lessons learned. 7 activities.',
    },
    'mix': {
      title: 'Team Building Mix',
      description: 'Blend of Two Truths, Would You Rather, energizers, and connection. One link for everyone.',
    },
  };

  const packs: TriviaPack[] = [];
  const packIds: TeamBuildingPackId[] = ['two-truths', 'would-you-rather', 'energizers', 'polls-word-clouds', 'connection-retro'];
  for (const packId of packIds) {
    const list = activities.filter((a) => a.packId === packId);
    if (list.length === 0) continue;
    const meta = packMeta[packId];
    const questions: TriviaQuestion[] = list.map((a) => ({
      question: `${a.title} (${a.duration} min) — ${a.defaultPrompt ?? a.hostInstructions}`,
      correctAnswer: '—',
      points: 1,
    }));
    packs.push({
      id: `team-building-${packId}`,
      title: meta.title,
      description: meta.description,
      questions,
    });
  }

  // Mix pack: sample from each
  const mixQuestions: TriviaQuestion[] = [
    ...activities.filter((a) => a.packId === 'two-truths').slice(0, 2),
    ...activities.filter((a) => a.packId === 'would-you-rather').slice(0, 2),
    ...activities.filter((a) => a.packId === 'energizers').slice(0, 2),
    ...activities.filter((a) => a.packId === 'polls-word-clouds').slice(0, 2),
    ...activities.filter((a) => a.packId === 'connection-retro').slice(0, 2),
  ].map((a) => ({
    question: `${a.title} (${a.duration} min) — ${a.defaultPrompt ?? a.hostInstructions}`,
    correctAnswer: '—',
    points: 1,
  }));
  packs.push({
    id: 'team-building-mix',
    title: 'Team Building Mix',
    description: 'Blend of Two Truths, Would You Rather, energizers, polls, and connection. 10 activities.',
    questions: mixQuestions,
  });

  return packs;
}

export const teamBuildingPacks = teamBuildingActivities.length > 0 ? teamBuildingAsTriviaPacks() : [];
export const defaultTeamBuildingPack = teamBuildingPacks[0];
