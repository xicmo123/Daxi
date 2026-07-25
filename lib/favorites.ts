// Client-only "我的收藏" store, mirrors the identity.ts pattern — a plain
// list of favorited placeIds in localStorage, no account/backend needed.
const STORAGE_KEY = "daxi-favorites";
const CHANGE_EVENT = "daxi-favorites-changed";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// Raw string snapshot for useSyncExternalStore — strings compare by value,
// so this is a stable reference across renders when nothing changed
// (returning a freshly-parsed array here would re-trigger on every render).
export function readFavoritesRaw(): string {
  if (typeof window === "undefined") return "[]";
  return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
}

export function isFavorite(placeId: string): boolean {
  return read().includes(placeId);
}

export function toggleFavorite(placeId: string): boolean {
  const ids = read();
  const index = ids.indexOf(placeId);
  if (index >= 0) {
    ids.splice(index, 1);
    write(ids);
    return false;
  }
  ids.push(placeId);
  write(ids);
  return true;
}

// storage only fires in other tabs — the custom event covers same-tab updates.
export function subscribeFavorites(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
