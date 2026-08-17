export const buttonIdentifierContentModes = [
  "both",
  "icon",
  "none",
] as const;

export type ButtonIdentifierContentMode =
  (typeof buttonIdentifierContentModes)[number];

export function normalizeButtonIdentifierContentMode(
  value: unknown,
): ButtonIdentifierContentMode | null {
  return typeof value === "string"
    && buttonIdentifierContentModes.includes(
      value as ButtonIdentifierContentMode,
    )
    ? (value as ButtonIdentifierContentMode)
    : null;
}
