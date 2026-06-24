interface ResultPanelLayoutInput {
  availableHeight: number;
  availableWidth: number;
}

interface ResultPanelLayout {
  cardMaxWidth: number;
  gridMaxWidth: number;
  isCompact: boolean;
}

const compactGridWidthFactor = 0.94;
const compactChromeHeight = 172;
const cardHorizontalPadding = 48;
const cardOuterMargin = 24;
const defaultGridMaxWidth = 460;

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

  if (gridMaxWidth >= defaultGridMaxWidth) {
    return {
      cardMaxWidth: defaultGridMaxWidth + cardHorizontalPadding,
      gridMaxWidth: defaultGridMaxWidth,
      isCompact: false,
    };
  }

  return {
    cardMaxWidth,
    gridMaxWidth,
    isCompact: gridMaxWidth < defaultGridMaxWidth,
  };
}
