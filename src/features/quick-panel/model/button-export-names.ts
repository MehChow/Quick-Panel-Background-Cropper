export function createButtonFileNames(labels: string[]): string[] {
  const counts = new Map<string, number>();
  return labels.map((label, index) => {
    const base = slug(label) || "button";
    const nextCount = (counts.get(base) ?? 0) + 1;
    counts.set(base, nextCount);
    const duplicateSuffix = nextCount > 1 ? `-${nextCount}` : "";
    return `${String(index + 1).padStart(2, "0")}-${base}${duplicateSuffix}.png`;
  });
}

function slug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
