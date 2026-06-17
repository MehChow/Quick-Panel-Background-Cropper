export type SnapAxisName = "x" | "y";
export type SnapEdge = "left" | "right" | "top" | "bottom";

export interface SnapAxis {
  lines: number[];
  candidates: number[];
  captureThreshold: number;
  releaseThreshold: number;
}

export interface SnapMatch {
  edge: SnapEdge;
  offset: number;
  value: number;
}

export interface SnapValueResult {
  match: SnapMatch | null;
  value: number;
}

export function createSnapAxis(
  start: number,
  length: number,
  segments: number,
): SnapAxis {
  const step = length / segments;
  const gap = Math.max(4, Math.min(12, step * 0.12));
  const gapOffset = gap / 2;
  const lines = Array.from(
    { length: segments + 1 },
    (_, index) => start + step * index,
  );
  const candidates = lines.flatMap((line, index) => {
    if (index === 0 || index === lines.length - 1) {
      return [line];
    }
    return [line - gapOffset, line + gapOffset];
  });

  return {
    lines,
    candidates,
    captureThreshold: Math.max(10, Math.min(20, step * 0.24)),
    releaseThreshold: Math.max(3, Math.min(7, step * 0.08)),
  };
}

export function getBestMoveMatch(
  start: number,
  end: number,
  startOrigin: number,
  endOrigin: number,
  axis: SnapAxis,
  startEdge: SnapEdge,
  endEdge: SnapEdge,
): SnapMatch | null {
  const startMatch = getNearestMatch(start, startOrigin, axis, startEdge);
  const endMatch = getNearestMatch(end, endOrigin, axis, endEdge);

  if (startMatch === null) {
    return endMatch;
  }
  if (endMatch === null) {
    return startMatch;
  }
  return Math.abs(startMatch.offset) <= Math.abs(endMatch.offset)
    ? startMatch
    : endMatch;
}

export function maybeSnap(
  value: number,
  originValue: number,
  axis: SnapAxis,
  edge: SnapEdge,
): SnapValueResult {
  const candidate = getNearestCandidate(value, originValue, axis);
  return {
    match:
      candidate === null
        ? null
        : {
            edge,
            offset: candidate - value,
            value: candidate,
          },
    value: candidate ?? value,
  };
}

function getNearestMatch(
  value: number,
  originValue: number,
  axis: SnapAxis,
  edge: SnapEdge,
): SnapMatch | null {
  const candidate = getNearestCandidate(value, originValue, axis);
  return candidate === null
    ? null
    : {
        edge,
        offset: candidate - value,
        value: candidate,
      };
}

function getNearestCandidate(
  value: number,
  originValue: number,
  axis: SnapAxis,
) {
  const originCandidate = getOriginCandidate(originValue, axis);
  let bestCandidate: number | null = null;
  let bestDistance = axis.captureThreshold + 1;

  for (const line of axis.candidates) {
    if (
      originCandidate !== null &&
      Math.abs(line - originCandidate) < 0.01 &&
      Math.abs(value - originCandidate) > axis.releaseThreshold
    ) {
      continue;
    }
    const offset = line - value;
    const distance = Math.abs(offset);
    if (distance <= axis.captureThreshold && distance < bestDistance) {
      bestCandidate = line;
      bestDistance = distance;
    }
  }

  return bestCandidate;
}

function getOriginCandidate(value: number, axis: SnapAxis) {
  let bestCandidate: number | null = null;
  let bestDistance = axis.captureThreshold + 1;

  for (const candidate of axis.candidates) {
    const distance = Math.abs(candidate - value);
    if (distance <= axis.captureThreshold && distance < bestDistance) {
      bestCandidate = candidate;
      bestDistance = distance;
    }
  }

  return bestCandidate;
}
