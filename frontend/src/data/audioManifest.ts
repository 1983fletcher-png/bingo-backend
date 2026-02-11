/**
 * Audio asset manifest for Activity Room (Feud, etc.).
 * License metadata per sound; actual files served via CDN/static later.
 * @see docs/ACTIVITY-ROOM-SPEC.md §13
 */
export type AudioLicense = 'CC0' | 'CC-BY' | 'CC-BY-SA' | 'Proprietary' | 'Internal';

export interface AudioAsset {
  id: string;
  name: string;
  /** Optional URL when asset is deployed (e.g. CDN). */
  url?: string;
  license: AudioLicense;
  attribution?: string;
  /** Category for cue mapping: ui | join | timer | reveal | correct | strike | stinger | win */
  category?: string;
}

/** Feud cue IDs for mapping. */
export const FEUD_CUE_IDS = [
  'flip',
  'ding',
  'buzz',
  'stinger',
  'win'
] as const;

export type FeudCueId = (typeof FEUD_CUE_IDS)[number];

/** Placeholder manifest (no files yet). Replace with real URLs and licenses when assets are added. */
export const AUDIO_MANIFEST: AudioAsset[] = [
  { id: 'feud-flip', name: 'Plate flip', category: 'reveal', license: 'Internal' },
  { id: 'feud-ding', name: 'Reveal ding', category: 'reveal', license: 'Internal' },
  { id: 'feud-buzz', name: 'Strike buzz', category: 'strike', license: 'Internal' },
  { id: 'feud-stinger', name: 'Round stinger', category: 'stinger', license: 'Internal' },
  { id: 'feud-win', name: 'Win sting', category: 'win', license: 'Internal' },
  { id: 'ui-click', name: 'UI click', category: 'ui', license: 'Internal' },
  { id: 'join-submit', name: 'Join / submit', category: 'join', license: 'Internal' }
];

export function getAssetForCue(cueId: FeudCueId): AudioAsset | undefined {
  const map: Record<FeudCueId, string> = {
    flip: 'feud-flip',
    ding: 'feud-ding',
    buzz: 'feud-buzz',
    stinger: 'feud-stinger',
    win: 'feud-win'
  };
  const assetId = map[cueId];
  return AUDIO_MANIFEST.find((a) => a.id === assetId);
}
