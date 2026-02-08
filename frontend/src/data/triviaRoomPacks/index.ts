/**
 * Trivia Room pack library — verified packs for Easy Mode.
 * Preset types: weekly_bar_classic, weekly_bar_extended, quick_bar_happy_hour,
 * display_automated, theme_night_fan, family_friendly, speed_trivia, seasonal_holiday.
 */
import type { TriviaPackModel, PresetType } from '../../lib/models';
import { weeklyBarClassicPack } from './weeklyBarClassic';

export const triviaRoomPacks: TriviaPackModel[] = [
  weeklyBarClassicPack,
];

export function getTriviaRoomPacks(): TriviaPackModel[] {
  return triviaRoomPacks;
}

export function getTriviaRoomPack(id: string): TriviaPackModel | null {
  return triviaRoomPacks.find((p) => p.id === id) ?? null;
}

export function getPacksByPreset(presetType: PresetType): TriviaPackModel[] {
  return triviaRoomPacks.filter((p) => p.presetType === presetType);
}

export { weeklyBarClassicPack };
