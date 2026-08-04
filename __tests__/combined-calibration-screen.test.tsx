import { render, screen } from "@testing-library/react-native";
import { CombinedCalibrationScreen } from "@/features/quick-panel/calibration/advanced/combined/CombinedCalibrationScreen";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("@/features/quick-panel/calibration/advanced/combined/hooks/useCombinedCalibrationScreen", () => ({
  useCombinedCalibrationScreen: () => ({
    advancedDraft: null,
    activePanelId: null,
    canGoBack: false,
    closeLeaveDialog: jest.fn(),
    error: null,
    errorKey: null,
    grid: { columns: 4, rows: 5 },
    goBack: jest.fn(),
    goForward: jest.fn(),
    importScreenshot: jest.fn(),
    isButtonSelectionPhase: false,
    isConfirmPhase: false,
    isControlSelectionPhase: false,
    isGridPhase: false,
    isLeaveDialogOpen: false,
    isOuterPhase: true,
    leaveCalibration: jest.fn(),
    panelItems: [],
    panels: null,
    phase: "outer",
    requestLeaveCalibration: jest.fn(),
    saveCalibration: jest.fn(),
    setColumns: jest.fn(),
    setRows: jest.fn(),
    setCombinedEnabledControls: jest.fn(),
    setCombinedButtons: jest.fn(),
    setCombinedOuterRect: jest.fn(),
    setCombinedPanels: jest.fn(),
  }),
}));

jest.mock("@/features/quick-panel/shared/QuickPanelScreenShell", () => ({
  QuickPanelScreenShell: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@/features/quick-panel/shared/SubPageHeader", () => ({
  SubPageHeader: ({ title, subtitle }: { title: string; subtitle: string }) => <>{title}{subtitle}</>,
}));

jest.mock("@/features/quick-panel/calibration/advanced/combined/CombinedSelectionStep", () => ({
  CombinedSelectionStep: () => null,
}));

jest.mock("@/features/quick-panel/calibration/advanced/components/AdvancedPanelCanvas", () => ({
  AdvancedPanelCanvas: () => null,
}));

jest.mock("@/features/quick-panel/calibration/advanced/AdvancedCalibrationControls", () => ({
  AdvancedCalibrationControls: () => null,
}));

jest.mock("@/features/quick-panel/calibration/advanced/components/AdvancedCalibrationLeaveDialog", () => ({
  AdvancedCalibrationLeaveDialog: () => null,
}));

jest.mock("@/features/quick-panel/calibration/advanced/AdvancedGridSheet", () => ({
  AdvancedGridSheet: () => null,
}));

jest.mock("@/features/quick-panel/shared/PanelAlignmentHelpSheet", () => ({
  PanelAlignmentHelpSheet: () => null,
}));

jest.mock("@/features/quick-panel/shared/PanelReviewHelpSheet", () => ({
  PanelReviewHelpSheet: () => null,
}));

jest.mock("@/features/quick-panel/calibration/shared/OuterCalibrationStep", () => ({
  OuterCalibrationStep: ({ title, subtitle }: { title: string; subtitle: string }) => {
    const React = jest.requireActual("react");
    const { Text } = jest.requireActual("react-native");
    return React.createElement(React.Fragment, null,
      React.createElement(Text, null, title),
      React.createElement(Text, null, subtitle),
    );
  },
}));

describe("CombinedCalibrationScreen", () => {
  it("renders the combined calibration title and outer subtitle", () => {
    render(<CombinedCalibrationScreen />);
    expect(screen.getByText("advancedCalibration.title")).toBeTruthy();
    expect(screen.getByText("advancedCalibration.combinedOuterSubtitle")).toBeTruthy();
  });
});
