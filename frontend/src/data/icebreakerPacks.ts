/**
 * Icebreaker packs — prompts and activities for get-to-know-you, team building, and mixers.
 * Extensive sets for Two Truths, Would You Rather, Quick Energizers, and Low Stakes / High Connection.
 */

export interface IcebreakerPrompt {
  id: string;
  text: string;
  /** Optional category for filtering */
  category?: 'corporate' | 'social' | 'remote' | 'onboarding' | 'fun' | 'two-truths' | 'would-you-rather' | 'energizer' | 'connection';
}

export interface IcebreakerPack {
  id: string;
  title: string;
  description: string;
  prompts: IcebreakerPrompt[];
}

// —— Corporate & Teams (expanded) ——
const corporatePrompts: IcebreakerPrompt[] = [
  { id: 'c1', text: "What's one small win you had this week?", category: 'corporate' },
  { id: 'c2', text: "What's the best piece of advice you've received at work?", category: 'corporate' },
  { id: 'c3', text: "What's one thing you're looking forward to this month?", category: 'corporate' },
  { id: 'c4', text: "What's your go-to way to recharge after a busy day?", category: 'corporate' },
  { id: 'c5', text: "What's a skill you're currently learning or want to learn?", category: 'corporate' },
  { id: 'c6', text: "What's one word that describes how you're feeling about the team right now?", category: 'corporate' },
  { id: 'c7', text: "What's a communication style that works best for you?", category: 'corporate' },
  { id: 'c8', text: "What's one thing that would make our meetings more effective?", category: 'corporate' },
  { id: 'c9', text: "What's a project or task you're proud of from the last quarter?", category: 'corporate' },
  { id: 'c10', text: "What's one thing you'd tell your past self on day one of this role?", category: 'corporate' },
  { id: 'c11', text: "What's your superpower when it comes to teamwork?", category: 'corporate' },
  { id: 'c12', text: "What's a habit (work or life) you're trying to build?", category: 'corporate' },
  { id: 'c13', text: "What's one way you prefer to receive feedback?", category: 'corporate' },
  { id: 'c14', text: "What's a tool or process that's made your work easier lately?", category: 'corporate' },
  { id: 'c15', text: "What's one thing you wish more people knew about your role?", category: 'corporate' },
  { id: 'c16', text: "What's your ideal 'focus time' block (morning, afternoon, or flexible)?", category: 'corporate' },
  { id: 'c17', text: "What's one boundary you've set (or want to set) to protect your energy?", category: 'corporate' },
  { id: 'c18', text: "What's a win from another team or person you've noticed recently?", category: 'corporate' },
  { id: 'c19', text: "What's one word you'd use to describe our team culture right now?", category: 'corporate' },
  { id: 'c20', text: "What's something you're saying 'yes' to more (or 'no' to) this year?", category: 'corporate' },
];

// —— Social & Mixers (expanded) ——
const socialPrompts: IcebreakerPrompt[] = [
  { id: 's1', text: "If you could have dinner with anyone (living or historical), who and why?", category: 'social' },
  { id: 's2', text: "What's your go-to karaoke song?", category: 'social' },
  { id: 's3', text: "What's a hobby you've picked up in the last year?", category: 'social' },
  { id: 's4', text: "Beach or mountains?", category: 'social' },
  { id: 's5', text: "Coffee or tea?", category: 'social' },
  { id: 's6', text: "What's the best snack?", category: 'social' },
  { id: 's7', text: "What's one word that describes you?", category: 'social' },
  { id: 's8', text: "What's a movie or show you could rewatch forever?", category: 'social' },
  { id: 's9', text: "What's your hidden talent or party trick?", category: 'social' },
  { id: 's10', text: "What's the best trip you've ever taken?", category: 'social' },
  { id: 's11', text: "What's a food you could eat every day?", category: 'social' },
  { id: 's12', text: "What's the last thing that made you laugh out loud?", category: 'social' },
  { id: 's13', text: "What's your favorite way to spend a day off?", category: 'social' },
  { id: 's14', text: "What's a book, podcast, or show you'd recommend to anyone?", category: 'social' },
  { id: 's15', text: "What's something you're weirdly good at?", category: 'social' },
  { id: 's16', text: "What's your go-to comfort food?", category: 'social' },
  { id: 's17', text: "What's a goal (big or small) you're working toward right now?", category: 'social' },
  { id: 's18', text: "What's the best gift you've ever given or received?", category: 'social' },
  { id: 's19', text: "What's a tradition you love (family, holiday, or personal)?", category: 'social' },
  { id: 's20', text: "What's one thing you're grateful for today?", category: 'social' },
];

// —— Two Truths and a Lie (prompt ideas for that game) ——
const twoTruthsPrompts: IcebreakerPrompt[] = [
  { id: 't1', text: "Share two truths and one lie about yourself. The group will guess the lie.", category: 'two-truths' },
  { id: 't2', text: "Two truths and a lie about your childhood or where you grew up.", category: 'two-truths' },
  { id: 't3', text: "Two truths and a lie about your job, education, or career path.", category: 'two-truths' },
  { id: 't4', text: "Two truths and a lie about your hobbies, travels, or adventures.", category: 'two-truths' },
  { id: 't5', text: "Two truths and a lie about something that happened to you this year.", category: 'two-truths' },
  { id: 't6', text: "Two truths and a lie about your family or pets.", category: 'two-truths' },
  { id: 't7', text: "Two truths and a lie about a skill or talent (real or silly).", category: 'two-truths' },
  { id: 't8', text: "Two truths and a lie about food, cooking, or a favorite restaurant.", category: 'two-truths' },
  { id: 't9', text: "Two truths and a lie about a celebrity you've met or a famous place you've been.", category: 'two-truths' },
  { id: 't10', text: "Two truths and a lie about something you've never told this group before.", category: 'two-truths' },
  { id: 't11', text: "Two truths and a lie about your bucket list or dream experience.", category: 'two-truths' },
  { id: 't12', text: "Two truths and a lie about your favorite season, holiday, or celebration.", category: 'two-truths' },
  { id: 't13', text: "Two truths and a lie about a fear you've overcome or a risk you took.", category: 'two-truths' },
  { id: 't14', text: "Two truths and a lie about your first job or first day of school.", category: 'two-truths' },
  { id: 't15', text: "Two truths and a lie about something that made you proud recently.", category: 'two-truths' },
];

// —— Would You Rather (full questions — use as prompts) ——
const wouldYouRatherPrompts: IcebreakerPrompt[] = [
  { id: 'w1', text: "Would you rather have coffee or tea for the rest of your life?", category: 'would-you-rather' },
  { id: 'w2', text: "Would you rather be able to fly or be invisible?", category: 'would-you-rather' },
  { id: 'w3', text: "Would you rather have a long meeting that ends early or a short meeting that runs over?", category: 'would-you-rather' },
  { id: 'w4', text: "Would you rather work from the beach or from a cabin in the mountains?", category: 'would-you-rather' },
  { id: 'w5', text: "Would you rather always speak in questions or always speak in rhyme?", category: 'would-you-rather' },
  { id: 'w6', text: "Would you rather have unlimited vacation days or unlimited budget for lunch?", category: 'would-you-rather' },
  { id: 'w7', text: "Would you rather have a 3-day weekend every week or an extra month of vacation once a year?", category: 'would-you-rather' },
  { id: 'w8', text: "Would you rather be the best at one thing or pretty good at many things?", category: 'would-you-rather' },
  { id: 'w9', text: "Would you rather have a time machine that only goes back or only goes forward?", category: 'would-you-rather' },
  { id: 'w10', text: "Would you rather have a team that always agrees or a team that always challenges you?", category: 'would-you-rather' },
  { id: 'w11', text: "Would you rather give a presentation to 100 people or have a 1:1 with your hero?", category: 'would-you-rather' },
  { id: 'w12', text: "Would you rather have more meetings with fewer people or fewer meetings with more people?", category: 'would-you-rather' },
  { id: 'w13', text: "Would you rather always have perfect WiFi or always have perfect weather?", category: 'would-you-rather' },
  { id: 'w14', text: "Would you rather know what everyone thinks of you or never be judged again?", category: 'would-you-rather' },
  { id: 'w15', text: "Would you rather start the week on Monday or on Saturday?", category: 'would-you-rather' },
  { id: 'w16', text: "Would you rather have a personal chef or a personal trainer?", category: 'would-you-rather' },
  { id: 'w17', text: "Would you rather read the book or watch the movie first?", category: 'would-you-rather' },
  { id: 'w18', text: "Would you rather be famous in your field or rich and unknown?", category: 'would-you-rather' },
  { id: 'w19', text: "Would you rather have a 30-minute daily standup or a 2-hour weekly sync?", category: 'would-you-rather' },
  { id: 'w20', text: "Would you rather always be 10 minutes early or always have the perfect excuse?", category: 'would-you-rather' },
];

// —— Quick Energizers (short, high-energy) ——
const quickEnergizers: IcebreakerPrompt[] = [
  { id: 'e1', text: "In 5 words or less: What's your mood right now?", category: 'energizer' },
  { id: 'e2', text: "One word: How's your energy level (1–10)?", category: 'energizer' },
  { id: 'e3', text: "Quick round: What's the weather like where you are?", category: 'energizer' },
  { id: 'e4', text: "In one word: What you need from this session?", category: 'energizer' },
  { id: 'e5', text: "Speed round: Coffee, tea, or something else in your hand?", category: 'energizer' },
  { id: 'e6', text: "One word: Your superpower for today.", category: 'energizer' },
  { id: 'e7', text: "Quick share: What's one thing that went well this morning?", category: 'energizer' },
  { id: 'e8', text: "In 3 words: Describe your week so far.", category: 'energizer' },
  { id: 'e9', text: "Speed round: Early bird or night owl?", category: 'energizer' },
  { id: 'e10', text: "One word: What you're bringing to the team today.", category: 'energizer' },
  { id: 'e11', text: "Quick: What's the best thing that happened in the last 24 hours?", category: 'energizer' },
  { id: 'e12', text: "In one word: Your intention for this meeting.", category: 'energizer' },
  { id: 'e13', text: "Speed round: Favorite emoji to use at work?", category: 'energizer' },
  { id: 'e14', text: "One word: How you're feeling about the rest of the day.", category: 'energizer' },
  { id: 'e15', text: "Quick: What would make this meeting a win for you?", category: 'energizer' },
  { id: 'e16', text: "In 5 words: What's on your mind?", category: 'energizer' },
  { id: 'e17', text: "Speed round: In-person, hybrid, or remote today?", category: 'energizer' },
  { id: 'e18', text: "One word: Something you're looking forward to.", category: 'energizer' },
  { id: 'e19', text: "Quick: What's one thing you need to get done today?", category: 'energizer' },
  { id: 'e20', text: "In one word: The vibe you want for this group today.", category: 'energizer' },
];

// —— Low Stakes, High Connection (gentle, bonding) ——
const lowStakesHighConnection: IcebreakerPrompt[] = [
  { id: 'l1', text: "What's one thing you appreciate about someone on this call (or in this room)?", category: 'connection' },
  { id: 'l2', text: "What's a small win you've had recently that you're proud of?", category: 'connection' },
  { id: 'l3', text: "What's something you're looking forward to in the next few weeks?", category: 'connection' },
  { id: 'l4', text: "What's one way someone here has helped you or made your day easier?", category: 'connection' },
  { id: 'l5', text: "What's a hobby or interest you've been enjoying lately?", category: 'connection' },
  { id: 'l6', text: "What's one thing that made you smile this week?", category: 'connection' },
  { id: 'l7', text: "What's a book, show, or podcast you'd recommend and why?", category: 'connection' },
  { id: 'l8', text: "What's one thing you'd like to learn from someone in this group?", category: 'connection' },
  { id: 'l9', text: "What's a place you'd love to visit (or revisit) and why?", category: 'connection' },
  { id: 'l10', text: "What's one way you like to unwind or reset?", category: 'connection' },
  { id: 'l11', text: "What's something you're grateful for in your work or life right now?", category: 'connection' },
  { id: 'l12', text: "What's one quality you value most in a teammate?", category: 'connection' },
  { id: 'l13', text: "What's a tradition or ritual that matters to you?", category: 'connection' },
  { id: 'l14', text: "What's one thing you wish people knew about you?", category: 'connection' },
  { id: 'l15', text: "What's a piece of advice you'd give your past self?", category: 'connection' },
  { id: 'l16', text: "What's one way you've seen this team support each other?", category: 'connection' },
  { id: 'l17', text: "What's something that inspired you recently?", category: 'connection' },
  { id: 'l18', text: "What's one word you hope describes this team by the end of the year?", category: 'connection' },
  { id: 'l19', text: "What's a skill or strength you see in someone else here?", category: 'connection' },
  { id: 'l20', text: "What's one thing you'd do if you had an extra hour every day?", category: 'connection' },
];

// —— Remote & Hybrid (expanded) ——
const remotePrompts: IcebreakerPrompt[] = [
  { id: 'r1', text: "What's in the background of your workspace (or what would you want)?", category: 'remote' },
  { id: 'r2', text: "What's one thing you miss about being in an office (or love about remote)?", category: 'remote' },
  { id: 'r3', text: "What's your favorite way to start the workday?", category: 'remote' },
  { id: 'r4', text: "What's one word for how you're feeling right now?", category: 'remote' },
  { id: 'r5', text: "What's a small ritual that helps you focus?", category: 'remote' },
  { id: 'r6', text: "What's your go-to lunch when working from home?", category: 'remote' },
  { id: 'r7', text: "What's one thing that makes your WFH setup work (or that you wish you had)?", category: 'remote' },
  { id: 'r8', text: "What's the best part of your current work-from location?", category: 'remote' },
  { id: 'r9', text: "What's one way you stay connected with teammates when remote?", category: 'remote' },
  { id: 'r10', text: "What's your biggest WFH distraction—and how do you handle it?", category: 'remote' },
  { id: 'r11', text: "What's one boundary you've set between work and home?", category: 'remote' },
  { id: 'r12', text: "What's a tool or habit that helps you feel 'present' in virtual meetings?", category: 'remote' },
  { id: 'r13', text: "What's one thing you do to 'show up' on camera (or to take a break from it)?", category: 'remote' },
  { id: 'r14', text: "What's your ideal length for a video call before you need a break?", category: 'remote' },
  { id: 'r15', text: "What's one way you'd improve our remote/hybrid culture?", category: 'remote' },
];

// —— Onboarding & New Teams (expanded) ——
const onboardingPrompts: IcebreakerPrompt[] = [
  { id: 'o1', text: "What's your name and one fun fact about you?", category: 'onboarding' },
  { id: 'o2', text: "What's your role and one thing you're excited to work on?", category: 'onboarding' },
  { id: 'o3', text: "What's something you're really good at that might surprise people?", category: 'onboarding' },
  { id: 'o4', text: "Where are you from or where do you call home?", category: 'onboarding' },
  { id: 'o5', text: "What's the best thing that happened to you this week?", category: 'onboarding' },
  { id: 'o6', text: "What's one thing you're hoping to learn in this role?", category: 'onboarding' },
  { id: 'o7', text: "What's a previous job or experience that shaped how you work?", category: 'onboarding' },
  { id: 'o8', text: "What's your preferred way to communicate (Slack, email, video, etc.)?", category: 'onboarding' },
  { id: 'o9', text: "What's one question you have about the team or the company?", category: 'onboarding' },
  { id: 'o10', text: "What's something you'd want your teammates to know about you?", category: 'onboarding' },
  { id: 'o11', text: "What's the first thing you do when you start a new job?", category: 'onboarding' },
  { id: 'o12', text: "What's one thing that would help you feel welcome here?", category: 'onboarding' },
  { id: 'o13', text: "What's a strength you bring to the team?", category: 'onboarding' },
  { id: 'o14', text: "What's your favorite part of the workday (morning, afternoon, etc.)?", category: 'onboarding' },
  { id: 'o15', text: "What's one thing you're curious about in this role or industry?", category: 'onboarding' },
];

export const icebreakerPacks: IcebreakerPack[] = [
  {
    id: 'corporate',
    title: 'Corporate & Teams',
    description: 'Wins, advice, and light reflection for work groups. 20 prompts.',
    prompts: corporatePrompts,
  },
  {
    id: 'social',
    title: 'Social & Mixers',
    description: 'Fun, favorites, and get-to-know-you for any gathering. 20 prompts.',
    prompts: socialPrompts,
  },
  {
    id: 'two-truths',
    title: 'Two Truths & a Lie',
    description: 'Prompt ideas for the classic game. Share two truths and one lie; the group guesses.',
    prompts: twoTruthsPrompts,
  },
  {
    id: 'would-you-rather',
    title: 'Would You Rather',
    description: 'Binary, fun choices for voting and discussion. 20 questions.',
    prompts: wouldYouRatherPrompts,
  },
  {
    id: 'quick-energizers',
    title: 'Quick Energizers',
    description: 'Short, high-energy check-ins. One word or one sentence. 20 prompts.',
    prompts: quickEnergizers,
  },
  {
    id: 'low-stakes-connection',
    title: 'Low Stakes, High Connection',
    description: 'Gentle, bonding prompts. Gratitude, appreciation, and light reflection. 20 prompts.',
    prompts: lowStakesHighConnection,
  },
  {
    id: 'remote',
    title: 'Remote & Hybrid',
    description: 'Check-ins and rituals for distributed teams. 15 prompts.',
    prompts: remotePrompts,
  },
  {
    id: 'onboarding',
    title: 'Onboarding & New Teams',
    description: 'Introductions and one fun fact for new hires and new teams. 15 prompts.',
    prompts: onboardingPrompts,
  },
  {
    id: 'mixed',
    title: 'Mix It Up',
    description: 'Blend of corporate, social, and fun. 25 prompts.',
    prompts: [
      ...corporatePrompts.slice(0, 6),
      ...socialPrompts.slice(0, 6),
      ...wouldYouRatherPrompts.slice(0, 4),
      ...quickEnergizers.slice(0, 5),
      ...lowStakesHighConnection.slice(0, 4),
    ],
  },
];

export const defaultIcebreakerPack = icebreakerPacks[0];
