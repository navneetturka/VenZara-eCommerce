export const getStorageJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

export const setStorageJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key}`, error);
  }
};

export const removeStorageKey = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove ${key}`, error);
  }
};
