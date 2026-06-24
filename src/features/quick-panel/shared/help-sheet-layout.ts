export interface HelpSheetLayout {
  gridExampleWidth: number;
  maxHeight: number;
  panelExampleWidth: number;
  reviewExampleWidth: number;
  tallExampleWidth: number;
}

export function getHelpSheetLayout(
  width: number,
  height: number,
): HelpSheetLayout {
  const isWideScreen = width >= 720;

  return {
    gridExampleWidth: isWideScreen ? 180 : 156,
    maxHeight: Math.min(height * 0.84, 720),
    panelExampleWidth: isWideScreen ? 168 : 150,
    reviewExampleWidth: isWideScreen ? 220 : 200,
    tallExampleWidth: isWideScreen ? 140 : 132,
  };
}
