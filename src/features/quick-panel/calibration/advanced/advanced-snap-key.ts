import type {
  SnapAxisName,
  SnapMatch,
} from "./advanced-snap-axis";

function formatSnapValue(value: number) {
  "worklet";
  return value.toFixed(2);
}

export function getMatchSnapKey(
  match: SnapMatch | null,
  axis: SnapAxisName,
) {
  "worklet";
  if (!match) {
    return null;
  }
  return `${match.edge}:${axis}:${formatSnapValue(match.value)}`;
}

export function getSnapKey(keys: (string | null)[]) {
  "worklet";
  const activeKeys = keys.filter((key): key is string => key !== null);
  return activeKeys.length ? activeKeys.join("|") : null;
}
