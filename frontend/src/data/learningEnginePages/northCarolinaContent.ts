/**
 * North Carolina — rich content blocks: mysteries, folklore, food.
 * Gold-standard pattern for state-by-state expansion. Conversation, not just facts.
 *
 * Reuse for every state:
 * - Mysteries: open-ended questions (Lost Colony–style). No single answer — create conversation.
 * - Folklore: superstitions, stories, legends. Image slots for future imagery.
 * - Food: regional cuisine (e.g. NC barbecue). Hero image to break the block; deep, fun, cultural.
 * - Drinks: unique beverages, "started here," "came from here" — story-led.
 */

/** Open-ended questions. No definitive answer — create mystery and conversation. */
export interface NCMystery {
  id: string;
  title: string;
  hook: string;
  question: string;
  context: string;
  conversationStarter: string;
}

/** Folklore, superstitions, stories. Image slot optional for future imagery. */
export interface NCFolklore {
  id: string;
  title: string;
  story: string;
  imageCaption?: string;
}

/** Regional food / cuisine. Deep, cultural, fun. Image slot for hero (e.g. grill, sauce). */
export interface NCFood {
  id: string;
  title: string;
  region?: string;
  body: string[];
  imageCaption?: string;
  funFacts?: string[];
}

/** Drinks — unique beverages, "started here," story-led. Same pattern as food. */
export interface NCDrink {
  id: string;
  title: string;
  origin?: string;
  body: string[];
  imageCaption?: string;
  funFacts?: string[];
}

export const NORTH_CAROLINA_MYSTERIES: NCMystery[] = [
  {
    id: "lost_colony",
    title: "The Lost Colony",
    hook: "In 1587, more than 100 people landed on Roanoke Island. When a supply ship returned three years later, everyone was gone.",
    question: "What happened to them?",
    context:
      "The only clue was the word 'CROATOAN' carved into a post — the name of a nearby island and a Native nation. Were they absorbed into Indigenous communities? Did they try to sail away? Did they move inland? Historians and archaeologists still debate it. There is no single answer.",
    conversationStarter: "We don't know — and that's okay. What do you think happened? Why might people leave only a word behind?",
  },
  {
    id: "brown_mountain_lights",
    title: "The Brown Mountain Lights",
    hook: "For more than a century, people have reported strange lights hovering over Brown Mountain in the Blue Ridge.",
    question: "What are they?",
    context:
      "Swarms of fireflies? Reflected headlights from a distant road? Ball lightning? Geologic gas? Folklore says they're the lanterns of a lost lover or Cherokee spirits. Scientists have tried to explain them; witnesses still swear they're something else. The lights are real enough to see. The cause is still a mystery.",
    conversationStarter: "Some mysteries stay open. Have you ever seen something you couldn't explain? How do we sit with 'we don't know'?",
  },
  {
    id: "devils_tramping_ground",
    title: "Devil's Tramping Ground",
    hook: "A near-perfect circle in the woods where, legend says, nothing grows. The devil paces here at night.",
    question: "Why won't anything grow in the circle?",
    context:
      "Soil scientists have studied it; so have storytellers. Some say the ground is cursed or packed too hard by supernatural feet. Others look for natural causes — salt, chemistry, compaction. The circle exists. The reason is still up for debate. It's a place where science and story meet.",
    conversationStarter: "Not every story has to end with a fact. What's a local legend where you live that doesn't have a single answer?",
  },
];

export const NORTH_CAROLINA_FOLKLORE: NCFolklore[] = [
  {
    id: "lucky_pig",
    title: "Pigs and luck",
    story:
      "In many parts of the South, including North Carolina, seeing a pig on the way to a fishing trip or before a big event was considered good luck. Some say it's because pigs root forward — moving ahead — while other animals might turn away. Don't be surprised if someone still says 'lucky pig' when one crosses the road.",
    imageCaption: "Pigs in pasture — folklore held they brought good luck when seen before a journey.",
  },
  {
    id: "roanoke_croatoan",
    title: "The word CROATOAN",
    story:
      "After the Lost Colony vanished, the word 'CROATOAN' left behind became more than a clue — it became part of local legend. Some say saying the word out loud can bring bad luck or call back the spirits of the lost. Others use it as a reminder that not every story gets a tidy ending. The word still echoes on the coast.",
    imageCaption: "Roanoke Island — where the Lost Colony left a single word and a lasting mystery.",
  },
  {
    id: "black_cat_weather",
    title: "Black cats and weather",
    story:
      "Old Appalachian and coastal tales sometimes linked black cats to storms or changes in the weather. If a black cat crossed your path before a voyage, some said it was a warning. The line between superstition and caution is thin — and in the mountains and along the coast, weather could mean life or death.",
    imageCaption: "Storm over the coast — weather and superstition often went hand in hand.",
  },
];

export const NORTH_CAROLINA_FOOD: NCFood[] = [
  {
    id: "barbecue",
    title: "North Carolina Barbecue",
    region: "Statewide — but two schools",
    body: [
      "Barbecue in North Carolina isn't one thing — it's a rivalry. Eastern style: whole hog, chopped, with a vinegar-based sauce (pepper, sometimes a little sugar). No tomatoes. Western style (often called Lexington or Piedmont): pork shoulder, a vinegar sauce that includes ketchup or tomato, and a red tint that easterners will tell you is not 'real' NC barbecue. Both are smoked low and slow over wood (often hickory).",
      "The divide runs roughly along the line where the Piedmont meets the coastal plain. Eastern NC barbecue is older and tied to the whole-hog tradition of the coastal South. Lexington style grew up in the Piedmont and spread. You can find both across the state; part of the fun is picking a side — or refusing to.",
      "Sides matter: coleslaw (often vinegary in the east, sweeter in the west), hushpuppies, Brunswick stew in some spots, and always the sauce. In North Carolina, barbecue is culture, identity, and a very serious topic of conversation.",
    ],
    imageCaption: "North Carolina barbecue — whole hog or shoulder, vinegar and smoke, and a debate that never ends.",
    funFacts: [
      "Eastern NC sauce is vinegar + pepper; tomato is optional and often frowned upon.",
      "Lexington claims to be the 'Barbecue Capital of the World' and hosts a famous festival.",
      "Whole-hog cooking can take 12–18 hours. It's an event, not just a meal.",
    ],
  },
];

export const NORTH_CAROLINA_DRINKS: NCDrink[] = [
  {
    id: "cheerwine",
    title: "Cheerwine",
    origin: "Salisbury, North Carolina — 1917",
    body: [
      "A cherry soda that's been made in Salisbury since 1917. The Lewis family started it in a small bottling plant; the recipe is still a closely held secret. Cheerwine is sweet, fizzy, and distinctly Southern — you'll find it in glass bottles, at cookouts, and in recipes (cakes, floats, even barbecue sauce).",
      "It didn't go national for decades; that regional loyalty is part of the story. 'Oh wow, this came from here' — and it really did. Salisbury is still home to the company. If you're in NC and see a red bottle with a cherry on the label, that's the one.",
    ],
    imageCaption: "Cheerwine — born in Salisbury in 1917, still made in North Carolina.",
    funFacts: [
      "The name blends 'cheer' and 'wine' (no alcohol — it's a soda).",
      "Often paired with barbecue or served in a float with vanilla ice cream.",
      "The formula is still secret; the company remains family-involved and NC-based.",
    ],
  },
  {
    id: "pepsi",
    title: "Pepsi",
    origin: "New Bern, North Carolina — 1893",
    body: [
      "Pepsi was invented in New Bern in 1893 by Caleb Bradham, a pharmacist. He called it 'Brad's Drink' at first, then renamed it Pepsi-Cola in 1898 — for pepsin and cola nuts, or so the story goes. He sold it at his drugstore as a digestive aid and a pick-me-up.",
      "The company went bankrupt twice in the early 20th century and didn't become the global giant until much later. But the start — the 'this was started here' — is 100% North Carolina. New Bern still celebrates it; you can visit the site of the original pharmacy and raise a glass (or a can) to the drink that began in a small coastal town.",
    ],
    imageCaption: "Pepsi-Cola — invented in New Bern, NC, in 1893 by pharmacist Caleb Bradham.",
    funFacts: [
      "Originally sold as 'Brad's Drink' at Bradham's drugstore in New Bern.",
      "The name Pepsi-Cola was registered in 1898; the rest is global history.",
      "New Bern has a Pepsi-themed visitor experience and celebrates its hometown drink.",
    ],
  },
];
