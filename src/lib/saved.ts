const KEY = "referaus_saved";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(slugs: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(slugs));
    window.dispatchEvent(new Event("referaus-saved-change"));
  } catch {
    // localStorage unavailable — ignore
  }
}

export function getSaved(): string[] {
  return read();
}

export function isSaved(slug: string): boolean {
  return read().includes(slug);
}

export function toggleSaved(slug: string): boolean {
  const current = read();
  const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
  write(next);
  return next.includes(slug);
}
