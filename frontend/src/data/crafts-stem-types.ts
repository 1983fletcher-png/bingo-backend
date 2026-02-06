/**
 * Crafts & STEM project schema — gold standard structure for Learn & Grow.
 */

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface CraftStemMaterial {
  name: string;
  household?: boolean;
  optional?: boolean;
}

export interface CraftStemVariation {
  title: string;
  description: string;
}

export interface CraftStemProject {
  slug: string;
  title: string;
  wowFactor: string;
  materials: CraftStemMaterial[];
  steps: string[];
  science: string;
  variations: CraftStemVariation[];
  learnings: string[];
  ageRange: string;
  difficulty: Difficulty;
  safety: string | null;
  whyItMatters: string;
}
