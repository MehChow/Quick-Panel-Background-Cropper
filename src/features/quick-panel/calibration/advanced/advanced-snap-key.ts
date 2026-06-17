import type {
  SnapAxisName,
  SnapMatch,
} from "./advanced-snap-axis";

export function getMatchSnapKey(
  match: SnapMatch | null,
  axis: SnapAxisName,
) {
  if (!match) {
    return null;
  }
  return `${match.edge}:${axis}:${formatSnapValue(match.value)}`;
}

export function getSnapKey(keys: (string | null)[]) {
  const activeKeys = keys.filter((key): key is string => key !== null);
  return activeKeys.length ? activeKeys.join("|") : null;
}

function formatSnapValue(value: number) {
  return value.toFixed(2);
}
