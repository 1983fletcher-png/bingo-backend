/**
 * North Carolina — Learning Engine geography page (gold standard).
 * Guided exploration: contradictions, three worlds, geology → life → people.
 * Psychology-driven: entry moment, micro-hooks, contrast, cross-links.
 */

import type { GeneratedLearningPage } from "../../types/learningEngineSchema";
import { validateGeneratedPage } from "../../lib/learningEngineValidation";

export const NORTH_CAROLINA_PAGE_ID = "geography.place.north-carolina";

const northCarolinaPage: GeneratedLearningPage = {
  id: NORTH_CAROLINA_PAGE_ID,
  slug: "/learn/north-carolina",
  topic: "North Carolina",
  type: "geography",
  title: "North Carolina: Three Worlds in One State",
  subtitle:
    "A place where contradictions coexist — mountains, piedmont, and a coast that never sits still. You can stand in snow and reach the ocean before dinner.",

  target_audience: ["kids", "teens", "adults", "mixed"],
  depth_level: "deep_dive",

  sections: [
    {
      id: "hero_intro",
      title: "Where Contradictions Coexist",
      contentBlocks: [
        {
          type: "paragraph",
          content:
            "North Carolina is not a single place. It's a place where contradictions coexist — and that's why it's fascinating.",
        },
        {
          type: "callout",
          emphasis: "fun-fact",
          content:
            "You can stand in snow-covered mountains in the morning and reach the ocean before dinner. Same state. Same day. That sentence alone is the hook.",
        },
      ],
    },
    {
      id: "quick_wow",
      title: "Wait — That's Weird",
      contentBlocks: [
        {
          type: "paragraph",
          content:
            "Before we zoom in: a few lines that don't fit the usual \"state facts\" list. These are the dopamine hits.",
        },
        {
          type: "callout",
          emphasis: "fun-fact",
          content:
            "This land used to be part of Africa. These mountains were once taller than the Himalayas. This coast is still moving. The oldest mountains in North America are here — and they're older than trees.",
        },
      ],
    },
    {
      id: "core_concepts",
      title: "Where Are You, Really?",
      contentBlocks: [
        {
          type: "paragraph",
          content:
            "World map → U.S. → Southeast → North Carolina. Each zoom can reveal one surprising fact, not a paragraph. You're not just learning location; you're earning it.",
        },
        {
          type: "paragraph",
          content:
            "Then: three worlds in one state. Not a list of regions — three characters.",
        },
        {
          type: "bullet-list",
          content: [
            "The Blue Ridge (The Ancient One): Oldest mountains in North America. Rounded, not sharp — time did that. Home to rare species. Micro-hook: These mountains are older than trees.",
            "The Piedmont (The Connector): Rolling hills. Most cities and people live here. Why humans settled here first. Micro-hook: Most people live here — and most don't know why.",
            "The Coastal Plain (The Shapeshifter): Barrier islands, hurricanes, moving sand. Micro-hook: The land here rearranges itself every year.",
          ],
        },
      ],
    },
    {
      id: "hands_on_or_examples",
      title: "What's Under Your Feet?",
      contentBlocks: [
        {
          type: "paragraph",
          content:
            "Everything you see exists because of what you can't see. Instead of geology jargon: cause → effect.",
        },
        {
          type: "bullet-list",
          content: [
            "Mountains exist → rivers form → fertile soil → farms → cities.",
            "Old rock erodes → sediment travels → coast builds and shifts.",
            "Tectonic history → the land that once touched Africa → the Appalachians we walk today.",
          ],
        },
        {
          type: "callout",
          emphasis: "highlight",
          content:
            "Geology feels useful when it explains why people and life ended up where they did.",
        },
      ],
    },
    {
      id: "difficulty_tiers",
      title: "How Deep Do You Want to Go?",
      contentBlocks: [
        {
          type: "paragraph",
          content:
            "Peek, sample, back out, or dive deep — without feeling like homework. Short, rewarding interactions; expand-on-demand depth.",
        },
      ],
    },
    {
      id: "variations_and_experiments",
      title: "Why So Much Life Lives Here — and Who Shares This Land",
      contentBlocks: [
        {
          type: "paragraph",
          content:
            "Ecosystem tiles: each answers — Why here? What makes it special? What would disappear if it changed? That feeds climate, conservation, and trivia naturally.",
        },
        {
          type: "paragraph",
          content:
            "Animals aren't just animals. Each is a problem-solver, an adapter, a specialist. Example: Why can black bears thrive in both mountains and suburbs? You're teaching adaptation without saying the word until they're curious.",
        },
      ],
    },
    {
      id: "real_world_connections",
      title: "Why the Weather Makes No Sense — and Why People Built Where They Did",
      contentBlocks: [
        {
          type: "paragraph",
          content:
            "Compare Asheville, Wilmington, and Raleigh. Why does one state feel like three climates? That leads into hurricanes, snow, heat — geography and weather, linked.",
        },
        {
          type: "paragraph",
          content:
            "Human geography: no dates at first, no names at first. Just rivers, passes, soil, safety. Then history slots neatly into place. Why people built where they did — and why it still matters.",
        },
      ],
    },
    {
      id: "cross_links",
      title: "Follow the Threads",
      contentBlocks: [
        {
          type: "paragraph",
          content:
            "The mycelium idea: one topic leads to another. Wander, don't just finish.",
        },
        {
          type: "bullet-list",
          content: [
            "Biology → Animals, ecosystems, climate.",
            "Geology → How mountains form, erosion, volcanoes (tie back to experiments).",
            "History → Indigenous cultures, settlement, rivers as roads.",
            "Crafts & STEM → Erosion in a jar, map projections, weather observation.",
          ],
        },
      ],
    },
    {
      id: "trivia_seeds",
      title: "Seeds for Trivia & Games",
      contentBlocks: [
        {
          type: "paragraph",
          content:
            "Oldest mountain range in North America. Land that used to be part of Africa. A coast that moves. Black bears in suburbs. One state, three climates. These seeds become bingo clues, quiz questions, and \"did you know?\" moments.",
        },
      ],
    },
    {
      id: "further_exploration",
      title: "This Page Knows More Than It Shows",
      contentBlocks: [
        {
          type: "paragraph",
          content:
            "Hidden layer: trivia seeds, difficulty tiers, cross-topic hooks. The system is built so you can peek, sample, or dive — and every path connects to something else.",
        },
        {
          type: "bullet-list",
          content: [
            "Compare NC to another state with three regions (e.g. California, Texas).",
            "Trace one river from mountains to coast. What changes?",
            "Look up barrier island movement and hurricane history — then tie back to \"the land rearranges itself.\"",
          ],
        },
      ],
    },
  ],

  difficulty_tiers: {
    tier1_quick_win: {
      tier: "quick_win",
      title: "Quick Win",
      description:
        "One sentence, one image, one surprise. \"You can stand in snow and reach the ocean before dinner.\" Or: \"These mountains are older than trees.\" Peek and leave — or stay.",
    },
    tier2_explorer: {
      tier: "explorer",
      title: "Explorer",
      description:
        "Compare the three regions. Asheville vs Wilmington vs Raleigh: why does one state feel like three climates? Sample one ecosystem tile, one animal story. Cause and effect without commitment.",
      relatedTopicId: "geography",
    },
    tier3_deep_dive: {
      tier: "deep_dive",
      title: "Deep Dive",
      description:
        "Geology under your feet. Why people built where they did. Rivers, passes, soil, safety — then names and dates. Ecosystems, conservation, and how NC ties to broader geography and history.",
      relatedTopicId: "geography",
    },
  },

  cross_links: [
    { type: "concept_link", label: "Geology and erosion", targetId: "crafts-stem" },
    { type: "concept_link", label: "Climate and weather" },
    { type: "craft_link", label: "Erosion experiments, map projections", targetId: "crafts-stem" },
    { type: "culture_link", label: "Indigenous cultures and settlement history" },
    { type: "modern_use_link", label: "Conservation, barrier islands, hurricane preparedness" },
    { type: "concept_link", label: "Ecosystems and biodiversity" },
  ],

  trivia_seeds: [
    { type: "fact", content: "The Blue Ridge mountains are among the oldest in North America — older than trees." },
    { type: "fact", content: "Parts of North Carolina's rock once belonged to the African continent before tectonic movement." },
    { type: "cause_effect", content: "Mountains erode → rivers carry sediment → coastal plain and barrier islands shift over time." },
    { type: "true_false_candidate", content: "You can stand in snow in North Carolina and reach the ocean the same day." },
    { type: "misconception", content: "NC is just \"the South\" — in fact it holds three distinct worlds: mountains, piedmont, and a moving coast." },
    { type: "historical_note", content: "Human settlement followed rivers, passes, and soil; geography shaped where people built." },
  ],

  topics: [
    "North Carolina",
    "geography",
    "place",
    "region",
    "Blue Ridge",
    "Piedmont",
    "Coastal Plain",
    "mountains",
    "climate",
    "landforms",
    "earth",
  ],
  concepts: [
    "three regions",
    "geology",
    "erosion",
    "ecosystems",
    "human settlement",
    "climate variation",
    "biodiversity",
  ],

  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sourcesVerified: true,
  },
};

const validation = validateGeneratedPage(northCarolinaPage);
if (!validation.valid) {
  console.warn("[Learning Engine] North Carolina page validation failed:", validation.errors);
}

export const northCarolinaEnginePage = northCarolinaPage;

/** Zoom sequence for "Where are you, really?" — World → US → Southeast → NC. One fact per step. */
export const NORTH_CAROLINA_ZOOM_STEPS: { label: string; fact: string }[] = [
  { label: "World", fact: "North Carolina sits where ancient continents once collided." },
  { label: "United States", fact: "The Southeast holds three distinct landscapes in one state." },
  { label: "Southeast", fact: "This land used to be part of Africa." },
  { label: "North Carolina", fact: "These mountains were once taller than the Himalayas. This coast is still moving." },
];

/** Hero headline — the one line that buys attention. */
export const NORTH_CAROLINA_HERO_HEADLINE =
  "You can stand in snow-covered mountains… and reach the ocean before dinner.";

/** Three regions for the interactive map: hover to reveal, click to dive deeper. */
export interface NCRegion {
  id: "blue_ridge" | "piedmont" | "coastal_plain";
  label: string;
  shortLabel: string;
  /** One line for hover / tooltip. */
  tagline: string;
  /** Deep-dive content: paragraphs and bullets. */
  deepContent: { type: "paragraph" | "bullet-list"; content: string | string[] }[];
}

export const NORTH_CAROLINA_REGIONS: NCRegion[] = [
  {
    id: "blue_ridge",
    label: "Blue Ridge (Mountains)",
    shortLabel: "Mountains",
    tagline: "The Ancient One — older than trees.",
    deepContent: [
      { type: "paragraph", content: "The Blue Ridge is the oldest mountain range in North America. Time rounded these peaks; they were once taller than the Himalayas. Erosion and uplift tell a billion-year story." },
      { type: "bullet-list", content: [
        "Oldest mountains in North America — older than trees.",
        "Rounded, not sharp: millions of years of weather and erosion.",
        "Home to rare species and distinct ecosystems.",
        "Snow in winter; cool summers. A different climate from the coast.",
      ]},
      { type: "paragraph", content: "When you stand here, you're on rock that once touched another continent. The geology under your feet connects to Africa, to ancient collisions, and to the rivers that carved the rest of the state." },
    ],
  },
  {
    id: "piedmont",
    label: "Piedmont",
    shortLabel: "Piedmont",
    tagline: "The Connector — where most people live, and most don't know why.",
    deepContent: [
      { type: "paragraph", content: "Rolling hills between the mountains and the coast. The Piedmont is where rivers slow down, soil builds up, and people have settled for thousands of years. Most of North Carolina's cities and towns are here." },
      { type: "bullet-list", content: [
        "Rolling hills — not flat, not steep. Goldilocks terrain.",
        "Rivers cross here on their way from mountains to sea; fertile soil and water made it ideal for farming and towns.",
        "Charlotte, Raleigh–Durham, Greensboro, Winston-Salem — the urban heart of the state.",
        "Why here first? Water, passes through the hills, and land that could grow food.",
      ]},
      { type: "paragraph", content: "Human geography starts with the land: the Piedmont connected mountain resources to coastal trade. Rivers were roads; later, railroads and highways followed the same logic." },
    ],
  },
  {
    id: "coastal_plain",
    label: "Coastal Plain",
    shortLabel: "Coast",
    tagline: "The Shapeshifter — the land rearranges itself every year.",
    deepContent: [
      { type: "paragraph", content: "Barrier islands, estuaries, and a coast that never sits still. Hurricanes, waves, and wind move sand; inlets open and close. What you see on a map today may shift in a decade." },
      { type: "bullet-list", content: [
        "Barrier islands protect the mainland; they absorb storm surge and move over time.",
        "Estuaries where freshwater meets salt — some of the most productive ecosystems on Earth.",
        "Hurricanes and nor'easters reshape the coast. The Outer Banks are famous for both beauty and change.",
        "This coast is still moving. Sea level, sediment, and storms make the coastal plain a work in progress.",
      ]},
      { type: "paragraph", content: "Understanding the coast means accepting change. Communities here adapt to erosion, flooding, and the same forces that built the land in the first place." },
    ],
  },
];
