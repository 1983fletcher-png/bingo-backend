/**
 * Slime — Learning Engine gold-standard page (Crafts/STEM).
 * Generated structure: all 10 sections, difficulty tiers, cross-links, trivia seeds.
 * Use generatedPageToLearningPage() for rendering.
 */

import type { GeneratedLearningPage } from "../../types/learningEngineSchema";
import { validateGeneratedPage } from "../../lib/learningEngineValidation";

export const SLIME_PAGE_ID = "craft.stem.slime";

const slimePage: GeneratedLearningPage = {
  id: SLIME_PAGE_ID,
  slug: "/learn/slime",
  topic: "Slime",
  type: "craft",
  title: "Slime: Polymers You Can Hold",
  subtitle: "A handful of goo that stretches, squishes, and teaches real chemistry — polymers and non-Newtonian fluids.",

  target_audience: ["kids", "teens", "mixed"],
  depth_level: "standard",

  sections: [
    {
      id: "hero_intro",
      title: "Why Slime?",
      contentBlocks: [
        {
          type: "paragraph",
          content:
            "A handful of goo that stretches, squishes, and sometimes bounces. Slime is a perfect gateway to polymers and non-Newtonian fluids — and it's irresistibly fun to play with.",
        },
        {
          type: "callout",
          emphasis: "fun-fact",
          content:
            "The same kind of chemistry that makes slime stretchy is at work in rubber bands, plastic bottles, and the proteins in your body. You're not just making a toy; you're feeling materials science.",
        },
      ],
    },
    {
      id: "quick_wow",
      title: "The Wow Moment",
      contentBlocks: [
        {
          type: "paragraph",
          content:
            "One minute you're stirring runny glue and water; the next, you're pulling a stretchy blob that oozes when you let it sit and resists when you punch it. That sudden change from liquid to goo is the hook.",
        },
      ],
    },
    {
      id: "core_concepts",
      title: "What's Actually Happening?",
      contentBlocks: [
        {
          type: "paragraph",
          content:
            "Glue contains long chains of molecules called polymers. The borax or liquid starch solution links those chains together — that's cross-linking. You end up with a network: the material can flow slowly like a liquid but also stretch and hold shape when you pull it. That's why slime is a non-Newtonian fluid: its behavior depends on how you push or pull it.",
        },
        {
          type: "bullet-list",
          content: [
            "Polymers: long chains of repeating units (like beads on a string).",
            "Cross-linking: bonds between chains that turn a runny liquid into a stretchy network.",
            "Non-Newtonian: viscosity changes with stress — slow flow, fast resistance.",
          ],
        },
      ],
    },
    {
      id: "hands_on_or_examples",
      title: "Make It",
      contentBlocks: [
        {
          type: "bullet-list",
          content: [
            "Mix ½ cup white school glue (PVA) with ½ cup water in a bowl. Add food coloring or glitter if you like.",
            "Add liquid starch (or borax solution: 1 tsp borax in 1 cup water) a little at a time, stirring until the mixture pulls away from the bowl and forms a stretchy blob.",
            "Knead with your hands until it's smooth and no longer sticky. Store in a sealed bag.",
          ],
        },
        {
          type: "paragraph",
          content:
            "You need: white school glue (PVA), liquid starch or borax solution, water, bowl and spoon. Optional: food coloring, glitter.",
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
            "Slime works at three levels: quick win (just make it and play), explorer (change one variable and compare), and deep dive (polymers, viscosity, and real-world materials).",
        },
      ],
    },
    {
      id: "variations_and_experiments",
      title: "Try This Too",
      contentBlocks: [
        {
          type: "bullet-list",
          content: [
            "Fluffy slime: Add shaving cream to the glue before adding activator. Lighter, foamier texture — explore how much foam changes the feel.",
            "Clear slime: Use clear glue instead of white. Add small objects inside and watch how they look through the polymer.",
            "Magnetic slime: Mix in fine iron oxide (magnetic powder) and use a strong magnet to move or shape the slime from the outside.",
            "Change the amount of activator: More borax or starch usually makes stiffer slime; less keeps it gooier. Record what you try.",
          ],
        },
      ],
    },
    {
      id: "real_world_connections",
      title: "Where This Shows Up in the Real World",
      contentBlocks: [
        {
          type: "paragraph",
          content:
            "Polymers are everywhere: plastic bottles, rubber bands, tires, DNA, and the proteins in your body. Shock absorbers and some protective gear use materials that stiffen on impact — the same idea as slime that resists a quick punch. Understanding how cross-linking changes properties is core to materials science and engineering.",
        },
      ],
    },
    {
      id: "cross_links",
      title: "Connect the Dots",
      contentBlocks: [
        {
          type: "bullet-list",
          content: [
            "Non-Newtonian fluids: Oobleck (cornstarch and water) — same “solid when you hit it” idea.",
            "Polymers: Baking soda volcano (reactions) and slime (chains and cross-links) are different chemistry; both are household chemistry.",
            "Nikola Tesla: Materials and invention; his work on materials and electricity fits the “how do we engineer stuff?” thread.",
            "Ghostbusters slime: Pop culture hook for “weird fluids” and lab aesthetics.",
            "Modern use: Shock-absorbing materials, protective gear, and some paints use non-Newtonian or polymer ideas.",
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
            "These facts can become bingo clues, quiz questions, or call-and-response: Slime flows slowly under pressure but resists sudden force. Polymers are long chains of molecules; cross-linking turns liquid glue into a stretchy network. PVA (polyvinyl acetate) is in school glue and slime. Non-Newtonian fluids don't follow the simple “liquid vs solid” rule. A common misconception: “Slime is just glue” — the activator (borax or starch) is what links the chains. Historical note: Synthetic polymers like PVA were developed in the 20th century; slime as a toy took off with the right chemistry and marketing.",
        },
      ],
    },
    {
      id: "further_exploration",
      title: "Go Deeper",
      contentBlocks: [
        {
          type: "bullet-list",
          content: [
            "Compare slime to Oobleck: one is polymer cross-linking, one is particle suspension. Both are non-Newtonian.",
            "Research PVA and borax: what exactly is the cross-linking reaction? (Safe for kids to know “linking” without the full equation.)",
            "Look up materials that stiffen on impact — from body armor to shoe insoles — and see the same principle.",
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
        "Follow the recipe, make slime in a few minutes, and play. The payoff is immediate: you get a stretchy, oozy material that feels nothing like the glue you started with. No variables to change — just “I made it, and it works.”",
    },
    tier2_explorer: {
      tier: "explorer",
      title: "Explorer",
      description:
        "Change one thing at a time: more or less activator, different glue (clear vs white), add-ins like glitter or foam. Compare stiffness, stretch, and how long each batch lasts. Build cause-and-effect thinking: “When I added more borax, the slime got stiffer.”",
      relatedTopicId: "crafts-stem",
    },
    tier3_deep_dive: {
      tier: "deep_dive",
      title: "Deep Dive",
      description:
        "Polymers, cross-linking, and non-Newtonian fluids in plain language. How does PVA work? What does borax do to the chains? Connect to real-world materials (rubber, plastic, shock absorbers) and optionally look up the chemistry behind the reaction. Links to chemistry and materials science.",
      relatedTopicId: "baking-soda-volcano",
    },
  },

  cross_links: [
    { type: "concept_link", label: "Non-Newtonian fluids", targetId: "crafts-stem-oobleck" },
    { type: "concept_link", label: "Polymers and cross-linking" },
    { type: "craft_link", label: "Oobleck (cornstarch)", targetId: "crafts-stem-oobleck" },
    { type: "craft_link", label: "Baking soda volcano", targetId: "baking-soda-volcano" },
    { type: "biography_link", label: "Nikola Tesla (materials, invention)", targetId: "nikola-tesla" },
    { type: "culture_link", label: "Ghostbusters slime" },
    { type: "modern_use_link", label: "Shock absorbers and impact-resistant materials" },
  ],

  trivia_seeds: [
    { type: "fact", content: "Slime flows slowly under pressure but resists sudden force." },
    { type: "cause_effect", content: "Adding more borax or liquid starch usually makes slime stiffer; less keeps it gooier." },
    { type: "true_false_candidate", content: "Slime is a non-Newtonian fluid." },
    { type: "misconception", content: "Slime is just glue — in fact the activator (borax or starch) cross-links the polymer chains." },
    { type: "historical_note", content: "Synthetic polymers like PVA were developed in the 20th century; slime as a toy took off with the right chemistry and marketing." },
    { type: "fact", content: "PVA (polyvinyl acetate) is the polymer in school glue and in many slime recipes." },
  ],

  topics: ["slime", "polymers", "non-Newtonian fluids", "chemistry", "crafts", "STEM"],
  concepts: ["polymers", "cross-linking", "viscosity", "non-Newtonian fluid", "PVA", "borax"],

  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sourcesVerified: true,
  },
};

const validation = validateGeneratedPage(slimePage);
if (!validation.valid) {
  console.warn("[Learning Engine] Slime page validation failed:", validation.errors);
}

export const slimeEnginePage = slimePage;
