/**
 * Learning Engine — validation and conversion.
 * Validates generated pages against the immutable schema.
 * Converts GeneratedLearningPage → LearningPage for rendering.
 */

import type {
  ContentBlock,
  LearningPage,
  LearningSection,
  ImageSlot,
} from "../types/learningEngine";
import type {
  GeneratedLearningPage,
  EngineSection,
  EngineContentBlock,
  EngineSectionId,
} from "../types/learningEngineSchema";
import {
  REQUIRED_SECTION_IDS as REQUIRED_IDS,
  MIN_CROSS_LINKS as MIN_LINKS,
  MIN_TRIVIA_SEEDS as MIN_SEEDS,
} from "../types/learningEngineSchema";

const PLACEHOLDER_PATTERNS = [
  /\[TODO\]/i,
  /\[TBD\]/i,
  /\[placeholder\]/i,
  /\.\.\.\s*$/,
  /^TODO\s*:/im,
  /^TBD\s*$/im,
];

function hasPlaceholder(text: string): boolean {
  const t = text.trim();
  if (t.length < 3) return true;
  return PLACEHOLDER_PATTERNS.some((p) => p.test(t));
}

function collectSectionText(section: EngineSection): string {
  return section.contentBlocks
    .map((b) => (Array.isArray(b.content) ? b.content.join(" ") : b.content))
    .join(" ");
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a generated page before publish.
 * Fails if required sections missing, cross-links < 3, trivia seeds < 5, or placeholders present.
 */
export function validateGeneratedPage(page: GeneratedLearningPage): ValidationResult {
  const errors: string[] = [];
  const sectionIds = new Set(page.sections.map((s) => s.id));

  for (const requiredId of REQUIRED_IDS) {
    if (!sectionIds.has(requiredId)) {
      errors.push(`Missing required section: ${requiredId}`);
    }
  }

  if (page.cross_links.length < MIN_LINKS) {
    errors.push(`Cross-links: need at least ${MIN_LINKS}, got ${page.cross_links.length}`);
  }
  if (page.trivia_seeds.length < MIN_SEEDS) {
    errors.push(`Trivia seeds: need at least ${MIN_SEEDS}, got ${page.trivia_seeds.length}`);
  }

  const tiers = page.difficulty_tiers;
  if (!tiers?.tier1_quick_win?.description) {
    errors.push("Difficulty tier 1 (Quick Win) must be populated");
  }
  if (!tiers?.tier2_explorer?.description) {
    errors.push("Difficulty tier 2 (Explorer) must be populated");
  }
  if (!tiers?.tier3_deep_dive?.description) {
    errors.push("Difficulty tier 3 (Deep Dive) must be populated");
  }

  for (const section of page.sections) {
    const text = collectSectionText(section);
    if (hasPlaceholder(text)) {
      errors.push(`Section "${section.id}" contains placeholder or empty content`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/** Map engine section id to LearningSection intent. */
function sectionIntent(id: EngineSectionId): LearningSection["intent"] {
  const map: Record<string, LearningSection["intent"]> = {
    hero_intro: "hook",
    quick_wow: "hook",
    core_concepts: "overview",
    hands_on_or_examples: "instruction",
    difficulty_tiers: "overview",
    variations_and_experiments: "instruction",
    real_world_connections: "real-world",
    cross_links: "real-world",
    trivia_seeds: "real-world",
    further_exploration: "deep-dive",
  };
  return map[id] ?? "overview";
}

function toContentBlock(b: EngineContentBlock): ContentBlock {
  return {
    type: b.type,
    content: b.content,
    emphasis: b.emphasis,
  };
}

function toLearningSection(engineSection: EngineSection): LearningSection {
  const imageSlots: ImageSlot[] =
    engineSection.imageSlots?.map((meta) => ({
      slotId: meta.slotId,
      sectionId: meta.sectionId,
      role: meta.role,
      required: false,
      description: meta.attributionText ?? meta.slotId,
    })) ?? [];

  return {
    id: engineSection.id,
    title: engineSection.title,
    intent: sectionIntent(engineSection.id),
    contentBlocks: engineSection.contentBlocks.map(toContentBlock),
    imageSlots: imageSlots.length > 0 ? imageSlots : undefined,
  };
}

/**
 * Convert a validated GeneratedLearningPage to the canonical LearningPage
 * so LearningPageView can render it.
 */
export function generatedPageToLearningPage(page: GeneratedLearningPage): LearningPage {
  const sections: LearningSection[] = page.sections.map(toLearningSection);

  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    subtitle: page.subtitle,
    audience: "general",
    tone: "friendly",
    topics: page.topics ?? [],
    concepts: page.concepts ?? [],
    sections,
    metadata: {
      createdAt: page.metadata?.createdAt ?? new Date().toISOString(),
      updatedAt: page.metadata?.updatedAt ?? new Date().toISOString(),
      sourcesVerified: true,
    },
  };
}
