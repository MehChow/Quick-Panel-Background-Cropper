export function createButtonFileNames(labels: string[]): string[] {
  return createButtonFileNameSlugs(labels).map((slugValue, index) =>
    `${String(index + 1).padStart(2, "0")}-${slugValue}.png`
  );
}

export function createButtonFileNameSlugs(labels: string[]): string[] {
  const counts = new Map<string, number>();
  return labels.map((label) => {
    const base = slug(label) || "button";
    const nextCount = (counts.get(base) ?? 0) + 1;
    counts.set(base, nextCount);
    return nextCount > 1 ? `${base}-${nextCount}` : base;
  });
}

function slug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
