/**
 * Saved menu designs — localStorage for now; ready for account-backed list when we have auth.
 * Lets users save a menu design by name and load it later to create new materials.
 */
import type { MenuBuilderState } from '../types/pageBuilder';

const STORAGE_KEY = 'playroom.savedMenuDesigns';

export interface SavedMenuDesign {
  id: string;
  name: string;
  document: MenuBuilderState;
  savedAt: number;
}

function safeParse<T>(json: string, fallback: T): T {
  try {
    const out = JSON.parse(json) as T;
    return out != null ? out : fallback;
  } catch {
    return fallback;
  }
}

function nextId(): string {
  return `design-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Get all saved menu designs (newest first). */
export function getSavedMenuDesigns(): SavedMenuDesign[] {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const arr = safeParse<SavedMenuDesign[]>(raw, []);
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((d) => d && d.id && d.name && d.document && d.savedAt)
    .sort((a, b) => b.savedAt - a.savedAt);
}

/** Save a new menu design. Returns the saved design. */
export function saveMenuDesign(name: string, document: MenuBuilderState): SavedMenuDesign {
  const list = getSavedMenuDesigns();
  const design: SavedMenuDesign = {
    id: nextId(),
    name: name.trim() || 'Untitled menu',
    document,
    savedAt: Date.now(),
  };
  list.unshift(design);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return design;
}

/** Delete a saved design by id. */
export function deleteMenuDesign(id: string): void {
  const list = getSavedMenuDesigns().filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** Get one design by id, or undefined. */
export function getSavedMenuDesignById(id: string): SavedMenuDesign | undefined {
  return getSavedMenuDesigns().find((d) => d.id === id);
}
