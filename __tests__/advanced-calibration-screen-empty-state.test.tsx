import { render, screen } from "@testing-library/react-native";
import { AdvancedCalibrationScreen } from "@/features/quick-panel/calibration/advanced/AdvancedCalibrationScreen";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("@/features/quick-panel/shared/SubPageHeader", () => ({
  SubPageHeader: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <>
      <>{title}</>
      <>{subtitle}</>
    </>
  ),
}));

jest.mock("@/features/quick-panel/shared/CalibrationHelpSheet", () => ({
  CalibrationHelpSheet: () => null,
}));

jest.mock("@/features/quick-panel/shared/PanelAlignmentHelpSheet", () => ({
  PanelAlignmentHelpSheet: () => null,
}));

jest.mock("@/features/quick-panel/shared/PanelReviewHelpSheet", () => ({
  PanelReviewHelpSheet: () => null,
}));

jest.mock("@/features/quick-panel/calibration/advanced/AdvancedGridSheet", () => ({
  AdvancedGridSheet: () => null,
}));

jest.mock("@/features/quick-panel/calibration/advanced/components/AdvancedOuterOverlay", () => ({
  AdvancedOuterOverlay: () => null,
}));

jest.mock("@/features/quick-panel/calibration/advanced/components/AdvancedPanelCanvas", () => ({
  AdvancedPanelCanvas: () => null,
}));

jest.mock("@/features/quick-panel/calibration/advanced/components/AdvancedPanelSelection", () => ({
  AdvancedPanelSelection: () => null,
}));

jest.mock("@/features/quick-panel/calibration/advanced/AdvancedCalibrationControls", () => ({
  AdvancedCalibrationControls: () => null,
}));

jest.mock("@/features/quick-panel/calibration/shared/CalibrationCanvas", () => ({
  CalibrationCanvas: ({
    emptyCardMaxWidth,
    emptyExampleRowMaxWidth,
    showImportButton,
  }: {
    emptyCardMaxWidth?: number;
    emptyExampleRowMaxWidth?: number;
    showImportButton?: boolean;
  }) => {
    const React = jest.requireActual("react");
    const { Text } = jest.requireActual("react-native");
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(Text, null, `card:${String(emptyCardMaxWidth)}`),
      React.createElement(Text, null, `row:${String(emptyExampleRowMaxWidth)}`),
      React.createElement(Text, null, `import:${String(showImportButton)}`),
    );
  },
}));

jest.mock("@/features/quick-panel/calibration/advanced/hooks/useAdvancedCalibrationScreen", () => ({
  useAdvancedCalibrationScreen: () => ({
    advancedDraft: null,
    canGoBack: false,
    enabledPanels: [],
    error: null,
    goBack: jest.fn(),
    goForward: jest.fn(),
    grid: { columns: 4, rows: 5 },
    importScreenshot: jest.fn(),
    isConfirmPhase: false,
    isGridPhase: false,
    isOuterPhase: true,
    isPanelSelectionPhase: false,
    phase: "outer",
    saveCalibration: jest.fn(),
    setAdvancedEnabledPanels: jest.fn(),
    setAdvancedOuterRect: jest.fn(),
    setAdvancedPanels: jest.fn(),
    setColumns: jest.fn(),
    setRows: jest.fn(),
  }),
}));

jest.mock("@/features/quick-panel/shared/wide-screen-layout", () => ({
  getWideScreenLayout: () => ({
    isWideScreen: true,
    footerMaxWidth: 560,
    contentMaxWidth: 540,
    heroMaxWidth: 520,
    importCardMaxWidth: 560,
    importExampleRowMaxWidth: 380,
    resultGridMaxWidth: 460,
    selectCardMaxWidth: 220,
    selectContentMaxWidth: 640,
    selectPreviewMaxHeight: 460,
    shouldStackSelectCards: false,
  }),
}));

describe("AdvancedCalibrationScreen empty state", () => {
  it("uses the same bounded import card inputs as default calibration", () => {
    render(<AdvancedCalibrationScreen />);

    expect(screen.getByText("card:560")).toBeTruthy();
    expect(screen.getByText("row:380")).toBeTruthy();
    expect(screen.getByText("import:false")).toBeTruthy();
    expect(screen.getByTestId("advanced-calibration-footer")).toBeTruthy();
    expect(screen.getByText("calibration.chooseFromAlbum")).toBeTruthy();
  });
});
