import { render, screen } from "@testing-library/react-native";
import { CalibrationScreen } from "@/features/quick-panel/calibration/default/CalibrationScreen";

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

jest.mock("@/features/quick-panel/calibration/shared/CalibrationCanvas", () => ({
  CalibrationCanvas: () => null,
}));

jest.mock("@/features/quick-panel/calibration/default/components/DefaultCalibrationOverlay", () => ({
  DefaultCalibrationOverlay: () => null,
}));

jest.mock("@/features/quick-panel/calibration/default/hooks/useCalibrationScreen", () => ({
  useCalibrationScreen: () => ({
    error: null,
    isHelpOpen: false,
    displayedScreenshot: null,
    displayedRect: null,
    isCalibrating: false,
    setCalibrationRect: jest.fn(),
    importScreenshot: jest.fn(),
    saveCalibration: jest.fn(),
    openHelp: jest.fn(),
    closeHelp: jest.fn(),
  }),
}));

describe("CalibrationScreen empty state", () => {
  it("renders the import button in a pinned footer even before calibration starts", () => {
    render(<CalibrationScreen />);

    expect(screen.getByTestId("calibration-footer")).toBeTruthy();
    expect(screen.getByText("calibration.chooseFromAlbum")).toBeTruthy();
  });
});
