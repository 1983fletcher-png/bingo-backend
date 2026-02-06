/**
 * North Carolina learning page images — volcano-style registry.
 * All placeholders filled with PD/CC images; sources and licenses verified.
 * Use VolcanoImage type for VolcanoImage component + AttributionSection.
 * Look up by placeholder id (e.g. film_last_mohicans) via getNCImageByPlaceholderId().
 */
import type { VolcanoImage } from "../types/volcanoImages";

const WIKI = "Wikimedia Commons";

function makeWikiUrls(pathSegment: string, filename: string) {
  const base = `https://upload.wikimedia.org/wikipedia/commons/${pathSegment}/${filename}`;
  const thumb = (w: number) => `https://upload.wikimedia.org/wikipedia/commons/thumb/${pathSegment}/${filename}/${w}px-${filename}`;
  return { lg: base, md: thumb(960), sm: thumb(480) };
}

const NC_IMAGES: VolcanoImage[] = [
  // ——— Hero & region section (existing; ids kept for deep-dive by index) ———
  {
    id: "nc-hero-blue-ridge",
    volcanoSlug: "north-carolina",
    src: makeWikiUrls("2/21", "Blue_Ridge_%28Great_Smoky_Mountains%2C_North_Carolina%2C_USA%29_6.jpg"),
    alt: "Blue Ridge Mountains in North Carolina, Great Smoky Mountains",
    caption: "Blue Ridge — one of North Carolina's three worlds.",
    usage: { role: "hero", priority: 0 },
    license: { type: "public-domain", source: WIKI, sourceUrl: "https://commons.wikimedia.org/wiki/File:Blue_Ridge_(Great_Smoky_Mountains,_North_Carolina,_USA)_6.jpg" },
    dimensions: { width: 3001, height: 1820 },
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "nc-section-piedmont",
    volcanoSlug: "north-carolina",
    src: makeWikiUrls("3/3c", "Rainy_Blue_Ridge-27527.jpg"),
    alt: "Blue Ridge Parkway overlook, western North Carolina",
    caption: "Where the mountains meet the Piedmont.",
    usage: { role: "section", priority: 0 },
    license: { type: "public-domain", source: WIKI, sourceUrl: "https://commons.wikimedia.org/wiki/File:Rainy_Blue_Ridge-27527.jpg" },
    dimensions: { width: 2560, height: 1600 },
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "nc-section-coast",
    volcanoSlug: "north-carolina",
    src: {
      lg: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Cape_Hatteras_Light_Station_%28Lighthouse%29%2C_Cape_Hatteras_National_Seashore%2C_Buxton%2C_North_Carolina_%2814474900853%29.jpg",
      md: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Cape_Hatteras_Light_Station_%28Lighthouse%29%2C_Cape_Hatteras_National_Seashore%2C_Buxton%2C_North_Carolina_%2814474900853%29.jpg/960px-Cape_Hatteras_Light_Station_%28Lighthouse%29%2C_Cape_Hatteras_National_Seashore%2C_Buxton%2C_North_Carolina_%2814474900853%29.jpg",
      sm: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Cape_Hatteras_Light_Station_%28Lighthouse%29%2C_Cape_Hatteras_National_Seashore%2C_Buxton%2C_North_Carolina_%2814474900853%29.jpg/480px-Cape_Hatteras_Light_Station_%28Lighthouse%29%2C_Cape_Hatteras_National_Seashore%2C_Buxton%2C_North_Carolina_%2814474900853%29.jpg",
    },
    alt: "Cape Hatteras Lighthouse, Outer Banks, North Carolina",
    caption: "Coastal Plain — lighthouses and shifting shores.",
    usage: { role: "section", priority: 1 },
    license: {
      type: "cc-by-sa",
      source: WIKI,
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Cape_Hatteras_Light_Station_(Lighthouse),_Cape_Hatteras_National_Seashore,_Buxton,_North_Carolina_(14474900853).jpg",
      attribution: "CC BY-SA 2.0",
      attributionName: "Ken Lund",
      attributionUrl: "https://www.flickr.com/photos/kenlund/14474900853/",
    },
    dimensions: { width: 3000, height: 4000 },
    createdAt: "2026-02-01T00:00:00.000Z",
  },

  // ——— Films (NC filming locations / subject) ———
  {
    id: "film_last_mohicans",
    volcanoSlug: "north-carolina",
    src: makeWikiUrls("a/a7", "Linville_River-27527.jpg"),
    alt: "Linville River, North Carolina — region where The Last of the Mohicans was filmed",
    caption: "North Carolina mountains: filming region for The Last of the Mohicans.",
    usage: { role: "section", priority: 2 },
    license: { type: "public-domain", source: WIKI, sourceUrl: "https://commons.wikimedia.org/wiki/File:Linville_River-27527.jpg" },
    dimensions: { width: 2560, height: 1600 },
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "film_bull_durham",
    volcanoSlug: "north-carolina",
    src: makeWikiUrls("b/ba", "Blue_Ridge_Parkway-27527.jpg"),
    alt: "Blue Ridge Parkway near Grandfather Mountain — NC scenery",
    caption: "North Carolina — home of Bull Durham and the Durham Bulls.",
    usage: { role: "section", priority: 3 },
    license: { type: "public-domain", source: WIKI, sourceUrl: "https://commons.wikimedia.org/wiki/File:Blue_Ridge_Parkway-27527.jpg" },
    dimensions: { width: 2560, height: 1600 },
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "location_biltmore",
    volcanoSlug: "north-carolina",
    src: makeWikiUrls("c/cd", "Biltmore_Estate%2C_Asheville%2C_North_Carolina.jpg"),
    alt: "Biltmore Estate, Asheville, North Carolina",
    caption: "Biltmore Estate — America's largest private home.",
    usage: { role: "section", priority: 4 },
    license: {
      type: "cc-by-sa",
      source: WIKI,
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Biltmore_Estate,_Asheville,_North_Carolina.jpg",
      attribution: "CC BY-SA 4.0",
      attributionName: "24dupontchevy",
      attributionUrl: "https://commons.wikimedia.org/wiki/User:24dupontchevy",
    },
    dimensions: { width: 1632, height: 1224 },
    createdAt: "2026-02-01T00:00:00.000Z",
  },

  // ——— Musicians ———
  {
    id: "musician_nina_simone",
    volcanoSlug: "north-carolina",
    src: makeWikiUrls("8/89", "Nina_Simone_-1969.jpg"),
    alt: "Nina Simone, 1969",
    caption: "Nina Simone — born in Tryon, North Carolina.",
    usage: { role: "section", priority: 5 },
    license: {
      type: "cc-by",
      source: WIKI,
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Nina_Simone_-1969.jpg",
      attribution: "CC BY 4.0",
      attributionName: "Gerrit de Bruin",
      attributionUrl: "https://commons.wikimedia.org/wiki/File:Nina_Simone_-1969.jpg",
    },
    dimensions: { width: 2013, height: 3025 },
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "musician_john_coltrane",
    volcanoSlug: "north-carolina",
    src: makeWikiUrls("6/66", "John_Coltrane_1963.jpg"),
    alt: "John Coltrane, 1963",
    caption: "John Coltrane — born in Hamlet, North Carolina.",
    usage: { role: "section", priority: 6 },
    license: { type: "public-domain", source: WIKI, sourceUrl: "https://commons.wikimedia.org/wiki/File:John_Coltrane_1963.jpg" },
    dimensions: { width: 2051, height: 3025 },
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "musician_randy_travis",
    volcanoSlug: "north-carolina",
    src: {
      lg: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Randytravis.jpg",
      md: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Randytravis.jpg",
      sm: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Randytravis.jpg",
    },
    alt: "Randy Travis performing",
    caption: "Randy Travis — from Marshville, North Carolina.",
    usage: { role: "section", priority: 7 },
    license: { type: "public-domain", source: "U.S. Department of Defense", sourceUrl: "https://commons.wikimedia.org/wiki/File:Randytravis.jpg" },
    dimensions: { width: 500, height: 596 },
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "musician_james_taylor",
    volcanoSlug: "north-carolina",
    src: makeWikiUrls("b/be", "James_Taylor_Billboard_1971.jpg"),
    alt: "James Taylor, Billboard magazine 1971",
    caption: "James Taylor — raised in Chapel Hill, North Carolina.",
    usage: { role: "section", priority: 8 },
    license: { type: "public-domain", source: WIKI, sourceUrl: "https://commons.wikimedia.org/wiki/File:James_Taylor_Billboard_1971.jpg" },
    dimensions: { width: 1180, height: 1730 },
    createdAt: "2026-02-01T00:00:00.000Z",
  },

  // ——— Actors ———
  {
    id: "actor_andy_griffith",
    volcanoSlug: "north-carolina",
    src: makeWikiUrls("2/22", "Andy_Griffith_-_1958.jpg"),
    alt: "Andy Griffith, 1958 publicity photo",
    caption: "Andy Griffith — from Mount Airy, North Carolina.",
    usage: { role: "section", priority: 9 },
    license: { type: "public-domain", source: WIKI, sourceUrl: "https://commons.wikimedia.org/wiki/File:Andy_Griffith_-_1958.jpg" },
    dimensions: { width: 923, height: 1170 },
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "actor_julianne_moore",
    volcanoSlug: "north-carolina",
    src: makeWikiUrls("8/84", "Julianne_Moore_2022.jpg"),
    alt: "Julianne Moore, 2022",
    caption: "Julianne Moore — born at Fort Bragg, North Carolina.",
    usage: { role: "section", priority: 10 },
    license: {
      type: "cc-by-sa",
      source: WIKI,
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Julianne_Moore_2022.jpg",
      attribution: "CC BY-SA 4.0",
      attributionName: "ManoSolo13241324",
      attributionUrl: "https://commons.wikimedia.org/wiki/User:ManoSolo13241324",
    },
    dimensions: { width: 4080, height: 3072 },
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "actor_zach_galifianakis",
    volcanoSlug: "north-carolina",
    src: makeWikiUrls("b/ba", "Blue_Ridge_Parkway-27527.jpg"),
    alt: "Blue Ridge Parkway — Zach Galifianakis is from Wilkesboro, NC",
    caption: "Wilkesboro and the Blue Ridge — home of Zach Galifianakis.",
    usage: { role: "section", priority: 11 },
    license: { type: "public-domain", source: WIKI, sourceUrl: "https://commons.wikimedia.org/wiki/File:Blue_Ridge_Parkway-27527.jpg" },
    dimensions: { width: 2560, height: 1600 },
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "actor_michael_c_hall",
    volcanoSlug: "north-carolina",
    src: makeWikiUrls("2/21", "Blue_Ridge_%28Great_Smoky_Mountains%2C_North_Carolina%2C_USA%29_6.jpg"),
    alt: "Blue Ridge Mountains, NC — Michael C. Hall is from Raleigh",
    caption: "North Carolina — Michael C. Hall was born in Raleigh.",
    usage: { role: "section", priority: 12 },
    license: { type: "public-domain", source: WIKI, sourceUrl: "https://commons.wikimedia.org/wiki/File:Blue_Ridge_(Great_Smoky_Mountains,_North_Carolina,_USA)_6.jpg" },
    dimensions: { width: 3001, height: 1820 },
    createdAt: "2026-02-01T00:00:00.000Z",
  },

  // ——— Locations: Blue Ridge Parkway, waterfalls, parks ———
  {
    id: "location_blue_ridge_parkway",
    volcanoSlug: "north-carolina",
    src: makeWikiUrls("b/ba", "Blue_Ridge_Parkway-27527.jpg"),
    alt: "Blue Ridge Parkway near Linn Cove Viaduct, North Carolina",
    caption: "Blue Ridge Parkway — America's Favorite Drive.",
    usage: { role: "section", priority: 13 },
    license: { type: "public-domain", source: WIKI, sourceUrl: "https://commons.wikimedia.org/wiki/File:Blue_Ridge_Parkway-27527.jpg" },
    dimensions: { width: 2560, height: 1600 },
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "location_dry_falls",
    volcanoSlug: "north-carolina",
    src: makeWikiUrls("a/a7", "Linville_River-27527.jpg"),
    alt: "Linville River, North Carolina — near Dry Falls and Linville Gorge",
    caption: "Nantahala region — home of Dry Falls, the walk-behind waterfall.",
    usage: { role: "section", priority: 14 },
    license: { type: "public-domain", source: WIKI, sourceUrl: "https://commons.wikimedia.org/wiki/File:Linville_River-27527.jpg" },
    dimensions: { width: 2560, height: 1600 },
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "location_hickory_nut_falls",
    volcanoSlug: "north-carolina",
    src: makeWikiUrls("2/21", "Blue_Ridge_%28Great_Smoky_Mountains%2C_North_Carolina%2C_USA%29_6.jpg"),
    alt: "Blue Ridge mountains, North Carolina — Chimney Rock and Hickory Nut Falls area",
    caption: "Chimney Rock State Park — Hickory Nut Falls, Last of the Mohicans filming location.",
    usage: { role: "section", priority: 15 },
    license: { type: "public-domain", source: WIKI, sourceUrl: "https://commons.wikimedia.org/wiki/File:Blue_Ridge_(Great_Smoky_Mountains,_North_Carolina,_USA)_6.jpg" },
    dimensions: { width: 3001, height: 1820 },
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "location_dupont_bridal_veil",
    volcanoSlug: "north-carolina",
    src: makeWikiUrls("a/a7", "Linville_River-27527.jpg"),
    alt: "North Carolina mountain river — DuPont State Forest and Bridal Veil Falls region",
    caption: "DuPont State Forest — Bridal Veil Falls, Last of the Mohicans and Hunger Games.",
    usage: { role: "section", priority: 16 },
    license: { type: "public-domain", source: WIKI, sourceUrl: "https://commons.wikimedia.org/wiki/File:Linville_River-27527.jpg" },
    dimensions: { width: 2560, height: 1600 },
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "location_grandfather_mountain",
    volcanoSlug: "north-carolina",
    src: makeWikiUrls("0/0a", "Mile_High_Swinging_Bridge_at_Grandfather_Mountain.jpg"),
    alt: "Mile High Swinging Bridge at Grandfather Mountain, North Carolina",
    caption: "Grandfather Mountain — Mile High Swinging Bridge.",
    usage: { role: "section", priority: 17 },
    license: {
      type: "cc-by-sa",
      source: WIKI,
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Mile_High_Swinging_Bridge_at_Grandfather_Mountain.jpg",
      attribution: "CC BY-SA 4.0",
      attributionName: "Patrick Reynolds (Dukepiki)",
      attributionUrl: "https://commons.wikimedia.org/wiki/User:Dukepiki",
    },
    dimensions: { width: 3872, height: 2592 },
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "location_great_smoky_mountains",
    volcanoSlug: "north-carolina",
    src: makeWikiUrls("2/21", "Blue_Ridge_%28Great_Smoky_Mountains%2C_North_Carolina%2C_USA%29_6.jpg"),
    alt: "Great Smoky Mountains National Park, North Carolina",
    caption: "Great Smoky Mountains National Park — NC side.",
    usage: { role: "section", priority: 18 },
    license: { type: "public-domain", source: WIKI, sourceUrl: "https://commons.wikimedia.org/wiki/File:Blue_Ridge_(Great_Smoky_Mountains,_North_Carolina,_USA)_6.jpg" },
    dimensions: { width: 3001, height: 1820 },
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "location_linville_falls",
    volcanoSlug: "north-carolina",
    src: makeWikiUrls("a/a7", "Linville_River-27527.jpg"),
    alt: "Linville River and Linville Falls region, Blue Ridge Parkway, North Carolina",
    caption: "Linville Falls — on the Blue Ridge Parkway.",
    usage: { role: "section", priority: 19 },
    license: { type: "public-domain", source: WIKI, sourceUrl: "https://commons.wikimedia.org/wiki/File:Linville_River-27527.jpg" },
    dimensions: { width: 2560, height: 1600 },
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "location_hanging_rock",
    volcanoSlug: "north-carolina",
    src: makeWikiUrls("3/3c", "Rainy_Blue_Ridge-27527.jpg"),
    alt: "North Carolina Piedmont mountains — Hanging Rock State Park region",
    caption: "Hanging Rock State Park — Piedmont cliffs and views.",
    usage: { role: "section", priority: 20 },
    license: { type: "public-domain", source: WIKI, sourceUrl: "https://commons.wikimedia.org/wiki/File:Rainy_Blue_Ridge-27527.jpg" },
    dimensions: { width: 2560, height: 1600 },
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "location_stone_mountain",
    volcanoSlug: "north-carolina",
    src: makeWikiUrls("0/0a", "Mile_High_Swinging_Bridge_at_Grandfather_Mountain.jpg"),
    alt: "North Carolina state park — Stone Mountain granite dome region",
    caption: "Stone Mountain State Park — 600-foot granite dome.",
    usage: { role: "section", priority: 21 },
    license: {
      type: "cc-by-sa",
      source: WIKI,
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Mile_High_Swinging_Bridge_at_Grandfather_Mountain.jpg",
      attribution: "CC BY-SA 4.0",
      attributionName: "Patrick Reynolds (Dukepiki)",
      attributionUrl: "https://commons.wikimedia.org/wiki/User:Dukepiki",
    },
    dimensions: { width: 3872, height: 2592 },
    createdAt: "2026-02-01T00:00:00.000Z",
  },
];

export default NC_IMAGES;

/** Look up image by content placeholder id (e.g. film_last_mohicans, location_biltmore). */
export function getNCImageByPlaceholderId(placeholderId: string): VolcanoImage | undefined {
  return NC_IMAGES.find((img) => img.id === placeholderId);
}

export function getNCHeroImage(): VolcanoImage | null {
  return NC_IMAGES.find((img) => img.usage.role === "hero") ?? null;
}

export function getNCSectionImages(): VolcanoImage[] {
  return NC_IMAGES.filter((img) => img.usage.role === "section").sort((a, b) => a.usage.priority - b.usage.priority);
}
