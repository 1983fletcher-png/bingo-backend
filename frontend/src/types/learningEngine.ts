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
   END OF GOLD STANDARD FOUNDATION
   ============================================================ */
