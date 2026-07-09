export interface HelpSheetMediaLayout {
  gridExampleWidth: number;
  maxHeight: number;
  panelExampleWidth: number;
  reviewExampleWidth: number;
  tallExampleWidth: number;
}

export function getHelpSheetMediaLayout(
  width: number,
  height: number,
): HelpSheetMediaLayout {
  const hasRoomForLargerExamples = width >= 720;

  return {
    gridExampleWidth: hasRoomForLargerExamples ? 180 : 156,
    maxHeight: Math.min(height * 0.84, 720),
    panelExampleWidth: hasRoomForLargerExamples ? 168 : 150,
    reviewExampleWidth: hasRoomForLargerExamples ? 220 : 200,
    tallExampleWidth: hasRoomForLargerExamples ? 140 : 132,
  };
}
