/**
 * Activity Room audio: on/off, volume, profile (Classic / Calm / Corporate).
 * Per-game cue mapping; actual playback stubbed until assets and playback are wired.
 * @see docs/ACTIVITY-ROOM-SPEC.md §13
 */
import type { FeudCueId } from '../data/audioManifest';
import { getAssetForCue } from '../data/audioManifest';

export type AudioProfileId = 'classic' | 'calm' | 'corporate';

export interface AudioSettings {
  enabled: boolean;
  volume: number;
  profile: AudioProfileId;
}

const DEFAULT_AUDIO: AudioSettings = {
  enabled: true,
  volume: 0.7,
  profile: 'classic'
};

const STORAGE_KEY = 'playroom-activity-audio';

export function getStoredAudioSettings(): AudioSettings {
  if (typeof localStorage === 'undefined') return DEFAULT_AUDIO;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AUDIO;
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    return {
      enabled: parsed.enabled ?? DEFAULT_AUDIO.enabled,
      volume: Math.max(0, Math.min(1, parsed.volume ?? DEFAULT_AUDIO.volume)),
      profile: parsed.profile === 'calm' || parsed.profile === 'corporate' ? parsed.profile : 'classic'
    };
  } catch {
    return DEFAULT_AUDIO;
  }
}

export function saveAudioSettings(s: AudioSettings): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

/** Play a Feud cue (stub: no actual audio until assets are wired). */
export function playFeudCue(_cueId: FeudCueId, _settings?: AudioSettings): void {
  const settings = _settings ?? getStoredAudioSettings();
  if (!settings.enabled || settings.volume <= 0) return;
  const asset = getAssetForCue(_cueId);
  if (!asset?.url) return; // no asset URL yet
  // TODO: when assets exist, use AudioContext or HTMLAudioElement to play asset.url
  // at settings.volume; respect Calm profile (e.g. lower volume or skip).
}
