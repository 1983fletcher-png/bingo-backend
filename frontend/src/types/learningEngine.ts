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
    description: "Flat lay of all materials used in the experiment",
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
    title: "Watch It Erupt",
    intent: "hook",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "You mix two everyday ingredients… and suddenly your volcano comes alive. Foamy bubbles spill over the sides like lava, and it feels a little bit like magic.",
      },
      {
        type: "callout",
        emphasis: "fun-fact",
        content:
          "This experiment looks simple, but it's powered by the same kind of chemistry that inflates airbags and fizzes soda.",
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
    id: "materials.list",
    title: "What You'll Need",
    intent: "instruction",
    contentBlocks: [
      {
        type: "bullet-list",
        content: [
          "Baking soda",
          "Vinegar",
          "Dish soap (optional, but fun)",
          "Food coloring (optional)",
          "A container or homemade volcano",
        ],
      },
    ],
  },
  {
    id: "steps.build",
    title: "Build & Erupt",
    intent: "instruction",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "Set up your volcano, add the baking soda, and get ready. When you pour in the vinegar, step back and watch the reaction take over.",
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
          "Baking soda is a base. Vinegar is an acid. When they react, they form carbon dioxide gas — the same gas you exhale when you breathe.",
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
          "Gas takes up more space than liquid. As carbon dioxide forms, pressure builds until it escapes upward.",
      },
    ],
  },
  {
    id: "safety.notes",
    title: "Safety Notes",
    intent: "safety",
    contentBlocks: [
      {
        type: "callout",
        emphasis: "warning",
        content:
          "Never taste the mixture. Protect surfaces and eyes, especially with kids involved.",
      },
    ],
  },
  {
    id: "real-world.connections",
    title: "How This Connects to the Real World",
    intent: "real-world",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "This same gas-producing reaction is used in baking, fire extinguishers, and emergency safety systems.",
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

/* ============================================================
   TIME TRAVEL — FILM, SCIENCE, AND PRACTICAL IMPLICATIONS
   ============================================================
   Canonical learning page: movies, fan theory, real science, and
   "what would you do?" — framed for trivia, depth, and a practical
   takeaway (you probably can't go back; make the future good).
   Sources: NASA, Wikipedia, filmography. No pseudoscience.
*/

export const TIME_TRAVEL_PAGE_ID = "culture.movies.time-travel.practical-implications";

export const timeTravelImageSlots: ImageSlot[] = [
  { slotId: "hero.time-travel", sectionId: "intro.hook", role: "hero", required: true, preferredOrientation: "landscape", description: "Iconic time-travel or clock imagery that draws the reader in" },
  { slotId: "context.science", sectionId: "science.reality", role: "context", required: false, description: "Relativity, spacetime, or time dilation — NASA/educational" },
  { slotId: "context.bttf", sectionId: "film.back-to-the-future", role: "context", required: true, description: "Back to the Future / DeLorean — licensed (e.g. CC-by) only" },
  { slotId: "context.culture", sectionId: "film.culture", role: "context", required: false, description: "Hitchhiker's Guide or other time-travel film/culture" },
  { slotId: "context.cause", sectionId: "cause.ripples", role: "context", required: false, description: "Cause and effect or butterfly effect — film still or diagram" },
  { slotId: "context.tesla", sectionId: "history.tesla", role: "context", required: false, description: "Nikola Tesla (the inventor) — public domain portrait" },
  { slotId: "diagram.paradox", sectionId: "paradoxes", role: "diagram", required: false, description: "Paradox illustration or timeline diagram" },
  { slotId: "context.practical", sectionId: "practical.forward", role: "context", required: false, description: "Forward-looking or choice imagery" },
];

const timeTravelSections: LearningSection[] = [
  {
    id: "intro.hook",
    title: "What If You Could Go Back?",
    intent: "hook",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "A time machine. One choice. The past — or the future. It's one of the oldest questions in stories: what would you do if you could go back in time? Change one moment? Fix one mistake? Or jump ahead to see how it all turns out?",
      },
      {
        type: "callout",
        emphasis: "fun-fact",
        content:
          "This section is about movies and media. We're talking about how films and stories imagine time travel — cause and effect, ripples, the butterfly effect — and what makes each interpretation fun. Factual in the sense of 'based on these movies,' not real-life time machines. Think of it as a touch on learning about film and how different stories tackle the same big what-if.",
      },
      {
        type: "paragraph",
        content:
          "From Back to the Future to The Hitchhiker's Guide to the Galaxy, time travel is everywhere on screen. Here we go deep on the stories, how they handle cause and effect, and the question that still matters: what do you do with the time you've actually got?",
      },
    ],
  },
  {
    id: "science.reality",
    title: "What Science Actually Says (Then: What Movies Do)",
    intent: "explanation",
    contentBlocks: [
      { type: "divider", content: "" },
      {
        type: "paragraph",
        content:
          "Real physics doesn't give us a DeLorean. It does give us something strange: time dilation. Einstein's relativity says time runs slower for fast-moving or strongly gravitating things. GPS satellites correct for it. Astronauts age a tiny bit less than we do. So 'time travel' into the future is real in a narrow sense; going backward isn't something science supports.",
      },
      {
        type: "paragraph",
        content:
          "NASA and experiments like Gravity Probe B have confirmed these effects. We're not doing pseudoscience — we're citing real relativity, then turning to the movies that ask the big what-if and make up their own rules.",
      },
    ],
  },
  {
    id: "film.back-to-the-future",
    title: "Back to the Future & the DeLorean",
    intent: "real-world",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "The DeLorean DMC-12 is a real car. The moment Doc Brown turns it into a time machine (1985) is pure cinema. Back to the Future (1985), directed by Robert Zemeckis, written by Zemeckis and Bob Gale, became a trilogy: 1985, 1989 (Part II), 1990 (Part III).",
      },
      {
        type: "paragraph",
        content:
          "Marty McFly, Doc, the flux capacitor, 88 miles per hour — the filmography is a cornerstone of time-travel pop culture. The movie's take on cause and effect is iconic: change something in the past and the future ripples. Marty's family photo fades when his parents don't meet; fix the past and the future snaps back. The DeLorean has appeared at Universal Studios and in countless fan tributes.",
      },
      {
        type: "callout",
        emphasis: "fun-fact",
        content:
          "The time machine is a character. It's why the DeLorean still shows up in memes, trivia, and 'what would you do with a time machine?' conversations decades later. Sources: Wikipedia (Back to the Future), IMDb, Universal.",
      },
    ],
  },
  {
    id: "film.culture",
    title: "Time Travel in Film & Culture",
    intent: "real-world",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "Different movies interpret time travel in different ways. Some let you change the past and watch the future rewrite itself. Others say the past is fixed — whatever happened, happened. Some give you a single timeline; others branch into parallel worlds. That variety is what makes film and media so fun to dig into.",
      },
      {
        type: "bullet-list",
        content: [
          "The Hitchhiker's Guide to the Galaxy (Douglas Adams; 2005 film) — time, space, and the absurd; the Guide is a kind of handbook for the cosmos.",
          "The Terminator (1984) — machines from the future; fate vs. choice; every action has consequences.",
          "Bill & Ted's Excellent Adventure (1989) — comedy, history, and a phone booth; cause and effect played for laughs.",
          "Groundhog Day (1993) — one day on repeat; a different kind of loop; change yourself, not the past.",
          "The Butterfly Effect (2004) — small changes, huge ripples; the title says it all.",
          "Twelve Monkeys (1995), Looper (2012), Tenet (2020) — each sets its own rules and paradoxes.",
        ],
      },
      {
        type: "paragraph",
        content:
          "This is the pool that feeds trivia and fan theory: who said what, which film had which rules, and how did they handle cause and effect? Knowledge here is filmography — cited to Wikipedia, IMDb, and official sources.",
      },
    ],
  },
  {
    id: "cause.ripples",
    title: "Cause, Effect & the Butterfly Effect",
    intent: "explanation",
    contentBlocks: [
      { type: "divider", content: "" },
      {
        type: "paragraph",
        content:
          "In time-travel stories, cause and effect get twisted. You do one thing in the past — and the future ripples. Sometimes a tiny change has huge consequences. That's the butterfly effect: the idea that a small cause can lead to a massive effect somewhere else, or later.",
      },
      {
        type: "paragraph",
        content:
          "Movies run with it. Back to the Future shows Marty's present changing when the past changes — his family, the town, the photo. The Terminator is about preventing a future by changing the past (or trying to). The Butterfly Effect (2004) puts it in the title: the protagonist keeps going back to fix things and each fix ripples into new problems.",
      },
      {
        type: "callout",
        emphasis: "fun-fact",
        content:
          "The fun is in the rules each film sets. Does changing the past overwrite the future? Create a new branch? Or is the past locked so that your trip was 'always' part of what happened? Different movies, different answers — and that's what makes comparing them so interesting.",
      },
      {
        type: "paragraph",
        content:
          "Ripples and butterfly effects are a way films explore responsibility: if you could change one moment, would you? And what else might change with it?",
      },
    ],
  },
  {
    id: "history.tesla",
    title: "Nikola Tesla: Man, Myth & Time",
    intent: "explanation",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "Nikola Tesla — the inventor (1856–1943), not the car company — was a real person: AC power, the Tesla coil, countless patents. He's often woven into time-travel and sci-fi lore because his ideas felt ahead of their time.",
      },
      {
        type: "paragraph",
        content:
          "Some stories imagine him building devices that bend time or space. That's fiction. The fascination is real: he shows up in time-travel and alternate-history discussions as the 'what if' of invention — the line between real science and legend. We include him here so it's clear we're talking about the historical figure. Sources: Wikipedia (Nikola Tesla), Smithsonian, historical archives.",
      },
    ],
  },
  {
    id: "paradoxes",
    title: "Paradoxes & How Films Resolve Them",
    intent: "deep-dive",
    contentBlocks: [
      {
        type: "paragraph",
        content:
          "The grandfather paradox: if you go back and change the past, do you erase the future that sent you back? Films and books each set their own rules. Some use parallel timelines so the old future still 'exists' somewhere. Some say the past is fixed — whatever happened happened — so there's no paradox. Others let one timeline overwrite another.",
      },
      {
        type: "bullet-list",
        content: [
          "Back to the Future — changing the past rewrites the present; the photo and the town change in real time.",
          "Twelve Monkeys — the past is largely fixed; the hero was always part of the events.",
          "Looper — branches and paradoxes are part of the plot; the film leans into the mess.",
          "Tenet — time inversion and 'whatever happened, happened' in a high-concept package.",
        ],
      },
      {
        type: "callout",
        emphasis: "fun-fact",
        content:
          "The fun is in the puzzle. Trivia loves 'how did this movie resolve the paradox?' and 'what would you do if you had one trip?' — which leads to the last question.",
      },
    ],
  },
  {
    id: "practical.forward",
    title: "You Probably Can't Go Back. So What?",
    intent: "real-world",
    contentBlocks: [
      { type: "divider", content: "" },
      {
        type: "paragraph",
        content:
          "Logically, you probably aren't going to get a time machine. So the practical implication isn't about changing the past — it's about the future. What do you do moving forward to get a good future? What do you fix, build, or choose now?",
      },
      {
        type: "paragraph",
        content:
          "That's the turn we leave you with. The stories are fun. The science is real where we've cited it. The movies are a great way to think about cause, effect, and ripples. And the question that actually matters: how do you want the next chapter to go?",
      },
    ],
  },
];

/** Time Travel learning page — movies, cause & effect, ripples, butterfly effect, and practical takeaway. Golden standard: blocked, fun, cited. */
export const timeTravelPage: LearningPage = {
  id: TIME_TRAVEL_PAGE_ID,
  slug: "/learn/time-travel",

  title: "Time Travel and Its Practical Implications",
  subtitle: "How movies and media imagine time travel, cause and effect, ripples, and the butterfly effect — plus the question that actually matters.",

  audience: "general",
  tone: "mixed",

  topics: ["time travel", "movies", "film", "media", "science fiction", "Back to the Future", "Hitchhiker's Guide to the Galaxy", "cause and effect", "butterfly effect"],
  concepts: ["relativity", "time dilation", "filmography", "cause and effect", "ripples", "butterfly effect", "paradoxes", "practical implications"],

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
   END OF GOLD STANDARD FOUNDATION
   ============================================================ */
