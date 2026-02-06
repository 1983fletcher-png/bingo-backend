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

/** Film shot or set in NC. Trivia backbone for "what was filmed here." */
export interface NCFilm {
  id: string;
  title: string;
  year: number;
  ncConnection: string;
  body: string[];
  triviaSeeds?: string[];
  imagePlaceholder?: string;
}

/** Musician born in or strongly tied to NC. Leads to biography/trivia. */
export interface NCMusician {
  id: string;
  name: string;
  origin: string;
  genre: string;
  bio: string[];
  notableWorks?: string[];
  imagePlaceholder?: string;
}

/** Actor born in or strongly tied to NC. Celebrity/trivia backbone. */
export interface NCActor {
  id: string;
  name: string;
  origin: string;
  bioShort: string;
  notableWorks?: string[];
  imagePlaceholder?: string;
}

/** Detailed location: waterfall, estate, park, scenic drive. How to get there, history, film tie-ins. Link to official site for full info. */
export type NCLocationType = "waterfall" | "estate" | "park" | "landmark" | "historic" | "scenic_drive" | "state_park";

export interface NCLocation {
  id: string;
  name: string;
  type: NCLocationType;
  region: string;
  description: string[];
  howToGetThere: string;
  history?: string;
  filmConnection?: string;
  triviaSeeds?: string[];
  imagePlaceholder?: string;
  /** Short tagline: what it's known for (e.g. "America's Favorite Drive"). */
  knownFor?: string;
  /** Official park/service website — we summarize; they have full info. No copyright; link out. */
  officialUrl?: string;
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

// ========== ENTERTAINMENT: Film, media, musicians, actors (trivia backbone) ==========

export const NORTH_CAROLINA_FILMS: NCFilm[] = [
  {
    id: "last_of_the_mohicans",
    title: "The Last of the Mohicans",
    year: 1992,
    ncConnection: "Filmed in Chimney Rock State Park, Lake Lure, and DuPont State Recreational Forest.",
    body: [
      "The 1992 film brought Hawkeye, Cora, and Magua to the mountains of North Carolina. The climactic chase and fight scenes were shot at Chimney Rock State Park — including Hickory Nut Falls, one of the tallest waterfalls in the East — and at DuPont State Forest near Brevard, where Bridal Veil Falls, High Falls, and Triple Falls appear on screen.",
      "Locals still point to the exact ledges and trails where the cast and crew worked. The movie put North Carolina's waterfalls and gorge scenery on the map for filmmakers and travelers alike. Trivia: Which NC waterfall can you walk behind? Which one did the Mohicans film use? It all ties together.",
    ],
    triviaSeeds: [
      "The Last of the Mohicans was filmed in North Carolina.",
      "Hickory Nut Falls at Chimney Rock was used for the film's finale.",
      "DuPont State Forest waterfalls appear in The Last of the Mohicans.",
    ],
    imagePlaceholder: "film_last_mohicans",
  },
  {
    id: "bull_durham",
    title: "Bull Durham",
    year: 1988,
    ncConnection: "Set and filmed in Durham, North Carolina — minor-league baseball and local flavor.",
    body: [
      "Kevin Costner, Susan Sarandon, and Tim Robbins brought minor-league baseball and Durham to the big screen. The film was shot at the old Durham Athletic Park and around town, capturing the vibe of a Carolina League team and the people who love it. It's one of the most beloved baseball movies ever made — and it's 100% North Carolina.",
      "Durham still celebrates its connection to the film; the sport and the city are part of the story. Trivia: What North Carolina city was the setting for Bull Durham?",
    ],
    triviaSeeds: [
      "Bull Durham was set and filmed in Durham, North Carolina.",
      "Durham Athletic Park was a key filming location for Bull Durham.",
    ],
    imagePlaceholder: "film_bull_durham",
  },
  {
    id: "biltmore_on_screen",
    title: "Biltmore on Screen",
    ncConnection: "The Biltmore Estate in Asheville has appeared in films and TV as a stand-in for grand estates and period settings.",
    year: 0,
    body: [
      "The Biltmore Estate — America's largest private home — isn't just a tourist destination; it's a filming location. Its grand rooms, gardens, and mountain views have been used for movies and television. When you see a lavish estate in a period piece or a drama, there's a good chance it could be Biltmore.",
      "Visiting Biltmore ties together architecture, the Vanderbilt story, and the idea that North Carolina has been a backdrop for storytelling for decades.",
    ],
    triviaSeeds: [
      "The Biltmore Estate in Asheville has been used as a filming location.",
      "Biltmore is the largest privately owned house in the United States.",
    ],
    imagePlaceholder: "location_biltmore",
  },
];

export const NORTH_CAROLINA_MUSICIANS: NCMusician[] = [
  {
    id: "nina_simone",
    name: "Nina Simone",
    origin: "Tryon, North Carolina",
    genre: "Jazz, soul, civil rights anthems",
    bio: [
      "Eunice Kathleen Waymon was born in Tryon in 1933. She started playing piano at three and trained as a classical pianist before the racial barriers of the era pushed her toward jazz and popular music. She took the name Nina Simone to perform in Atlantic City — partly to keep her mother from knowing she was playing 'the devil's music.'",
      "She became the High Priestess of Soul: 'I Put a Spell on You,' 'Mississippi Goddam,' 'To Be Young, Gifted and Black,' and 'Don't Let Me Be Misunderstood' are just a few of the songs that defined her. She was also a fierce voice in the Civil Rights movement. North Carolina claims her; Tryon honors her with a statue and a legacy that leads straight into music history and biography.",
    ],
    notableWorks: ["I Put a Spell on You", "Mississippi Goddam", "To Be Young, Gifted and Black", "Don't Let Me Be Misunderstood"],
    imagePlaceholder: "musician_nina_simone",
  },
  {
    id: "john_coltrane",
    name: "John Coltrane",
    origin: "Hamlet, North Carolina",
    genre: "Jazz, bebop, avant-garde",
    bio: [
      "John Coltrane was born in Hamlet in 1926 and grew up in High Point. He became one of the most influential saxophonists in jazz history — a pioneer of modal jazz and spiritual expression in music. His work with Miles Davis and Thelonious Monk, and his own classic albums like 'A Love Supreme,' changed the course of music.",
      "North Carolina marks his roots with the John Coltrane birthplace in Hamlet and celebrations across the state. From Hamlet to the world: his story is geography, biography, and trivia in one.",
    ],
    notableWorks: ["A Love Supreme", "Giant Steps", "My Favorite Things"],
    imagePlaceholder: "musician_john_coltrane",
  },
  {
    id: "randy_travis",
    name: "Randy Travis",
    origin: "Marshville, North Carolina",
    genre: "Country",
    bio: [
      "Randy Bruce Traywick was born in Marshville in 1959. He helped bring traditional country back to the forefront in the 1980s with hits like 'On the Other Hand,' '1982,' and 'Diggin' Up Bones.' He became one of the first country artists to achieve multi-platinum sales and won multiple Grammy and CMA awards.",
      "His voice and his story are part of North Carolina's music map. Trivia: Which country star from Marshville had a string of number-one hits in the 1980s and '90s?",
    ],
    notableWorks: ["On the Other Hand", "1982", "Diggin' Up Bones", "Forever and Ever, Amen"],
    imagePlaceholder: "musician_randy_travis",
  },
  {
    id: "james_taylor",
    name: "James Taylor",
    origin: "Chapel Hill (raised in NC)",
    genre: "Singer-songwriter, folk rock",
    bio: [
      "James Taylor was born in Boston but grew up in Chapel Hill — and North Carolina has claimed him ever since. 'Carolina in My Mind' is an anthem for the state; his ties to Chapel Hill and the Piedmont are part of his story. He's one of the defining singer-songwriters of the 1970s and beyond.",
      "From 'Fire and Rain' to 'You've Got a Friend,' his music is tied to place for many listeners. Who sang 'Carolina in My Mind'? Where did he grow up? That's NC trivia and biography woven together.",
    ],
    notableWorks: ["Carolina in My Mind", "Fire and Rain", "You've Got a Friend", "Sweet Baby James"],
    imagePlaceholder: "musician_james_taylor",
  },
];

export const NORTH_CAROLINA_ACTORS: NCActor[] = [
  {
    id: "andy_griffith",
    name: "Andy Griffith",
    origin: "Mount Airy, North Carolina",
    bioShort:
      "Andy Griffith was born in Mount Airy in 1926. Mount Airy is the widely recognized inspiration for Mayberry in The Andy Griffith Show. He became one of America's most beloved TV stars as Sheriff Andy Taylor and later as a dramatic actor and producer. His hometown still celebrates him with the Andy Griffith Museum and Mayberry-themed tourism.",
    notableWorks: ["The Andy Griffith Show", "Matlock", "A Face in the Crowd"],
    imagePlaceholder: "actor_andy_griffith",
  },
  {
    id: "julianne_moore",
    name: "Julianne Moore",
    origin: "Fort Bragg (Fayetteville area), North Carolina",
    bioShort:
      "Julianne Moore was born at Fort Bragg in 1960. She went on to win an Academy Award and multiple nominations for films like Boogie Nights, Far From Heaven, The Hours, and Still Alice. North Carolina can claim her as one of its own — and trivia questions about actors from NC often start with her name.",
    notableWorks: ["Boogie Nights", "Far From Heaven", "The Hours", "Still Alice"],
    imagePlaceholder: "actor_julianne_moore",
  },
  {
    id: "zach_galifianakis",
    name: "Zach Galifianakis",
    origin: "Wilkesboro, North Carolina",
    bioShort:
      "Zach Galifianakis was born in Wilkesboro and grew up in North Carolina. He became a comedy star with The Hangover films and his deadpan, offbeat style. Wilkesboro is also home to the famous MerleFest music festival — so the town ties into both comedy and music.",
    notableWorks: ["The Hangover", "Between Two Ferns", "Baskets"],
    imagePlaceholder: "actor_zach_galifianakis",
  },
  {
    id: "michael_c_hall",
    name: "Michael C. Hall",
    origin: "Raleigh, North Carolina",
    bioShort:
      "Michael C. Hall was born in Raleigh in 1971. He is best known for playing Dexter in the series Dexter and David Fisher in Six Feet Under — two roles that made him a household name. Raleigh-born, stage-trained, and a fixture of prestige TV.",
    notableWorks: ["Dexter", "Six Feet Under", "Safe"],
    imagePlaceholder: "actor_michael_c_hall",
  },
];

// ========== BLUE RIDGE PARKWAY — dedicated section; also in locations list ==========

/** Single featured item for "Blue Ridge Parkway" section. Our summary; link to NPS for full info. */
export const BLUE_RIDGE_PARKWAY_FEATURE = {
  id: "blue_ridge_parkway",
  name: "Blue Ridge Parkway",
  knownFor: "America's Favorite Drive — 469 miles of mountain vistas, no billboards, no commercial traffic.",
  summary: [
    "The Blue Ridge Parkway runs 469 miles through Virginia and North Carolina, linking Shenandoah National Park to Great Smoky Mountains National Park. In North Carolina it traces the crest of the Blue Ridge: rolling overlooks, tunnels of rhododendron, and the kind of views that make you slow down. Speed limit is 45 mph or less by design. This isn't a highway — it's a destination.",
    "You'll find trailheads, picnic areas, campgrounds, and visitor centers along the way. Fall color draws huge crowds; spring and summer bring wildflowers and green. Winter can mean closures at higher elevations. The Parkway is free to drive — no entrance fee — but conditions and seasonal closures vary. Check the official site for maps, alerts, and trip planning.",
  ],
  officialUrl: "https://www.nps.gov/blri/",
  imagePlaceholder: "location_blue_ridge_parkway",
} as const;

// ========== LOCATIONS: Waterfalls, estates, parks, scenic drive — deep detail, official links ==========

export const NORTH_CAROLINA_LOCATIONS: NCLocation[] = [
  {
    id: "blue_ridge_parkway",
    name: "Blue Ridge Parkway",
    type: "scenic_drive",
    region: "Blue Ridge Mountains — Virginia to Great Smoky Mountains NP (NC portion runs through the western part of the state)",
    knownFor: "America's Favorite Drive; 469 miles of scenic mountain road, no billboards.",
    description: [
      "The Parkway follows the spine of the Blue Ridge through North Carolina, offering overlooks, trailheads, and a pace that feels nothing like the interstate. It was built to connect Shenandoah and the Smokies and to give people a way to experience the mountains without rushing. Speed limits are low; views are the point.",
      "North Carolina's section includes Craggy Gardens, Linville Falls access, the Museum of North Carolina Minerals, and the famous Linn Cove Viaduct — a bridge that curves around Grandfather Mountain. Seasonal closures and weather are part of the deal; the official NPS site has current conditions, maps, and trip ideas.",
    ],
    howToGetThere:
      "The Parkway has many access points from I-40, US 221, US 321, and other roads. In NC it runs from the Virginia line south to the Great Smoky Mountains National Park. There are no entrance fees. Check nps.gov/blri for current road status, construction, and winter closures.",
    history:
      "Construction began in 1935 as a New Deal project; the last section, the Linn Cove Viaduct, was completed in 1987. The Parkway is managed by the National Park Service and is one of the most visited NPS units in the country.",
    triviaSeeds: [
      "The Blue Ridge Parkway runs through North Carolina and Virginia.",
      "The Linn Cove Viaduct is part of the Blue Ridge Parkway in North Carolina.",
    ],
    imagePlaceholder: "location_blue_ridge_parkway",
    officialUrl: "https://www.nps.gov/blri/",
  },
  {
    id: "dry_falls",
    name: "Dry Falls",
    type: "waterfall",
    region: "Nantahala National Forest, Highlands",
    knownFor: "Walk behind the waterfall and stay dry — one of NC's most memorable stops.",
    description: [
      "Dry Falls drops 75–80 feet into the Cullasaja Gorge. What makes it special: you can walk behind the waterfall and stay relatively dry — hence the name. The roar of the water and the curtain of mist make it one of North Carolina's most memorable waterfall experiences.",
      "The trail is short (about 0.2–0.4 miles round trip) and mostly paved with stairs and handrails, though the steps near the falls can be wet and slippery. Mornings and weekdays tend to be less crowded; the parking lot is small and fills up on busy days.",
    ],
    howToGetThere:
      "From Highlands, take US Highway 64 west about 3.25 miles to the Dry Falls parking area on the left (north) side of the road, along the Mountain Scenic Byway in the Cullasaja Gorge. Parking fee $3 per vehicle (waived with America the Beautiful pass). Restrooms and a viewing platform are available.",
    history:
      "The falls have long been a landmark in the Nantahala region. The name reflects the unique geology that allows a walkway behind the cascade. Part of the Mountain Scenic Byway and Nantahala National Forest, they are maintained by the U.S. Forest Service.",
    triviaSeeds: [
      "Dry Falls in North Carolina is a waterfall you can walk behind.",
      "Dry Falls is in Nantahala National Forest near Highlands.",
    ],
    imagePlaceholder: "location_dry_falls",
    officialUrl: "https://www.fs.usda.gov/recarea/nfsnc/recarea/?recid=48521",
  },
  {
    id: "hickory_nut_falls",
    name: "Hickory Nut Falls",
    type: "waterfall",
    region: "Chimney Rock State Park",
    description: [
      "Hickory Nut Falls is one of the tallest waterfalls in the eastern United States — about 404 feet. It pours over a dramatic cliff in Chimney Rock State Park, 25 miles southeast of Asheville. The view from the base (or from the park's trails and overlooks) is iconic.",
      "The waterfall and the surrounding cliffs were used in the 1992 film The Last of the Mohicans for the climactic chase and fight scenes. Fans of the movie often visit specifically to see where the finale was shot.",
    ],
    howToGetThere:
      "Chimney Rock State Park is on US 64/74A near Lake Lure. Enter the park and follow signs to the Falls Trail (or take the elevator to the top and hike down). The park has an admission fee; check the state park website for hours and trail conditions.",
    history:
      "Chimney Rock has been a tourist destination since the late 1800s. The park became a state park in 2007. Hickory Nut Falls has drawn visitors and filmmakers alike for its height and dramatic setting.",
    filmConnection: "The Last of the Mohicans (1992) — climactic chase and fight scenes were filmed here.",
    triviaSeeds: [
      "Hickory Nut Falls is in Chimney Rock State Park, North Carolina.",
      "The Last of the Mohicans filmed at Hickory Nut Falls.",
    ],
    imagePlaceholder: "location_hickory_nut_falls",
    knownFor: "One of the East's tallest waterfalls; Last of the Mohicans filming location.",
    officialUrl: "https://www.ncparks.gov/state-parks/chimney-rock-state-park",
  },
  {
    id: "dupont_bridal_veil",
    name: "Bridal Veil Falls (DuPont State Forest)",
    type: "waterfall",
    region: "DuPont State Recreational Forest, near Brevard",
    description: [
      "Bridal Veil Falls in DuPont State Forest is a broad, sloping cascade that you can walk (or drive) behind. It was featured in The Last of the Mohicans — the scene where Hawkeye leads the group is set here. DuPont is also home to High Falls and Triple Falls, all within a hike of each other.",
      "The forest has miles of trails for hiking and biking. The waterfall area can get busy on weekends; early morning or weekdays are ideal for a quieter visit.",
    ],
    howToGetThere:
      "DuPont State Recreational Forest is south of Brevard and east of Hendersonville. From Brevard, take US 64 east, then follow DuPont Road (Staton Road) to the main parking areas. Access to Bridal Veil, High Falls, and Triple Falls is well signed. No entrance fee; parking at designated lots.",
    history:
      "The land was once part of the DuPont industrial property; it was acquired by the state and opened as a recreational forest. The waterfalls became famous after appearing in The Last of the Mohicans and later in The Hunger Games.",
    filmConnection: "The Last of the Mohicans (1992); also used in The Hunger Games.",
    triviaSeeds: [
      "Bridal Veil Falls in DuPont State Forest was in The Last of the Mohicans.",
      "DuPont State Forest has multiple waterfalls used in films.",
    ],
    imagePlaceholder: "location_dupont_bridal_veil",
    knownFor: "Walk (or drive) behind the falls; Last of the Mohicans and Hunger Games.",
    officialUrl: "https://www.dupontstaterecreationalforest.com/",
  },
  {
    id: "biltmore",
    name: "Biltmore Estate",
    type: "estate",
    region: "Asheville, North Carolina",
    description: [
      "Biltmore is the largest privately owned house in the United States: 250 rooms, a Châteauesque design by Richard Morris Hunt, and gardens and grounds by Frederick Law Olmsted. George Vanderbilt II built it between 1889 and 1895 as a mountain retreat — and it's still run by his descendants today.",
      "The estate includes the house, formal gardens, a winery, farm, and miles of trails. It has also been used as a filming location for movies and TV, so when you visit you're walking through both history and pop culture.",
    ],
    howToGetThere:
      "Biltmore is in Asheville. From I-40, take Exit 50 or 50B to Biltmore Village and follow signs to the estate entrance. Admission is ticketed; advance purchase is recommended. Allow a full day to explore the house and grounds.",
    history:
      "George Vanderbilt began buying land in the 1880s and eventually assembled about 125,000 acres. The house cost roughly $5 million to build (equivalent to well over $100 million today). After his death in 1914, his widow sold 87,000 acres to the federal government — that land became the core of Pisgah National Forest. The estate opened to the public in 1930.",
    triviaSeeds: [
      "Biltmore Estate in Asheville is the largest private home in the United States.",
      "George Vanderbilt built Biltmore; part of the land later became Pisgah National Forest.",
    ],
    imagePlaceholder: "location_biltmore",
    knownFor: "Largest private home in America; Vanderbilt estate; gardens, winery, and film backdrops.",
    officialUrl: "https://www.biltmore.com/",
  },
  {
    id: "grandfather_mountain",
    name: "Grandfather Mountain",
    type: "state_park",
    region: "Linville, North Carolina — Blue Ridge",
    knownFor: "Mile-High Swinging Bridge, wild weather, and views that define the High Country.",
    description: [
      "Grandfather Mountain is one of the Southeast's iconic peaks — rugged, often wrapped in clouds, and home to the Mile-High Swinging Bridge (actually about 5,300 feet up). The bridge connects two rock outcrops and gives vertigo and views in equal measure. The mountain is a designated UNESCO Biosphere Reserve and a state park, with trails ranging from gentle to famously tough.",
      "Weather changes fast here; it can be clear in the valley and foggy at the top. The park is known for wildlife habitats (black bears, cougars in captivity for education), nature museum, and the annual Highland Games. It's the kind of place that makes North Carolina's mountains feel larger than life.",
    ],
    howToGetThere:
      "From I-40 take Exit 85 (Linville) and follow US 221 south to the Blue Ridge Parkway, or approach from the Parkway. The entrance is on US 221 at Linville. Admission fee; advance tickets recommended in peak season. Check official site for hours and conditions.",
    history:
      "The mountain was privately owned and operated as a nature attraction for decades; the state acquired the backcountry and designated it Grandfather Mountain State Park in 2008. The swinging bridge was built in 1952.",
    triviaSeeds: [
      "Grandfather Mountain in North Carolina has the Mile-High Swinging Bridge.",
      "Grandfather Mountain is a state park and UNESCO Biosphere Reserve.",
    ],
    imagePlaceholder: "location_grandfather_mountain",
    officialUrl: "https://grandfather.com/",
  },
  {
    id: "great_smoky_mountains_nc",
    name: "Great Smoky Mountains National Park (NC side)",
    type: "park",
    region: "North Carolina and Tennessee — Cherokee, Bryson City, Maggie Valley",
    knownFor: "Most visited national park in the U.S.; ancient mountains, elk, and the Blue Ridge Parkway's southern end.",
    description: [
      "The Smokies straddle North Carolina and Tennessee — and the NC side gives you Cataloochee Valley (elk), Clingmans Dome access, and the quiet coves and trails that feel a world away from the interstate. The park is free to enter; no entrance fee. That, plus the scenery, makes it the most visited national park in the country.",
      "You can reach it from the Blue Ridge Parkway's southern terminus, from Cherokee, or from Bryson City. Fall color, spring wildflowers, and the famous blue haze that gave the mountains their name are all part of the draw. We summarize the vibe; the NPS site has everything for planning — roads, camping, and current conditions.",
    ],
    howToGetThere:
      "Multiple entrances in NC: near Cherokee (US 441), Bryson City, and Cataloochee. The Blue Ridge Parkway ends at the park's Oconaluftee entrance. No entrance fee. Check nps.gov/grsm for alerts, road status, and reservations where required.",
    history:
      "The park was dedicated in 1940, created from purchased private land to preserve the southern Appalachians. It is a UNESCO World Heritage Site and International Biosphere Reserve.",
    triviaSeeds: [
      "Great Smoky Mountains National Park spans North Carolina and Tennessee.",
      "The Smokies are the most visited national park in the United States.",
    ],
    imagePlaceholder: "location_great_smoky_mountains",
    officialUrl: "https://www.nps.gov/grsm/",
  },
  {
    id: "linville_falls",
    name: "Linville Falls",
    type: "waterfall",
    region: "Blue Ridge Parkway, Linville Falls (Milepost 316)",
    knownFor: "The Parkway's most famous waterfall — multi-tiered drop into Linville Gorge.",
    description: [
      "Linville Falls is the waterfall most people associate with the Blue Ridge Parkway. The Linville River drops through a series of cascades into Linville Gorge — the 'Grand Canyon of the East.' Several overlooks and trails give different angles; the main trail is moderate and well used. It's one of the most photographed spots on the Parkway.",
      "The falls are managed by the National Park Service as part of the Parkway. No separate fee; parking can fill up on busy days. Early morning or weekdays help. The gorge itself is a wilderness area with tougher trails for experienced hikers.",
    ],
    howToGetThere:
      "From the Blue Ridge Parkway, use the Linville Falls exit at Milepost 316. Parking area and restrooms are available. From US 221 you can also reach the area. Check nps.gov/blri for Parkway status.",
    history:
      "The Linville River carved the gorge over millennia. The falls have been a Parkway highlight since the road was built. The surrounding wilderness is protected as Linville Gorge Wilderness.",
    triviaSeeds: [
      "Linville Falls is on the Blue Ridge Parkway in North Carolina.",
      "Linville Gorge is sometimes called the Grand Canyon of the East.",
    ],
    imagePlaceholder: "location_linville_falls",
    officialUrl: "https://www.nps.gov/blri/planyourvisit/linville-falls.htm",
  },
  {
    id: "hanging_rock",
    name: "Hanging Rock State Park",
    type: "state_park",
    region: "Danbury, North Carolina — Piedmont, near Winston-Salem",
    knownFor: "Piedmont cliffs and views; waterfalls, rock formations, and a lake — all within a short drive.",
    description: [
      "Hanging Rock is the Piedmont's answer to 'we want mountains.' Cliffs, cascades, and a scenic lake sit within the Sauratown Mountains — an isolated range that rises above the rolling hills. The park has trails for all levels, from short waterfall walks to the climb to Hanging Rock itself, with views that stretch for miles.",
      "It's a favorite for Raleigh and Winston-Salem day-trippers. Swimming, paddling, and camping are available. The rock formations and the park's namesake overlook make it unmistakably North Carolina — and a reminder that you don't have to go to the Blue Ridge to find elevation and drama.",
    ],
    howToGetThere:
      "From Winston-Salem take US 52 north to Danbury, then follow signs to the park. From the Triangle, take I-40 west and use the designated exit. Small entrance fee for some activities; check the state park site for fees and hours.",
    history:
      "The park was developed by the Civilian Conservation Corps in the 1930s. The Sauratown Mountains are geologically distinct — remnants of older mountains that predate the main Blue Ridge.",
    triviaSeeds: [
      "Hanging Rock State Park is in the Piedmont of North Carolina.",
      "Hanging Rock offers cliffs and waterfalls in the Sauratown Mountains.",
    ],
    imagePlaceholder: "location_hanging_rock",
    officialUrl: "https://www.ncparks.gov/state-parks/hanging-rock-state-park",
  },
  {
    id: "stone_mountain",
    name: "Stone Mountain State Park",
    type: "state_park",
    region: "Roaring Gap / Elkin area — Piedmont foothills",
    knownFor: "A 600-foot granite dome, waterfalls, and the kind of geology that writes itself.",
    description: [
      "Stone Mountain is a massive granite dome — 600 feet of exposed rock — rising above the surrounding forest. It's not the only Stone Mountain in the country, but it's North Carolina's: a state park with a summit trail, Hutchinson Homestead (historic farm), and waterfalls including Stone Mountain Falls. The geology is dramatic; the hiking is memorable.",
      "The park sits in the foothills between the Piedmont and the Blue Ridge. Camping, fishing, and trail access make it a full-day or weekend destination. We give you the flavor; the state park site has maps, fees, and current conditions.",
    ],
    howToGetThere:
      "From I-77 take US 21 north toward Roaring Gap, or approach from Elkin. The park is well signed. Day-use and camping fees apply; check ncparks.gov for details.",
    history:
      "The granite dome is an exfoliation feature — ancient rock exposed by erosion. The park was established in 1969 and includes preserved homestead and natural areas.",
    triviaSeeds: [
      "Stone Mountain State Park in North Carolina features a 600-foot granite dome.",
      "Stone Mountain has a historic homestead and waterfalls.",
    ],
    imagePlaceholder: "location_stone_mountain",
    officialUrl: "https://www.ncparks.gov/state-parks/stone-mountain-state-park",
  },
];
