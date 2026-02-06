/* ============================================================
   LEARNING ENGINE — GOLD STANDARD FOUNDATION
   ============================================================

   DESIGN PHILOSOPHY
   ------------------------------------------------------------
   1. Humans have short attention spans → content must flow.
   2. Visuals anchor memory → images are first-class citizens.
   3. Facts must be verifiable → every claim can be traced.
   4. Content must be reusable → learning feeds games.
   5. No ads, no noise, no dark patterns.
   6. Legal forever → public domain & permissive licenses only.

   This system powers:
   - Learning pages
   - Trivia generation
   - Bingo prompts
   - Edutainment displays
   - Interactive playrooms
*/

/* ============================================================
   IMAGE & LICENSE RULES (NON-NEGOTIABLE)
   ============================================================ */

export type ImageSourceType =
  | "public_domain"
  | "cc0"
  | "cc_by"
  | "government"
  | "institutional";

/*
  ONLY ALLOWED SOURCES:
  - NASA
  - NOAA
  - USGS
  - Smithsonian
  - Library of Congress
  - Wikimedia Commons (PD / CC0 / CC BY)
  - Government science agencies
*/

export interface ImageAsset {
  id: string;

  // Storage
  url: string;
  thumbnailUrl?: string;

  // Accessibility & cognition
  altText: string; // descriptive, educational, human-readable

  // Legal & provenance
  sourceType: ImageSourceType;
  sourceName: string;
  sourceUrl: string;
  license: string; // "Public Domain", "CC0 1.0", "CC BY 4.0"
  attributionRequired: boolean;

  // Knowledge mapping
  tags: string[];      // volcano, experiment, reaction
  concepts: string[];  // gas release, pressure, acid-base
  verified: boolean;   // must be true before render
}

/* ============================================================
   IMAGE VALIDATION GATE
   ============================================================ */

const ALLOWED_LICENSES = [
  "Public Domain",
  "CC0",
  "CC0 1.0",
  "CC BY 4.0",
  "CC BY-SA 4.0"
];

export function validateImage(image: ImageAsset): boolean {
  return (
    ALLOWED_LICENSES.includes(image.license) &&
    image.verified === true &&
    image.altText.length >= 10 &&
    !!image.sourceUrl &&
    !!image.sourceName
  );
}

/* ============================================================
   LEARNING SECTION IDs (THE SPINE)
   ============================================================
   Every learning page is broken into atomic sections with stable IDs.
   These IDs connect: images, text, trivia, games, edutainment.
   Rules: human-readable, stable (never change once published),
   hierarchical, predictable.
   Example: learningPageId "science.chemistry.experiments.baking-soda-volcano"
   Section IDs: "intro.hook", "overview.what-is-happening", "steps.build", etc.
*/

/* ============================================================
   IMAGE SLOTS — ROLES, NOT DECORATION
   ============================================================
   Core principle: Images reduce cognitive load. If an image does not
   clarify, anchor, or progress understanding — it does not belong.
   Each section declares slots with intent. Images attach to slots only.
*/

export type ImageSlotRole =
  | "hero"
  | "context"
  | "diagram"
  | "step"
  | "comparison"
  | "lifecycle"
  | "process"
  | "detail"
  | "reference";

export interface ImageSlot {
  slotId: string;
  sectionId: string;
  role: ImageSlotRole;
  required: boolean;
  maxImages?: number;
  preferredOrientation?: "landscape" | "portrait" | "square";
  description: string; // human intent
}

/** Image + slot attachment. If an image does not match a slot → reject. */
export interface LearningImageAsset extends ImageAsset {
  learningPageId: string;
  sectionId: string;
  slotId: string;
  role: ImageSlotRole;
  verified: true;
  /** Gold standard: caption explaining why this image exists (learning support). */
  caption?: string;
}

/** Validate that an image's slot attachment matches a defined slot. Rejects free-floating images. */
export function validateImageForSlot(
  image: LearningImageAsset,
  slots: ImageSlot[]
): { valid: true; slot: ImageSlot } | { valid: false; reason: string } {
  const slot = slots.find(
    (s) => s.slotId === image.slotId && s.sectionId === image.sectionId && s.role === image.role
  );
  if (!slot) {
    return {
      valid: false,
      reason: `No matching slot for slotId=${image.slotId} sectionId=${image.sectionId} role=${image.role}`,
    };
  }
  if (image.learningPageId === undefined || image.learningPageId === "") {
    return { valid: false, reason: "learningPageId required" };
  }
  return { valid: true, slot };
}

export function getSlotForSection(slots: ImageSlot[], sectionId: string): ImageSlot[] {
  return slots.filter((s) => s.sectionId === sectionId);
}

/* ============================================================
   VOLCANO PAGE — IMAGE SLOT DEFINITION (GOLD STANDARD)
   ============================================================ */

export const volcanoImageSlots: ImageSlot[] = [
  {
    slotId: "hero.volcano-eruption",
    sectionId: "intro.hook",
    role: "hero",
    required: true,
    preferredOrientation: "landscape",
    description:
      "Visually exciting eruption image that immediately signals hands-on science",
  },
  {
    slotId: "context.reaction-overview",
    sectionId: "overview.what-is-happening",
    role: "context",
    required: true,
    description: "Clear image showing the volcano mid-reaction without clutter",
  },
  {
    slotId: "materials.flatlay",
    sectionId: "materials.list",
    role: "reference",
    required: true,
    description: "Baking soda — one of the two main ingredients",
  },
  {
    slotId: "materials.vinegar",
    sectionId: "materials.list",
    role: "reference",
    required: true,
    description: "Vinegar (e.g. white distilled) — the other main ingredient",
  },
  {
    slotId: "materials.additives",
    sectionId: "materials.list",
    role: "reference",
    required: false,
    description: "Optional: dish soap and/or food coloring for foam and colored lava",
  },
  {
    slotId: "steps.build.volcano",
    sectionId: "steps.build",
    role: "step",
    required: false,
    maxImages: 5,
    description: "Step-by-step images showing volcano construction",
  },
  {
    slotId: "diagram.chemical-reaction",
    sectionId: "reaction.chemistry",
    role: "diagram",
    required: true,
    description: "Diagram explaining acid-base reaction and CO₂ production",
  },
  {
    slotId: "diagram.gas-pressure",
    sectionId: "reaction.pressure-gas",
    role: "diagram",
    required: false,
    description: "Diagram showing gas buildup and pressure release",
  },
  {
    slotId: "comparison.real-volcano",
    sectionId: "real-world.connections",
    role: "comparison",
    required: false,
    maxImages: 3,
    description: "Side-by-side comparison of experiment vs real volcanoes",
  },
  {
    slotId: "comparison.real-volcano-2",
    sectionId: "real-world.connections",
    role: "comparison",
    required: false,
    maxImages: 1,
    description: "Second real volcano image for comparison",
  },
];

/* ============================================================
   FACT VERIFICATION MODEL
   ============================================================ */

export interface FactReference {
  claim: string;
  sources: { name: string; url: string }[];
  confidence: "high" | "medium";
}

/* ============================================================
   CONTENT BLOCK (ADHD-SAFE)
   ============================================================
   No block longer than ~4 lines when rendered.
   Blocks are interruptible without penalty.
*/

export type ContentBlockType = "paragraph" | "bullet-list" | "callout" | "divider";
export type ContentBlockEmphasis = "normal" | "highlight" | "warning" | "fun-fact";

export interface ContentBlock {
  type: ContentBlockType;
  content: string | string[];
  emphasis?: ContentBlockEmphasis;
}

/* ============================================================
   LEARNING SECTION SCHEMA (CANONICAL)
   ============================================================
   Section id = stable sectionId. intent drives layout and image slots.
*/

export type SectionIntent =
  | "hook"
  | "overview"
  | "instruction"
  | "explanation"
  | "diagrammatic"
  | "safety"
  | "real-world"
  | "deep-dive";

export interface LearningSection {
  id: string;
  title: string;
  intent: SectionIntent;
  contentBlocks: ContentBlock[];
  /** Slots for this section — filled by ingest; attach via attachImageSlotsToPage */
  imageSlots?: ImageSlot[];
}

/* ============================================================
   LEARNING PAGE SCHEMA (CANONICAL — TRUTH + STRUCTURE)
   ============================================================
   This is not UI. This is the spine for every learning page.
*/

export interface LearningPageMetadata {
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  sourcesVerified: true;
}

export interface LearningPage {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;

  audience: "general" | "child-first" | "adult";
  tone: "friendly" | "professional" | "playful" | "mixed";

  topics: string[];
  concepts: string[];

  sections: LearningSection[];

  metadata: LearningPageMetadata;
}

/** Canonical ID for the baking soda volcano learning page. */
export const BAKING_SODA_VOLCANO_PAGE_ID = "science.chemistry.experiments.baking-soda-volcano";

/* ============================================================
   WIRE IMAGE SLOTS → SECTIONS
   ============================================================
   Sections know what images they expect. Renderer knows where images go.
   Ingest system knows what to fetch.
*/

export function attachImageSlotsToPage<T extends LearningSection>(
  sections: T[],
  allSlots: ImageSlot[]
): (T & { imageSlots: ImageSlot[] })[] {
  return sections.map((section) => ({
    ...section,
    imageSlots: allSlots.filter((slot) => slot.sectionId === section.id),
  }));
}

/* ============================================================
   LEGACY / GAME INTEGRATION (optional on pages)
   ============================================================ */

export interface Experiment {
  materials: string[];
  steps: string[];
  safetyNotes: string[];
  expectedResult: string;
  whyItWorks: string;
}

export interface TriviaBlueprint {
  allowed: boolean;
  questionTypes: ("multiple_choice" | "true_false" | "image_based")[];
  difficultyMap: { easy: string[]; medium: string[]; hard: string[] };
}

/* ============================================================
   VOLCANO PAGE — STRUCTURE (TEXT-ONLY, IMAGE-READY)
   ============================================================
   Valid, renders text-only, image slots wired. Ingest attaches images next.
*/

const bakingSodaVolcanoSections: LearningSection[] = [
  {
    id: "intro.hook",
    title: "A Mini Volcano in Your Kitchen",
    intent: "hook",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "The baking soda volcano is a classic science experiment: two everyday ingredients — baking soda and vinegar — react to make a gas. That gas pushes foamy 'lava' up and over the sides. It's safe, fast, and it uses the same kind of chemistry that makes cakes rise and soda fizz. In under a minute you can see cause and effect with your own eyes.",
      },
      {
        type: "callout",
        emphasis: "fun-fact",
        content:
          "Same idea as airbags and some fire extinguishers: a chemical reaction that quickly makes gas. Here you get to trigger it yourself.",
      },
    ],
  },
  {
    id: "overview.what-you-learn",
    title: "What You'll Learn",
    intent: "overview",
    contentBlocks: [
      {
        type: "bullet-list",
        content: [
          "What happens when an acid and a base mix (baking soda + vinegar).",
          "Why the mixture foams and 'erupts' — gas needs more space than liquid.",
          "How to build and run the experiment step by step.",
          "How this reaction connects to real volcanoes, baking, and safety devices.",
        ],
      },
    ],
  },
  {
    id: "depth.tiers",
    title: "Choose Your Depth",
    intent: "overview",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "Pick how far you want to go: just watch it erupt, build it yourself, understand the science, or go advanced with equations and science-fair ideas.",
      },
    ],
  },
  {
    id: "materials.list",
    title: "What You'll Need",
    intent: "instruction",
    contentBlocks: [
      {
        type: "paragraph",
        content: "Gather everything before you start. Images below show each item so you know exactly what to use.",
      },
      {
        type: "bullet-list",
        content: [
          "Baking soda (sodium bicarbonate) — the base in the reaction.",
          "Vinegar — white distilled vinegar works great; any vinegar will do.",
          "A small plastic bottle — this becomes the crater of your volcano.",
          "Something to build the volcano shape around the bottle: play dough, dirt in a tray, or aluminum foil.",
          "Dish soap (optional) — one squirt makes the foam last longer and look more dramatic.",
          "Food coloring (optional) — a drop or two gives you colored 'lava'.",
        ],
      },
    ],
  },
  {
    id: "steps.build",
    title: "Do It — Step by Step",
    intent: "instruction",
    contentBlocks: [
      {
        type: "paragraph",
        content: "Build your volcano around the bottle, add baking soda (and optional soap and food coloring), then pour in the vinegar. Images above show the real ingredients and the bottle you'll use.",
      },
      {
        type: "bullet-list",
        content: [
          "Set the bottle in the center of a tray or plate. Build a volcano shape around it with play dough, dirt, or foil — leave the mouth of the bottle open at the top (the crater).",
          "Put 2–3 spoonfuls of baking soda into the crater.",
          "Optional: add a small squirt of dish soap and a drop or two of food coloring.",
          "When you're ready, pour vinegar into the crater. Step back and watch.",
          "Observe: foam rises and spills over. That's carbon dioxide gas forming and escaping.",
        ],
      },
    ],
  },
  {
    id: "overview.what-is-happening",
    title: "What's Actually Happening?",
    intent: "overview",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "When baking soda and vinegar meet, they react in a way that creates a gas. That gas needs space, so it pushes upward — and out — creating the eruption.",
      },
      {
        type: "callout",
        emphasis: "fun-fact",
        content: "In short: acid + base → gas → foam. That’s it.",
      },
    ],
  },
  {
    id: "reaction.chemistry",
    title: "The Chemistry Behind the Foam",
    intent: "explanation",
    contentBlocks: [
      { type: "divider", content: "" },
      {
        type: "paragraph",
        content:
          "Baking soda is a base. Vinegar is an acid. When they react, they form carbon dioxide gas — the same gas you exhale. The diagram shows how the reaction works.",
      },
    ],
  },
  {
    id: "reaction.pressure-gas",
    title: "Why It Erupts",
    intent: "explanation",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "Gas takes up more space than liquid. As CO₂ forms, pressure builds until it escapes upward. That's why the foam rises and overflows.",
      },
    ],
  },
  {
    id: "safety.notes",
    title: "Safety",
    intent: "safety",
    contentBlocks: [
      {
        type: "callout",
        emphasis: "warning",
        content:
          "Do not taste the mixture. Protect surfaces and eyes; use a tray or towel. Supervise young children.",
      },
    ],
  },
  {
    id: "real-world.connections",
    title: "Connect to the Real World",
    intent: "real-world",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "The same gas-producing reaction shows up in baking (leavening), some fire extinguishers, and inflatable safety systems. Real volcanoes work differently (magma and pressure under the Earth), but the idea — pressure building until something erupts — is a clear analogy. The images below compare your foam eruption with real volcanic activity.",
      },
    ],
  },
  {
    id: "further.exploration",
    title: "Go Deeper",
    intent: "deep-dive",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "Advanced science: the full equation, how real volcanoes work, and how to turn this into a science-fair project.",
      },
      {
        type: "bullet-list",
        content: [
          "Full reaction: NaHCO₃ (baking soda) + CH₃COOH (vinegar) → CO₂ (gas) + H₂O (water) + sodium acetate. The gas is what you see.",
          "Real volcanoes: magma and pressure under the Earth's crust — not acid-base chemistry, but the same idea of pressure building until something erupts.",
          "Science-fair idea: change the amounts of baking soda and vinegar; measure eruption height or duration. Compare lemon juice or citric acid with vinegar. Which makes the most foam?",
        ],
      },
    ],
  },
  {
    id: "future.hooks",
    title: "What's Next?",
    intent: "overview",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "This experiment is trivia-ready: you can turn it into bingo clues or quiz questions. To go further, try related topics: slime (chemistry and polymers), North Carolina (geography and landforms), or more crafts and STEM projects.",
      },
      {
        type: "bullet-list",
        content: [
          "Related: Slime — another hands-on chemistry project.",
          "Related: North Carolina — mountains, coast, and natural science.",
          "Related: Crafts & STEM — more build-and-observe activities.",
        ],
      },
    ],
  },
];

/** Baking soda volcano learning page — canonical skeleton. Sections include imageSlots (wired from volcanoImageSlots). */
export const bakingSodaVolcanoPage: LearningPage = {
  id: BAKING_SODA_VOLCANO_PAGE_ID,
  slug: "/learn/baking-soda-volcano",

  title: "The Baking Soda Volcano",
  subtitle: "A small eruption that teaches big science",

  audience: "general",
  tone: "mixed",

  topics: ["chemistry", "science experiments"],
  concepts: ["acid-base reaction", "carbon dioxide", "pressure"],

  sections: attachImageSlotsToPage(bakingSodaVolcanoSections, volcanoImageSlots),

  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sourcesVerified: true,
  },
};

/** Tier definitions: gold-standard four paths — Just Watch, Build It, Understand the Science, Go Advanced. */
export interface BakingSodaVolcanoTier {
  id: "just_watch" | "build_it" | "understand_science" | "go_advanced";
  title: string;
  tagline: string;
  description: string;
  /** Optional: related topic slug for cross-link. */
  relatedTopicId?: string;
}

export const BAKING_SODA_VOLCANO_TIERS: BakingSodaVolcanoTier[] = [
  {
    id: "just_watch",
    title: "Just Watch",
    tagline: "See it erupt — no building required.",
    description:
      "Watch a video or a friend do it. The payoff is immediate: foam spills over like lava. You see cause and effect without touching the materials. Perfect if you want the 'what happens' before trying it yourself.",
    relatedTopicId: "crafts-stem",
  },
  {
    id: "build_it",
    title: "Build It",
    tagline: "Make it and watch it erupt.",
    description:
      "Follow the steps: build your volcano, add baking soda, pour vinegar. The payoff is immediate — foam spills over like lava. Change one thing (more vinegar? dish soap?) and see what happens. Build cause-and-effect thinking: 'When I added more vinegar, the reaction was faster.'",
    relatedTopicId: "slime",
  },
  {
    id: "understand_science",
    title: "Understand the Science",
    tagline: "Acid, base, gas — why it works.",
    description:
      "Baking soda is a base; vinegar is an acid. Together they make carbon dioxide gas. Gas takes more space than liquid, so pressure builds and the foam erupts. Same idea as baking, fire extinguishers, and real volcanoes (which use magma and pressure under the Earth).",
    relatedTopicId: "north-carolina",
  },
  {
    id: "go_advanced",
    title: "Go Advanced",
    tagline: "Equations, real volcanoes, science-fair ideas.",
    description:
      "The full equation: NaHCO₃ + CH₃COOH → CO₂ + H₂O + sodium acetate. Why does gas take more space? How do real volcanoes work — and how is that different from this reaction? Measure eruption height or duration; compare lemon juice vs vinegar. Turn it into a science-fair project.",
    relatedTopicId: "north-carolina",
  },
];

/* ============================================================
   TIME TRAVEL — FILM, SCIENCE, AND PRACTICAL IMPLICATIONS
   ============================================================
   Canonical learning page: movies, fan theory, real science, and
   "what would you do?" — framed for trivia, depth, and a practical
   takeaway (you probably can't go back; make the future good).
   Sources: NASA, Wikipedia, filmography. No pseudoscience.
*/

export const TIME_TRAVEL_PAGE_ID = "culture.movies.time-travel.practical-implications";

/** Only 4 image slots: hero + 3 section images. No duplicates; each slot has one distinct, legible image (NASA SVS or Commons PD/CC). */
export const timeTravelImageSlots: ImageSlot[] = [
  { slotId: "hero.time-travel", sectionId: "intro.hook", role: "hero", required: true, preferredOrientation: "landscape", description: "Hero: spacetime / relativity — NASA SVS" },
  { slotId: "context.science", sectionId: "science.reality", role: "context", required: false, description: "Science: time dilation / relativity — NASA or Commons" },
  { slotId: "context.stories", sectionId: "stories.imagine", role: "context", required: false, description: "Stories: rule sets, paradoxes — Commons spacetime" },
  { slotId: "context.film-change", sectionId: "film.change-past", role: "context", required: false, description: "Film: Change the past — DeLorean (Commons CC BY)" },
];

const timeTravelSections: LearningSection[] = [
  {
    id: "intro.hook",
    title: "Why Time, Choice, and 'What If?'",
    intent: "hook",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "Humans obsess over time, choice, consequence, and 'what if.' Could we change the past? See the future? That tension — between what science allows and what stories imagine — is what makes time travel a bottomless well for curiosity, trivia, and debate.",
      },
    ],
  },
  {
    id: "science.reality",
    title: "What Science Actually Says",
    intent: "explanation",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "Einstein's relativity gives us time dilation: time runs slower for fast-moving or strongly gravitating things. Gravity and speed affect time. GPS satellites have to correct for it; astronauts age a tiny bit less than we do. So 'time travel' into the future is real in a narrow sense.",
      },
      {
        type: "callout",
        emphasis: "highlight",
        content:
          "There is no scientific evidence for traveling backward in time. Science supports time stretching and bending forward; going back is the domain of fiction.",
      },
      {
        type: "paragraph",
        content:
          "Sources: NASA Scientific Visualization Studio (spacetime, relativity); Nobel Prize (Einstein, relativity).",
      },
    ],
  },
  {
    id: "stories.imagine",
    title: "How Stories Imagine Time Travel",
    intent: "overview",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "Fiction fills the gap science can't. Different stories invent different 'rules' — and those rules are what make trivia, debate, and fandom possible. Rule sets, paradoxes, and cause & effect are the language of time-travel storytelling.",
      },
    ],
  },
  {
    id: "film.change-past",
    title: "A. Change the Past, Change the Future",
    intent: "real-world",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "In these stories, altering the past rewrites the future. Small or big changes ripple forward (or backward).",
      },
      {
        type: "bullet-list",
        content: [
          "Back to the Future (Film, 1985–1990). Mechanism: DeLorean, flux capacitor, 88 mph. Rule set: change the past and the present/future updates (Marty's photo fades; fix the past and it snaps back). Core concept: cause and effect, family photo as timeline indicator. Trivia: flux capacitor, 'Great Scott!', 1.21 gigawatts.",
          "The Butterfly Effect (Film, 2004). Mechanism: reading journals / revisiting traumatic moments. Rule set: small changes in the past create huge, often tragic ripples. Core concept: butterfly effect in the title. Trivia: multiple endings; each 'fix' creates new problems.",
          "Hot Tub Time Machine (Film, 2010). Mechanism: malfunctioning hot tub at a ski lodge. Rule set: same idea — change the past, the future changes; played for comedy. Trivia: '80s nostalgia, sequel in 2015.",
        ],
      },
    ],
  },
  {
    id: "film.fixed-timelines",
    title: "B. Fixed Timelines — 'What Happened, Happened'",
    intent: "real-world",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "The past is fixed. You can't really change it; your trip was always part of events. No overwriting — just revelation.",
      },
      {
        type: "bullet-list",
        content: [
          "Twelve Monkeys (Film, 1995). Mechanism: sending prisoners from the future into the past. Rule set: the past is largely fixed; the hero was always part of the events. Core concept: causal loop, pandemic, 'whatever happened, happened.' Trivia: Terry Gilliam; Bruce Willis, Brad Pitt.",
          "Dark (TV, 2017–2020). Mechanism: cave, wormholes, 33-year cycles. Rule set: tightly fixed; every action is part of the loop. Core concept: bootstrap paradoxes, family across time. Trivia: German Netflix; fans debate every detail.",
          "Arrival (Film, 2016). Mechanism: alien language that changes perception of time. Rule set: time perception, not literal travel; past and future experienced at once. Core concept: Sapir–Whorf meets time. Trivia: Denis Villeneuve; linguistics and choice.",
        ],
      },
    ],
  },
  {
    id: "film.time-loops",
    title: "C. Time Loops",
    intent: "real-world",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "One day (or period) repeats. The protagonist learns, changes, or breaks the loop.",
      },
      {
        type: "bullet-list",
        content: [
          "Groundhog Day (Film, 1993). Mechanism: unexplained — Phil wakes up to the same day. Rule set: only he remembers; loop until he grows. Core concept: change yourself, not the past. Trivia: 'I'm a god'; how many loops is still debated.",
          "Edge of Tomorrow (Film, 2014). Mechanism: alien blood resets the day on death. Rule set: loop until mission succeeds; 'live, die, repeat.' Core concept: time loop as training. Trivia: based on All You Need Is Kill; Tom Cruise, Emily Blunt.",
          "Russian Doll (TV, 2019–2022). Mechanism: death resets to the same party. Rule set: loop with subtle shifts; multiple characters can be in loops. Core concept: trauma, friendship, breaking the cycle. Trivia: Natasha Lyonne; two seasons.",
        ],
      },
    ],
  },
  {
    id: "film.branching",
    title: "D. Branching / Multiverse Timelines",
    intent: "real-world",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "Changing the past doesn't overwrite — it branches. Alternate timelines or multiverses coexist.",
      },
      {
        type: "bullet-list",
        content: [
          "Avengers: Endgame (Film, 2019). Mechanism: Pym particles, quantum realm, time heists. Rule set: branching timelines; 'whatever it takes'; returning stones to close branches. Core concept: multiverse, alternate Caps and Lokis. Trivia: 'I am Iron Man'; time-travel rules explained in-film.",
          "Loki (TV, 2021–). Mechanism: TVA, time variance, multiverse. Rule set: sacred timeline vs. branches; variants, He Who Remains. Core concept: who controls time? Trivia: Kang, variants, season 2.",
          "The Flash / Flashpoint (TV & comics). Mechanism: speed force, running through time. Rule set: altering the past creates Flashpoint and new timelines. Core concept: one change, cascading consequences. Trivia: DC; Flashpoint paradox, alternate Batman.",
        ],
      },
    ],
  },
  {
    id: "film.mind-bending",
    title: "E. Mind-Bending / Rule-Heavy",
    intent: "real-world",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "Dense rules, paradoxes baked in, or time that runs backward. For fans who love to untangle the logic.",
      },
      {
        type: "bullet-list",
        content: [
          "Looper (Film, 2012). Mechanism: future sends targets to the past for assassination. Rule set: closing your own loop; paradoxes are part of the plot. Core concept: identity, sacrifice, cause and effect. Trivia: Joseph Gordon-Levitt, Bruce Willis; 'loopers.'",
          "Tenet (Film, 2020). Mechanism: inversion — objects and people moving backward in time. Rule set: 'whatever happened, happened'; entropy inversion. Core concept: don't try to understand it, feel it. Trivia: Christopher Nolan; palindrome, inversion.",
          "Primer (Film, 2004). Mechanism: box that allows limited time travel. Rule set: multiple copies of selves, strict causality; famously complex. Core concept: low-budget, high-logic. Trivia: ~$7,000 budget; timeline diagrams online.",
        ],
      },
    ],
  },
  {
    id: "tv.doctor-who",
    title: "Television Spotlight: Doctor Who",
    intent: "real-world",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "The Doctor travels through time and space in the TARDIS ('bigger on the inside'). Decades of stories have used fixed points, alternate timelines, and the ethics of changing history. Unique time rule: the TARDIS is a character; some events are 'fixed,' others can be rewritten; regeneration allows the show to continue across eras.",
      },
      {
        type: "paragraph",
        content:
          "Why fans debate: fixed points vs. mutable history; whether the Doctor can or should change key events; canon across classic and modern Who. Trivia: 1963–present; multiple Doctors; 'wibbly-wobbly, timey-wimey.'",
      },
    ],
  },
  {
    id: "tv.dark",
    title: "Television Spotlight: Dark",
    intent: "real-world",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "Netflix's German series: a missing child, a cave, and 33-year cycles linking 1953, 1986, 2019, and beyond. Unique time rule: 'what happened, happened' — causal loops and bootstrap paradoxes; the same people appear across generations.",
      },
      {
        type: "paragraph",
        content:
          "Why fans debate: family trees, who is whose younger/older self, and whether the ending allows a true escape. Trivia: three seasons; requires careful viewing and sometimes a chart.",
      },
    ],
  },
  {
    id: "tv.outlander",
    title: "Television Spotlight: Outlander",
    intent: "real-world",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "Claire Randall steps through standing stones in Scotland (1945 → 1743) and meets Jamie Fraser. Unique time rule: the stones 'call' some people; travel is tied to place and sometimes sacrifice; history can be affected but with cost. Based on Diana Gabaldon's novels.",
      },
      {
        type: "paragraph",
        content:
          "Why fans debate: whether history is fixed or changeable; the rules of the stones; historical accuracy vs. romance. Trivia: Starz; multiple books and seasons; time travel as destiny.",
      },
    ],
  },
  {
    id: "tv.umbrella",
    title: "Television Spotlight: The Umbrella Academy",
    intent: "real-world",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "Superpowered siblings, the Commission (time police), and apocalypses. Unique time rule: changing the past creates new timelines and apocalypses; time assassins enforce 'correct' history; paradoxes drive the plot.",
      },
      {
        type: "paragraph",
        content:
          "Why fans debate: how many timelines, who caused which apocalypse, and whether the Commission can be trusted. Trivia: based on Gerard Way's comics; multiple seasons of cause-and-effect chaos.",
      },
    ],
  },
  {
    id: "literature.books",
    title: "Literature & Books",
    intent: "real-world",
    contentBlocks: [
      {
        type: "bullet-list",
        content: [
          "The Time Machine — H.G. Wells (1895). The scientist builds a machine and travels to the far future; Eloi and Morlocks. Foundational for time travel as a fourth dimension. Public-domain; Project Gutenberg, Wikimedia Commons for cover art.",
          "11/22/63 — Stephen King (2011). Portal to 1958; preventing JFK's assassination; the past 'pushes back.' Alternate history and consequence.",
          "Outlander — Diana Gabaldon (1991–). Claire and the stones; 1743 Scotland; romance and history. Source of the TV series.",
          "A Connecticut Yankee in King Arthur's Court — Mark Twain (1889). A Yankee displaced in time; satire and humor. Public-domain.",
        ],
      },
    ],
  },
  {
    id: "comics.games.music",
    title: "Comics, Games, Music",
    intent: "real-world",
    contentBlocks: [
      {
        type: "bullet-list",
        content: [
          "X-Men: Days of Future Past — Wolverine's consciousness sent to the past to prevent a dystopian future; branching timelines in comics and film.",
          "DC Flashpoint — The Flash alters the past; Flashpoint paradox and alternate DC universe.",
          "Doctor Who audio dramas — Big Finish and others; extended time-travel stories in audio.",
          "Music tied to time themes (thematic, not literal time travel): e.g. 'The Power of Love' (Back to the Future), 'Time' (Pink Floyd) — about the passing of time and mortality.",
        ],
      },
    ],
  },
  {
    id: "paradoxes.concepts",
    title: "Paradoxes & Concepts (Trivia Gold)",
    intent: "deep-dive",
    contentBlocks: [
      {
        type: "bullet-list",
        content: [
          "Grandfather paradox: If you go back and prevent your grandparents from meeting, do you cease to exist? Stories resolve it with branching timelines, fixed pasts, or 'whatever happened, happened.'",
          "Bootstrap paradox: An object or information has no origin — it exists because it was brought from the future. (e.g. who wrote the tune?) Dark and Doctor Who use this heavily.",
          "Butterfly effect: A small change in the past leads to huge, often unintended consequences. The Butterfly Effect (2004), Back to the Future, and many others.",
        ],
      },
    ],
  },
  {
    id: "citations.resources",
    title: "Sources & Further Reading",
    intent: "real-world",
    contentBlocks: [
      {
        type: "bullet-list",
        content: [
          "NASA Scientific Visualization Studio — spacetime, relativity (svs.gsfc.nasa.gov).",
          "Nobel Prize — Einstein, relativity (nobelprize.org).",
          "Wikipedia — Back to the Future, Doctor Who, Dark, Outlander, Looper, Tenet, Primer, 11/22/63, The Time Machine, Flashpoint, Avengers: Endgame, Loki.",
          "IMDb — film and TV credits, release dates.",
          "Project Gutenberg — The Time Machine (Wells), A Connecticut Yankee (Twain).",
          "BBC — Doctor Who. Diana Gabaldon — official site. Stanford Encyclopedia of Philosophy — time travel paradoxes.",
        ],
      },
      {
        type: "paragraph",
        content:
          "Every claim on this page is traceable to the sources above. Images: NASA SVS or Wikimedia Commons (public domain / CC) only; film/TV images omitted where no compliant image exists.",
      },
    ],
  },
];

/** Time Travel learning page — interactive knowledge hub: science, film/TV by model, TV spotlights, literature, paradoxes. Cited; no speculation as fact. */
export const timeTravelPage: LearningPage = {
  id: TIME_TRAVEL_PAGE_ID,
  slug: "/learn/time-travel",

  title: "Time Travel: A Deep Dive",
  subtitle: "Science, stories, and the rules that make trivia and fandom possible. For kids, teens, adults, educators, and curious fans.",

  audience: "general",
  tone: "mixed",

  topics: ["time travel", "movies", "film", "TV", "Doctor Who", "Dark", "Outlander", "Umbrella Academy", "Back to the Future", "paradoxes", "butterfly effect", "relativity"],
  concepts: ["time dilation", "fixed timelines", "time loops", "branching", "grandfather paradox", "bootstrap paradox", "rule sets"],

  sections: attachImageSlotsToPage(timeTravelSections, timeTravelImageSlots),

  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sourcesVerified: true,
  },
};

/* ============================================================
   NIKOLA TESLA — GOLD STANDARD BIOGRAPHY PAGE
   ============================================================
   Reusable schema for scientist/inventor biographies. Modular sections,
   image slots with metadata, trivia-ready tags, citations. Attention-span
   optimized (150–300 word chunks), relevance hooks, human-first tone.

   REUSABILITY: Any new scientist/figure can inherit this pattern:
   - intro.hook (hero + tagline + quick-facts callout)
   - early-life | inventions.* (one section per major contribution)
   - personality | legacy | citations.resources
   - Image slots: hero-image, early-life-1, inventions-*, personality-1, modern-influence-1
   - topics/concepts = triviaTags for bingo, quizzes, "Learn more" links.
   - sources in final section; registry = hero[], section[], gallery[], diagram[].
*/

export const NIKOLA_TESLA_PAGE_ID = "biography.scientists.nikola-tesla";

export const teslaImageSlots: ImageSlot[] = [
  { slotId: "hero-image", sectionId: "intro.hook", role: "hero", required: true, preferredOrientation: "portrait", description: "Tesla portrait or lab photo — PD/CC only" },
  { slotId: "early-life-1", sectionId: "early-life", role: "context", required: false, description: "Childhood town, family, or period image" },
  { slotId: "inventions-AC", sectionId: "inventions.ac", role: "context", required: false, description: "AC system diagram or patent sketch" },
  { slotId: "inventions-Tesla-coil", sectionId: "inventions.tesla-coil", role: "context", required: false, description: "Tesla coil diagram or lab photo" },
  { slotId: "inventions-wireless", sectionId: "inventions.wireless", role: "context", required: false, description: "Wireless power or radio-era diagram" },
  { slotId: "personality-1", sectionId: "personality", role: "context", required: false, description: "Lifestyle, pigeons, or persona image" },
  { slotId: "modern-influence-1", sectionId: "legacy", role: "context", required: false, description: "Modern grid, wireless tech, or relevance image" },
];

const teslaSections: LearningSection[] = [
  {
    id: "intro.hook",
    title: "Nikola Tesla (1856–1943)",
    intent: "hook",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "The man who electrified the world — and dreamed of wireless energy before the internet existed. Nikola Tesla was a visionary inventor whose work on alternating current (AC) and high-voltage experiments still shapes how we power our homes and send signals through the air.",
      },
      {
        type: "callout",
        emphasis: "fun-fact",
        content:
          "Born: Smiljan, Austrian Empire (modern Croatia), 1856. Died: New York City, 1943. Major contributions: alternating current (AC), the Tesla coil, radio (dispute with Marconi), induction motor, wireless transmission concepts. Known for: visionary inventions, eccentric genius, long-term influence on modern electrical engineering.",
      },
    ],
  },
  {
    id: "early-life",
    title: "Early Life & Influences",
    intent: "explanation",
    contentBlocks: [
      { type: "divider", content: "" },
      {
        type: "paragraph",
        content:
          "Tesla was born in Smiljan, in what was then the Austrian Empire and is now Croatia. His father was a priest; his mother, Đuka Mandić, had a knack for inventing small household devices and encouraged his curiosity. As a child he was fascinated by machinery, water wheels, and the natural world.",
      },
      {
        type: "paragraph",
        content:
          "He studied engineering and worked in Europe before sailing to the United States in 1884. Early influences — his mother's ingenuity, his father's library, and mentors in physics and engineering — set the stage for a lifetime of invention. Sources: Britannica, PBS, Tesla Society archives.",
      },
    ],
  },
  {
    id: "inventions.ac",
    title: "Alternating Current (AC) & the AC Motor",
    intent: "explanation",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "Tesla's work on alternating current changed how the world gets power. Unlike direct current (DC), AC can be stepped up and down with transformers and sent over long distances with less loss. That's why the grid that powers your home today is AC.",
      },
      {
        type: "paragraph",
        content:
          "He designed the induction motor — a motor that runs on AC without brushes — and championed AC in the famous \"War of the Currents\" with Edison's DC system. AC won. Modern homes, factories, and cities run on the system Tesla helped make standard. Sources: Britannica, IEEE, Smithsonian.",
      },
    ],
  },
  {
    id: "inventions.tesla-coil",
    title: "Tesla Coil & High-Voltage Experiments",
    intent: "explanation",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "The Tesla coil is a resonant transformer that can produce very high voltage, low current, high-frequency electricity. Tesla used it to experiment with wireless transmission, lighting, and dramatic demonstrations. You've probably seen replicas at science museums — the crackling arcs and the smell of ozone.",
      },
      {
        type: "callout",
        emphasis: "fun-fact",
        content:
          "Today the Tesla coil shows up in education, hobbyist projects, and pop culture as a symbol of \"mad scientist\" energy. The physics is real: resonant coupling, high frequency, and spectacular sparks. Sources: IEEE, science museums, patent archives.",
      },
    ],
  },
  {
    id: "inventions.wireless",
    title: "Wireless Power Transmission & Radio Contributions",
    intent: "explanation",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "Tesla dreamed of sending power through the air — no wires. He built the Wardenclyffe Tower on Long Island to test large-scale wireless transmission. The project was never completed, but his ideas influenced later work on radio and resonant circuits.",
      },
      {
        type: "paragraph",
        content:
          "The question of who \"invented\" radio is disputed: Marconi is often credited, but Tesla's patents and experiments on wireless communication were significant. Courts later recognized some of Tesla's claims. Either way, the concepts — tuned circuits, antennas, wireless signals — are part of the foundation of Wi-Fi, radio, and modern wireless tech. Sources: Britannica, patent records, IEEE.",
      },
    ],
  },
  {
    id: "personality",
    title: "Personality & Lifestyle",
    intent: "real-world",
    contentBlocks: [
      { type: "divider", content: "" },
      {
        type: "paragraph",
        content:
          "Tesla was famously eccentric. He never married; he was obsessed with pigeons and would feed and care for them. He had rigid routines — exact meal times, specific numbers of napkins, an aversion to round objects in some accounts. He was a showman in public, demonstrating sparks and lighting, but private and reclusive in later life.",
      },
      {
        type: "paragraph",
        content:
          "His rivalry with Edison — AC vs. DC, and personal friction — is well documented. Disputes with Marconi over radio patents added to a sense of a genius who felt undercredited. Humanizing the man doesn't diminish the inventions; it makes the story more real. Sources: biographies, PBS American Experience, Tesla Society.",
      },
    ],
  },
  {
    id: "legacy",
    title: "Legacy & Modern Influence",
    intent: "real-world",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "Tesla's inventions are foundational today. The electric grid that powers your home runs on AC. Wireless technology — radio, Wi-Fi, Bluetooth — builds on ideas he explored. Renewable energy and electric vehicles carry his name in the public imagination (the car company chose it for a reason).",
      },
      {
        type: "paragraph",
        content:
          "Science museums, hobbyists, and educators still build Tesla coils and explain his work. The \"Tesla\" brand has made him more visible than ever, but the historical figure — the inventor who electrified the world and dreamed of wireless power — is the one we cite. Sources: Britannica, IEEE, Smithsonian.",
      },
    ],
  },
  {
    id: "citations.resources",
    title: "Citations & Resources",
    intent: "real-world",
    contentBlocks: [
      { type: "divider", content: "" },
      {
        type: "bullet-list",
        content: [
          "Encyclopedia Britannica — Nikola Tesla biography (britannica.com/biography/Nikola-Tesla).",
          "PBS American Experience — Tesla documentary and educational materials.",
          "Tesla Society / Tesla Memorial Society — archives and historical context.",
          "Smithsonian Institution — invention and engineering history.",
          "IEEE (Institute of Electrical and Electronics Engineers) — technical history and patents.",
        ],
      },
      {
        type: "paragraph",
        content:
          "Every fact on this page is traceable to reputable sources. When in doubt, we cite. Public domain and CC-licensed images only; see image credits below.",
      },
    ],
  },
];

/** Nikola Tesla biography — gold standard template for scientist/inventor pages. Trivia-ready tags, modular sections, citations. */
export const nikolaTeslaPage: LearningPage = {
  id: NIKOLA_TESLA_PAGE_ID,
  slug: "/learn/nikola-tesla",

  title: "Nikola Tesla",
  subtitle: "The man who electrified the world — and dreamed of wireless energy before the internet existed.",

  audience: "general",
  tone: "mixed",

  topics: ["Nikola Tesla", "inventor", "electricity", "AC", "Tesla coil", "wireless", "radio", "biography", "scientists"],
  concepts: ["alternating current", "induction motor", "Tesla coil", "wireless transmission", "radio", "patents", "War of the Currents"],

  sections: attachImageSlotsToPage(teslaSections, teslaImageSlots),

  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sourcesVerified: true,
  },
};

/* ============================================================
   ALBERT EINSTEIN — BIOGRAPHY PAGE
   ============================================================ */
export const ALBERT_EINSTEIN_PAGE_ID = "biography.scientists.albert-einstein";

export const einsteinImageSlots: ImageSlot[] = [
  { slotId: "hero-image", sectionId: "intro.hook", role: "hero", required: true, preferredOrientation: "portrait", description: "Einstein portrait — PD/CC only" },
  { slotId: "early-life-1", sectionId: "early-life", role: "context", required: false, description: "Early life, Switzerland, patent office" },
  { slotId: "relativity-1", sectionId: "contributions.relativity", role: "context", required: false, description: "Relativity, E=mc², spacetime" },
  { slotId: "legacy-1", sectionId: "legacy", role: "context", required: false, description: "Nobel, modern physics, legacy" },
  { slotId: "citations-1", sectionId: "citations.resources", role: "context", required: false, description: "Sources" },
];

const einsteinSections: LearningSection[] = [
  { id: "intro.hook", title: "Albert Einstein (1879–1955)", intent: "hook", contentBlocks: [
    { type: "paragraph", content: "The father of modern physics. Albert Einstein rewrote our understanding of space, time, and energy with special and general relativity — and became a global symbol of scientific genius and humanist thought." },
    { type: "callout", emphasis: "fun-fact", content: "Born: Ulm, Germany, 1879. Died: Princeton, USA, 1955. Nobel Prize in Physics 1921 (photoelectric effect). Key contributions: special relativity, general relativity, E=mc², Brownian motion, photon. Sources: Nobel Prize, Britannica, Einstein Archives." },
  ]},
  { id: "early-life", title: "Early Life & the Patent Office", intent: "explanation", contentBlocks: [
    { type: "divider", content: "" },
    { type: "paragraph", content: "Einstein was born in Ulm and grew up in Munich and Switzerland. He struggled with rigid schooling but excelled in math and physics. After graduating from ETH Zurich he worked at the Swiss patent office in Bern — a day job that left him time to think. In 1905, his \"miracle year,\" he published papers on the photoelectric effect, Brownian motion, and special relativity." },
    { type: "paragraph", content: "Sources: Britannica, Einstein Archives, Nobel Prize." },
  ]},
  { id: "contributions.relativity", title: "Relativity & E=mc²", intent: "explanation", contentBlocks: [
    { type: "paragraph", content: "Special relativity (1905) showed that space and time are linked: the speed of light is constant, and time dilates and lengths contract at high speeds. General relativity (1915) described gravity as the curvature of spacetime. E=mc² — energy equals mass times the speed of light squared — revealed that mass and energy are interchangeable, with huge implications for nuclear physics and cosmology." },
    { type: "paragraph", content: "Sources: Nobel Prize, Britannica, Stanford Encyclopedia of Philosophy." },
  ]},
  { id: "legacy", title: "Legacy & Influence", intent: "real-world", contentBlocks: [
    { type: "divider", content: "" },
    { type: "paragraph", content: "Einstein's work underpins GPS, nuclear energy, and our understanding of black holes and the expanding universe. He was also a vocal pacifist and advocate for civil rights. His name is synonymous with genius; his papers and letters are preserved in the Einstein Archives." },
    { type: "paragraph", content: "Sources: Caltech, Princeton, Einstein Archives." },
  ]},
  { id: "citations.resources", title: "Citations & Resources", intent: "real-world", contentBlocks: [
    { type: "divider", content: "" },
    { type: "bullet-list", content: ["Nobel Prize — Albert Einstein (nobelprize.org).", "Encyclopedia Britannica — Albert Einstein.", "Einstein Archives — Caltech / Hebrew University.", "Stanford Encyclopedia of Philosophy — Einstein."] },
  ]},
];

export const albertEinsteinPage: LearningPage = {
  id: ALBERT_EINSTEIN_PAGE_ID,
  slug: "/learn/albert-einstein",
  title: "Albert Einstein",
  subtitle: "The father of relativity — space, time, and E=mc².",
  audience: "general",
  tone: "mixed",
  topics: ["Albert Einstein", "relativity", "physics", "Nobel Prize", "E=mc²", "scientists", "biography"],
  concepts: ["special relativity", "general relativity", "photoelectric effect", "spacetime", "gravity"],
  sections: attachImageSlotsToPage(einsteinSections, einsteinImageSlots),
  metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), sourcesVerified: true },
};

/* ============================================================
   ISAAC NEWTON — BIOGRAPHY PAGE
   ============================================================ */
export const ISAAC_NEWTON_PAGE_ID = "biography.scientists.isaac-newton";

export const newtonImageSlots: ImageSlot[] = [
  { slotId: "hero-image", sectionId: "intro.hook", role: "hero", required: true, preferredOrientation: "portrait", description: "Newton portrait — PD/CC only" },
  { slotId: "early-life-1", sectionId: "early-life", role: "context", required: false, description: "Early life, Cambridge" },
  { slotId: "contributions-1", sectionId: "contributions.laws", role: "context", required: false, description: "Laws of motion, gravity" },
  { slotId: "legacy-1", sectionId: "legacy", role: "context", required: false, description: "Legacy" },
];

const newtonSections: LearningSection[] = [
  { id: "intro.hook", title: "Isaac Newton (1643–1727)", intent: "hook", contentBlocks: [
    { type: "paragraph", content: "One of the greatest scientists in history. Isaac Newton formulated the laws of motion and universal gravitation, built the first practical reflecting telescope, and laid the foundations of calculus — shaping physics and mathematics for centuries." },
    { type: "callout", emphasis: "fun-fact", content: "Born: Woolsthorpe, England, 1643. Died: London, 1727. Key works: Principia Mathematica (1687), Opticks. Contributions: three laws of motion, law of universal gravitation, calculus (with Leibniz), optics. Sources: Britannica, Royal Society." },
  ]},
  { id: "early-life", title: "Early Life & Cambridge", intent: "explanation", contentBlocks: [
    { type: "divider", content: "" },
    { type: "paragraph", content: "Newton was born in Woolsthorpe. He studied at Trinity College, Cambridge, and later held the Lucasian Chair of Mathematics. The story of the apple falling (whether literal or not) symbolizes his insight that the same force that pulls the apple also holds the Moon in orbit." },
    { type: "paragraph", content: "Sources: Britannica, Royal Society." },
  ]},
  { id: "contributions.laws", title: "Laws of Motion & Universal Gravitation", intent: "explanation", contentBlocks: [
    { type: "paragraph", content: "In Principia Mathematica Newton stated three laws of motion: inertia, F=ma, and action-reaction. He showed that gravity is a universal force between masses, explaining planetary orbits and tides. His work unified earthly and celestial mechanics and stood until Einstein's relativity refined it at extreme scales." },
    { type: "paragraph", content: "Sources: Britannica, Stanford Encyclopedia of Philosophy." },
  ]},
  { id: "legacy", title: "Legacy", intent: "real-world", contentBlocks: [
    { type: "divider", content: "" },
    { type: "paragraph", content: "Newtonian mechanics still describes most of everyday physics. Calculus (developed independently by Leibniz) is essential to engineering and science. Newton was also Master of the Royal Mint and president of the Royal Society. Sources: Britannica, Royal Society." },
  ]},
];

export const isaacNewtonPage: LearningPage = {
  id: ISAAC_NEWTON_PAGE_ID,
  slug: "/learn/isaac-newton",
  title: "Isaac Newton",
  subtitle: "Laws of motion, universal gravitation, and the foundations of classical physics.",
  audience: "general",
  tone: "mixed",
  topics: ["Isaac Newton", "physics", "gravity", "calculus", "Principia", "scientists", "biography"],
  concepts: ["laws of motion", "universal gravitation", "calculus", "optics"],
  sections: attachImageSlotsToPage(newtonSections, newtonImageSlots),
  metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), sourcesVerified: true },
};

/* ============================================================
   THOMAS EDISON — BIOGRAPHY PAGE
   ============================================================ */
export const THOMAS_EDISON_PAGE_ID = "biography.scientists.thomas-edison";

export const edisonImageSlots: ImageSlot[] = [
  { slotId: "hero-image", sectionId: "intro.hook", role: "hero", required: true, preferredOrientation: "portrait", description: "Edison portrait — PD/CC only" },
  { slotId: "early-life-1", sectionId: "early-life", role: "context", required: false, description: "Early life, Menlo Park" },
  { slotId: "inventions-1", sectionId: "inventions.lightbulb", role: "context", required: false, description: "Light bulb, phonograph" },
  { slotId: "legacy-1", sectionId: "legacy", role: "context", required: false, description: "Legacy" },
];

const edisonSections: LearningSection[] = [
  { id: "intro.hook", title: "Thomas Edison (1847–1931)", intent: "hook", contentBlocks: [
    { type: "paragraph", content: "The Wizard of Menlo Park. Thomas Edison held over a thousand U.S. patents and gave the world the practical incandescent light bulb, the phonograph, and the motion picture camera — plus the first industrial research lab, where invention became a team sport." },
    { type: "callout", emphasis: "fun-fact", content: "Born: Milan, Ohio, 1847. Died: West Orange, New Jersey, 1931. Key inventions: practical incandescent lamp, phonograph, kinetoscope, DC power systems. Known for: Menlo Park lab, \"War of the Currents\" with Tesla (AC vs. DC). Sources: Britannica, Edison Papers, NPS." },
  ]},
  { id: "early-life", title: "Early Life & Menlo Park", intent: "explanation", contentBlocks: [
    { type: "divider", content: "" },
    { type: "paragraph", content: "Edison had little formal schooling; he was largely self-taught and worked as a telegraph operator before opening a lab in Menlo Park, New Jersey. There he and his team turned invention into a repeatable process — testing thousands of materials for the light bulb filament and refining the phonograph and early motion pictures." },
    { type: "paragraph", content: "Sources: Edison Papers, NPS (Edison National Historical Park)." },
  ]},
  { id: "inventions.lightbulb", title: "The Light Bulb, Phonograph & Motion Pictures", intent: "explanation", contentBlocks: [
    { type: "paragraph", content: "Edison did not invent the first light bulb, but he made it practical and long-lasting — and built the power systems to light cities. The phonograph (1877) was the first device to record and play back sound. The kinetoscope and early film work helped birth the movie industry. His DC power systems competed with Tesla's AC; AC eventually won for long-distance transmission." },
    { type: "paragraph", content: "Sources: Britannica, IEEE, Smithsonian." },
  ]},
  { id: "legacy", title: "Legacy", intent: "real-world", contentBlocks: [
    { type: "divider", content: "" },
    { type: "paragraph", content: "Edison's model of the industrial research lab influenced how innovation is done today. His name is on General Electric's origins and on countless patents. The rivalry with Tesla (AC vs. DC) is part of engineering history. Sources: Britannica, Edison Papers, IEEE." },
  ]},
];

export const thomasEdisonPage: LearningPage = {
  id: THOMAS_EDISON_PAGE_ID,
  slug: "/learn/thomas-edison",
  title: "Thomas Edison",
  subtitle: "The Wizard of Menlo Park — light bulb, phonograph, and the birth of industrial R&D.",
  audience: "general",
  tone: "mixed",
  topics: ["Thomas Edison", "inventor", "light bulb", "phonograph", "Menlo Park", "scientists", "biography"],
  concepts: ["incandescent lamp", "phonograph", "DC power", "War of the Currents"],
  sections: attachImageSlotsToPage(edisonSections, edisonImageSlots),
  metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), sourcesVerified: true },
};

/* ============================================================
   END OF GOLD STANDARD FOUNDATION
   ============================================================ */
