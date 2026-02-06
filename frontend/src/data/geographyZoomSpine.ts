/**
 * Geography Zoom Spine — the backbone for all geography content.
 * World → US (time zones, regions) → Southeast → State (e.g. North Carolina).
 * Areas of interest, historical hooks, clickable regions. Never dry.
 *
 * Expand by adding more hotspots (world), regions (us/southeast), and eventually
 * more states with the same depth as NC: detail, stories, connectivity.
 */

export type ZoomLevelId = "world" | "us" | "southeast" | "north_carolina";

export interface ZoomHotspot {
  id: string;
  label: string;
  tagline: string;
  /** If set, clicking zooms to this level. */
  zoomTo?: ZoomLevelId;
  /** Coming soon / teaser — show but don't zoom yet. */
  teaser?: boolean;
}

export interface ZoomRegion {
  id: string;
  label: string;
  tagline: string;
  zoomTo: ZoomLevelId;
}

export interface TimeZoneBand {
  id: string;
  name: string;
  /** Fun one-liner. */
  tip: string;
  /** Approx. x position (0–100) for SVG. */
  xStart: number;
  xEnd: number;
}

export interface GeographyZoomLevel {
  id: ZoomLevelId;
  label: string;
  fact: string;
  /** Short, lively tip — energy and connection. */
  tip?: string;
  /** World only: clickable areas of interest. */
  hotspots?: ZoomHotspot[];
  /** US only: time zone bands (Eastern, Central, Mountain, Pacific). */
  timeZones?: TimeZoneBand[];
  /** US only: clickable regions (Southeast → NC, etc.). */
  regions?: ZoomRegion[];
}

/** The spine: zoom levels in order. Expand with more states and regions over time. */
export const GEOGRAPHY_ZOOM_LEVELS: GeographyZoomLevel[] = [
  {
    id: "world",
    label: "World",
    fact: "North Carolina sits where ancient continents once collided.",
    tip: "The same forces that shaped NC shaped the planet — we're just zooming in.",
    hotspots: [
      {
        id: "us",
        label: "United States",
        tagline: "From sea to shining sea — and four time zones in between.",
        zoomTo: "us",
      },
      {
        id: "oregon_trail",
        label: "Oregon Trail",
        tagline: "Over 2,000 miles of hope, hardship, and history.",
        teaser: true,
      },
      {
        id: "atlantic",
        label: "Atlantic",
        tagline: "The ocean that brought people to the Carolinas.",
        teaser: true,
      },
    ],
  },
  {
    id: "us",
    label: "United States",
    fact: "The Southeast holds three distinct landscapes in one state — and we're heading there.",
    tip: "Why does New York hit midnight before Los Angeles? Time zones.",
    timeZones: [
      { id: "eastern", name: "Eastern", tip: "New York, Atlanta, Raleigh — first to see the sun set.", xStart: 0, xEnd: 25 },
      { id: "central", name: "Central", tip: "Chicago, Nashville — an hour behind the East.", xStart: 25, xEnd: 50 },
      { id: "mountain", name: "Mountain", tip: "Denver, Santa Fe — two hours back.", xStart: 50, xEnd: 75 },
      { id: "pacific", name: "Pacific", tip: "LA, Seattle — last to say goodnight.", xStart: 75, xEnd: 100 },
    ],
    regions: [
      {
        id: "southeast",
        label: "Southeast",
        tagline: "Mountains, piedmont, coast — and North Carolina's three worlds.",
        zoomTo: "southeast",
      },
    ],
  },
  {
    id: "southeast",
    label: "Southeast",
    fact: "This land used to be part of Africa. The rocks remember.",
    tip: "One region, countless stories. North Carolina is where we dive in.",
    regions: [
      {
        id: "north_carolina",
        label: "North Carolina",
        tagline: "Three worlds in one state. Click to explore.",
        zoomTo: "north_carolina",
      },
    ],
  },
  {
    id: "north_carolina",
    label: "North Carolina",
    fact: "These mountains were once taller than the Himalayas. This coast is still moving.",
    tip: "You're here. Hover the map — then click to dive deeper.",
  },
];

export const ZOOM_LEVEL_ORDER: ZoomLevelId[] = ["world", "us", "southeast", "north_carolina"];

export function getZoomLevelIndex(id: ZoomLevelId): number {
  const i = ZOOM_LEVEL_ORDER.indexOf(id);
  return i >= 0 ? i : 0;
}

export function getNextZoomLevel(id: ZoomLevelId): ZoomLevelId | null {
  const i = getZoomLevelIndex(id);
  return i < ZOOM_LEVEL_ORDER.length - 1 ? ZOOM_LEVEL_ORDER[i + 1] : null;
}
