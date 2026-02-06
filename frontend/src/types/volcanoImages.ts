/**
 * Volcano (and learning-page) image contract: ingestion → registry → frontend.
 * Frontend never cares where the image came from — only how it's used.
 * All images: legally sourced, machine-readable license, in R2, structured data only.
 */

export type LicenseType = "public-domain" | "cc-by" | "cc-by-sa";

export interface ImageLicense {
  type: LicenseType;
  source: string; // "NASA" | "USGS" | "Wikimedia" | etc.
  sourceUrl: string;
  /** Short credit text (for CC BY / CC BY-SA). */
  attribution?: string;
  /** Creator or institution name (for attribution). */
  attributionName?: string;
  /** Link to creator or source page (for attribution). */
  attributionUrl?: string;
}

export type VolcanoImageRole = "hero" | "section" | "gallery" | "diagram";

export interface VolcanoImage {
  id: string;
  volcanoSlug: string;

  r2: {
    bucket: string;
    key: string;
    publicUrl: string;
  };

  /** Responsive src set — frontend uses these, not filenames. */
  src: {
    lg: string;
    md: string;
    sm: string;
  };

  alt: string;
  caption?: string;

  usage: {
    role: VolcanoImageRole;
    priority: number;
  };

  license: ImageLicense;

  dimensions: {
    width: number;
    height: number;
  };

  createdAt: string;
}

/** Registry: volcano slug → role → images. Option A: JSON file. Option B: DB later. */
export interface VolcanoImageRegistry {
  [volcanoSlug: string]: {
    hero: VolcanoImage[];
    section: VolcanoImage[];
    gallery: VolcanoImage[];
    diagram: VolcanoImage[];
  };
}
