// A tiny typed wrapper around localStorage with safe JSON parsing.
// This keeps storage errors visible and prevents crashes in private browsing modes.

export const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Failed to load ${key} from storage`, error);
    return fallback;
  }
};

export const saveToStorage = <T>(key: string, value: T) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key} to storage`, error);
  }
};

export const removeFromStorage = (key: string) => {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove ${key} from storage`, error);
  }
};
