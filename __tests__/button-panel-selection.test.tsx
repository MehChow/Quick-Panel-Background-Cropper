import { ButtonPanelSelection } from "@/features/quick-panel/calibration/advanced/components/ButtonPanelSelection";
import type {
  ButtonCalibrationItem,
  PanelRect,
  PickedImage,
} from "@/features/quick-panel/model/types";
import { fireEvent, render } from "@testing-library/react-native";
import { Text } from "react-native";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number; label?: string }) => {
      if (key === "advancedCalibration.selectedButtons") {
        return `Selected ${options?.count ?? 0}`;
      }
      if (key === "advancedCalibration.remove") return "Remove";
      if (key === "advancedCalibration.noButtonsSelected") return "None";
      if (key === "advancedCalibration.buttonSearchPlaceholder") return "Search";
      if (key === "advancedCalibration.addCustomButtonLabel") {
        return `Add ${options?.label ?? ""}`;
      }
      if (key === "buttonLabels.wi-fi") return "Wi-Fi";
      return key;
    },
  }),
}));

jest.mock("@react-native-vector-icons/lucide", () => ({
  Lucide: ({ name }: { name: string }) => {
    const { Text: MockText } = jest.requireActual("react-native");
    return <MockText>{name}</MockText>;
  },
}));

jest.mock(
  "@/features/quick-panel/calibration/advanced/components/CalibrationAreaPreview",
  () => ({
    CalibrationAreaPreview: ({
      children,
    }: {
      children: (previewTrigger: React.ReactNode) => React.ReactNode;
    }) => (
      <>{children(null)}</>
    ),
  }),
);

jest.mock(
  "@/features/quick-panel/calibration/advanced/components/CustomButtonIconDialog",
  () => ({ CustomButtonIconDialog: () => null }),
);

const outerRect: PanelRect = {
  x: 0,
  y: 0,
  width: 200,
  height: 100,
  radius: 0,
};

const screenshot: PickedImage = {
  uri: "file:///screenshot.png",
  width: 200,
  height: 100,
};

function button(
  id: "button-1" | "button-2",
  label: string,
  customIconId: ButtonCalibrationItem["customIconId"],
): ButtonCalibrationItem {
  return { id, label, customIconId, rect: outerRect };
}

describe("ButtonPanelSelection", () => {
  it("shows built-in and custom icons while preserving removal order", () => {
    const onButtonsChange = jest.fn();
    const screen = render(
      <ButtonPanelSelection
        buttons={[
          button("button-1", "Wi-Fi", null),
          button("button-2", "My scene", "star"),
        ]}
        onButtonsChange={onButtonsChange}
        outerRect={outerRect}
        screenshot={screenshot}
      />,
    );

    const wifiRows = screen.getAllByText("wifi");
    expect(wifiRows.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("star")).toBeTruthy();

    fireEvent.press(screen.getByRole("checkbox", { name: "Wi-Fi" }));

    expect(onButtonsChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: "button-1", label: "My scene", customIconId: "star" }),
    ]);
  });
});
