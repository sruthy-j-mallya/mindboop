// localStorage can be blocked (private windows, site settings), so reads fall back to null and writes are skipped.
// Choices kept here still hold until the next reload.
export const readStorage = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const writeStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage is blocked; see above.
  }
};
