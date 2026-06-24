export interface WideScreenLayout {
  isWideScreen: boolean;
  footerMaxWidth: number;
  contentMaxWidth: number;
  heroMaxWidth: number;
  importCardMaxWidth: number;
  importExampleRowMaxWidth: number;
  resultGridMaxWidth: number;
  selectCardMaxWidth: number;
  selectContentMaxWidth: number;
  selectPreviewMaxHeight: number;
  resultTopPadding: number;
  shouldStackSelectCards: boolean;
}

const wideScreenMinWidth = 720;
const wideScreenRatio = 0.9;
const shortSelectHeight = 760;

export function getWideScreenLayout(
  width: number,
  height: number,
): WideScreenLayout {
  const isWideScreen = width >= wideScreenMinWidth && width > height * wideScreenRatio;

  return {
    isWideScreen,
    footerMaxWidth: isWideScreen ? 560 : 999,
    contentMaxWidth: isWideScreen ? 540 : 999,
    heroMaxWidth: isWideScreen ? 520 : 999,
    importCardMaxWidth: isWideScreen ? 560 : 999,
    importExampleRowMaxWidth: isWideScreen ? 380 : 999,
    resultGridMaxWidth: isWideScreen ? 460 : 999,
    resultTopPadding: isWideScreen ? 16 : 0,
    selectCardMaxWidth: isWideScreen ? 220 : 999,
    selectContentMaxWidth: isWideScreen ? 640 : 999,
    selectPreviewMaxHeight: isWideScreen ? 460 : 999,
    shouldStackSelectCards: !isWideScreen && height < shortSelectHeight,
  };
}
