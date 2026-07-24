interface ResultPanelLayoutInput {
  availableHeight: number;
  availableWidth: number;
}

interface ResultPanelLayout {
  cardMaxWidth: number;
  exportGridIndicatorInset: number;
  exportGridViewportHeight: number;
  gridMaxWidth: number;
  isCompact: boolean;
}

const compactGridWidthFactor = 0.94;
const compactChromeHeight = 172;
const cardHorizontalPadding = 48;
const cardOuterMargin = 24;
const defaultGridMaxWidth = 460;
const exportGridIndicatorInsetFactor = 0.03;
const exportGridLabelAndGapHeight = 76;

export function getResultPanelLayout({
  availableHeight,
  availableWidth,
}: ResultPanelLayoutInput): ResultPanelLayout {
  const fittedWidthFromHeight =
    availableHeight > 0
      ? Math.floor((availableHeight - compactChromeHeight) / compactGridWidthFactor)
      : defaultGridMaxWidth;
  const fittedWidthFromViewport =
    availableWidth > 0
      ? Math.floor(availableWidth - cardOuterMargin)
      : defaultGridMaxWidth;
  const fittedGridWidthFromViewport =
    availableWidth > 0
      ? Math.floor(availableWidth - cardOuterMargin - cardHorizontalPadding)
      : defaultGridMaxWidth;
  const gridMaxWidth = Math.min(
    defaultGridMaxWidth,
    Math.max(160, fittedWidthFromHeight),
    Math.max(160, fittedGridWidthFromViewport),
  );
  const cardMaxWidth = Math.min(
    Math.max(gridMaxWidth + cardHorizontalPadding, 220),
    Math.max(220, fittedWidthFromViewport),
  );
  const exportGridViewportHeight =
    Math.floor(gridMaxWidth * compactGridWidthFactor) + exportGridLabelAndGapHeight;
  const exportGridIndicatorInset = Math.floor(
    gridMaxWidth * exportGridIndicatorInsetFactor,
  );

  if (gridMaxWidth >= defaultGridMaxWidth) {
    return {
      cardMaxWidth: defaultGridMaxWidth + cardHorizontalPadding,
      exportGridIndicatorInset,
      exportGridViewportHeight,
      gridMaxWidth: defaultGridMaxWidth,
      isCompact: false,
    };
  }

  return {
    cardMaxWidth,
    exportGridIndicatorInset,
    exportGridViewportHeight,
    gridMaxWidth,
    isCompact: gridMaxWidth < defaultGridMaxWidth,
  };
}
