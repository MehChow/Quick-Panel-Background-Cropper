export type ButtonIdentifierBackgroundTheme = "light" | "dark";

export interface ButtonIdentifierAppearance {
  backgroundTheme: ButtonIdentifierBackgroundTheme;
  color: string;
  opacity: number;
}

export const defaultButtonIdentifierBackgroundTheme = "dark";
export const defaultButtonIdentifierColor = "#FFFFFF";

export function normalizeButtonIdentifierColor(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const compact = value.trim().replace(/^#/, "");
  return /^[0-9a-fA-F]{6}$/.test(compact)
    ? `#${compact.toUpperCase()}`
    : null;
}

export function normalizeButtonIdentifierBackgroundTheme(
  value: unknown,
): ButtonIdentifierBackgroundTheme | null {
  return value === "light" || value === "dark" ? value : null;
}

export function getButtonIdentifierBackgroundColor(
  theme: ButtonIdentifierBackgroundTheme,
): "#666666" | "#FFFFFF" {
  return theme === "light" ? "#FFFFFF" : "#666666";
}
