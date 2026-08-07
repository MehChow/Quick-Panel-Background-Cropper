export const snapSensitivityValues = [
  "low",
  "balanced",
  "strong",
] as const;

export type SnapSensitivity = (typeof snapSensitivityValues)[number];

export const defaultSnapSensitivity: SnapSensitivity = "balanced";

export function normalizeSnapSensitivity(value: unknown): SnapSensitivity {
  return snapSensitivityValues.includes(value as SnapSensitivity)
    ? value as SnapSensitivity
    : defaultSnapSensitivity;
}

export function getSnapSensitivityMultiplier(value: SnapSensitivity): number {
  "worklet";
  return value === "low" ? 0.5 : value === "strong" ? 1.5 : 1;
}

export function getSnapSensitivitySliderValue(value: SnapSensitivity): number {
  return snapSensitivityValues.indexOf(value);
}

export function getSnapSensitivityFromSliderValue(value: number): SnapSensitivity {
  const index = Math.max(0, Math.min(2, Math.round(value)));
  if (index === 0) return "low";
  if (index === 2) return "strong";
  return "balanced";
}
