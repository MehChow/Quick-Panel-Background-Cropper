import { FocusedButtonAppearancePreview } from "@/features/quick-panel/customize/components/FocusedButtonAppearancePreview";
import type { InspectableButtonPanel } from "@/features/quick-panel/customize/focused-button-inspector";
import type { QuickPanelPreset } from "@/features/quick-panel/model/types";
import { fireEvent, render } from "@testing-library/react-native";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, string>) =>
      key === "customize.buttonAppearancePreview"
        ? `${values?.label} appearance preview`
        : key,
  }),
}));

jest.mock(
  "@/features/quick-panel/customize/components/QuickPanelPreviewStage",
  () => {
    const React = jest.requireActual("react");
    const { View } = jest.requireActual("react-native");
    return {
      QuickPanelPreviewStage: (props: Record<string, unknown>) =>
        React.createElement(View, { ...props, testID: "focused-button-preview-stage" }),
    };
  },
);

const panel = (rect: InspectableButtonPanel["rect"]): InspectableButtonPanel => ({
  id: "button-1",
  label: "Wi-Fi",
  fileName: "01-button-wi-fi.png",
  family: "button",
  rect,
  buttonIdentifier: {
    columnSpan: 1,
    iconName: "wifi",
    referenceCellSize: 80,
    rowSpan: 1,
  },
});

const currentPanel = panel({
  x: 20,
  y: 30,
  width: 160,
  height: 80,
  radius: 40,
});
const preset: QuickPanelPreset = {
  id: "buttons",
  label: "Buttons",
  mode: "advanced",
  width: 300,
  height: 600,
  customizationArea: { x: 0, y: 0, width: 300, height: 600, radius: 0 },
  panels: { "button-1": currentPanel },
  visualOrder: ["button-1"],
  goodLockOrder: ["button-1"],
};

const props = {
  backgroundTheme: "dark" as const,
  buttonIdentifierColor: "#D9CCFF",
  buttonIdentifierOpacity: 0.7,
  buttonPanelOpacity: 0.42,
  identifierPositions: { horizontal: 0.23, vertical: 0.77 },
  image: { uri: "file://image", width: 100, height: 100 },
  panel: currentPanel,
  preset,
  previewUri: "file://preview",
  showButtonIdentifiers: true,
  transform: { x: 12, y: -8, scale: 1.4 },
};

describe("FocusedButtonAppearancePreview", () => {
  it("fits a horizontal Button and delegates the real composition inputs", () => {
    const screen = render(<FocusedButtonAppearancePreview {...props} />);
    expect(screen.getByTestId("focused-button-appearance-preview").props.className)
      .toContain("w-[70%]");
    fireEvent(
      screen.getByTestId("focused-button-appearance-preview"),
      "layout",
      { nativeEvent: { layout: { width: 320, height: 180 } } },
    );

    expect(screen.getByTestId("focused-button-preview-stage").props).toMatchObject({
      buttonIdentifierBackgroundTheme: "dark",
      buttonIdentifierColor: "#D9CCFF",
      buttonIdentifierOpacity: 0.7,
      buttonPanelOpacity: 0.42,
      identifierPositions: { horizontal: 0.23, vertical: 0.77 },
      layoutScale: 2,
      previewFrame: currentPanel.rect,
      previewRatio: 2,
      previewScale: 2,
      previewUri: "file://preview",
      previewWidth: 320,
      showAppGradientBackground: true,
      showButtonIdentifiers: true,
      transform: { x: 12, y: -8, scale: 1.4 },
    });
    expect(screen.getByTestId("focused-button-preview-stage").props.preset)
      .toMatchObject({ visualOrder: ["button-1"], goodLockOrder: ["button-1"] });
    expect(
      screen.getByTestId("focused-button-appearance-preview").props.accessibilityLabel,
    ).toBe("Wi-Fi appearance preview");
  });

  it("fits a vertical Button within the same height budget", () => {
    const verticalPanel = panel({
      x: 20,
      y: 30,
      width: 80,
      height: 160,
      radius: 40,
    });
    const screen = render(
      <FocusedButtonAppearancePreview
        {...props}
        panel={verticalPanel}
      />,
    );
    fireEvent(
      screen.getByTestId("focused-button-appearance-preview"),
      "layout",
      { nativeEvent: { layout: { width: 320, height: 180 } } },
    );

    expect(screen.getByTestId("focused-button-preview-stage").props).toMatchObject({
      layoutScale: 1.125,
      previewWidth: 90,
      previewRatio: 0.5,
      previewFrame: verticalPanel.rect,
    });
  });
});
