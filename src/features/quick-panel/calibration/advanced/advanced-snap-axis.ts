import {
  defaultSnapSensitivity,
  getSnapSensitivityMultiplier,
  type SnapSensitivity,
} from "../../model/snap-sensitivity";

export type SnapAxisName = "x" | "y";
export type SnapEdge = "left" | "right" | "top" | "bottom";

export interface SnapAxis {
  lines: number[];
  candidates: number[];
  beforeCandidates: number[];
  afterCandidates: number[];
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

export interface SnapAxisOptions {
  scale: number;
  sensitivity: SnapSensitivity;
}

const defaultSnapAxisOptions: SnapAxisOptions = {
  scale: 1,
  sensitivity: defaultSnapSensitivity,
};

function getCandidatesForEdge(axis: SnapAxis, edge: SnapEdge) {
  "worklet";
  return edge === "bottom" || edge === "right"
    ? axis.beforeCandidates
    : axis.afterCandidates;
}

function getOriginCandidate(value: number, axis: SnapAxis, edge: SnapEdge) {
  "worklet";
  const candidates = getCandidatesForEdge(axis, edge);
  let bestCandidate: number | null = null;
  let bestDistance = axis.captureThreshold + 1;

  for (const candidate of candidates) {
    const distance = Math.abs(candidate - value);
    if (distance <= axis.captureThreshold && distance < bestDistance) {
      bestCandidate = candidate;
      bestDistance = distance;
    }
  }

  return bestCandidate;
}

function getNearestCandidate(
  value: number,
  originValue: number,
  axis: SnapAxis,
  edge: SnapEdge,
) {
  "worklet";
  const candidates = getCandidatesForEdge(axis, edge);
  const originCandidate = getOriginCandidate(originValue, axis, edge);
  let bestCandidate: number | null = null;
  let bestDistance = axis.captureThreshold + 1;

  for (const line of candidates) {
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

function getNearestMatch(
  value: number,
  originValue: number,
  axis: SnapAxis,
  edge: SnapEdge,
): SnapMatch | null {
  "worklet";
  const candidate = getNearestCandidate(value, originValue, axis, edge);
  return candidate === null
    ? null
    : {
        edge,
        offset: candidate - value,
        value: candidate,
      };
}

export function createSnapAxis(
  start: number,
  length: number,
  segments: number,
  options: SnapAxisOptions = defaultSnapAxisOptions,
): SnapAxis {
  "worklet";
  const step = length / segments;
  const scale = options.scale > 0 ? options.scale : 1;
  const displayedStep = step * scale;
  const multiplier = getSnapSensitivityMultiplier(options.sensitivity);
  const captureScreenPoints = Math.max(
    10,
    Math.min(20, displayedStep * 0.24),
  ) * multiplier;
  const releaseScreenPoints = Math.max(
    3,
    Math.min(7, displayedStep * 0.08),
  ) * multiplier;
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
  const beforeCandidates = lines.map((line, index) =>
    index === 0 || index === lines.length - 1 ? line : line - gapOffset,
  );
  const afterCandidates = lines.map((line, index) =>
    index === 0 || index === lines.length - 1 ? line : line + gapOffset,
  );

  return {
    lines,
    candidates,
    beforeCandidates,
    afterCandidates,
    captureThreshold: captureScreenPoints / scale,
    releaseThreshold: releaseScreenPoints / scale,
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
  "worklet";
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
  "worklet";
  const candidate = getNearestCandidate(value, originValue, axis, edge);
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
