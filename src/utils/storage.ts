const STORAGE_PREFIX = 'pumpkin';

export const storageKeys = {
  user: `${STORAGE_PREFIX}.user`,
  attempts: `${STORAGE_PREFIX}.attempts`,
  conceptStates: `${STORAGE_PREFIX}.conceptStates`,
  prefs: `${STORAGE_PREFIX}.prefs`,
  coolStuff: `${STORAGE_PREFIX}.coolStuff`
};

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Failed to read ${key} from storage`, error);
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to write ${key} to storage`, error);
  }
}

export function clearKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to clear ${key} from storage`, error);
  }
}
