const STORAGE_PREFIX = 'pumpkin:';

/**
 * Safely reads JSON from localStorage, returning fallback on parse errors.
 * We centralize this to keep debugging consistent and prevent silent crashes
 * when storage is corrupted.
 */
export const readStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Storage read failed for ${key}`, error);
    return fallback;
  }
};

/**
 * Writes JSON to localStorage with consistent namespacing for easier audits.
 */
export const writeStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
};

export const clearStorage = (key: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
};
