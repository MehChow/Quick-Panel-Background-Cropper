import { CalibrationAreaPreview } from "@/features/quick-panel/calibration/advanced/components/CalibrationAreaPreview";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { View } from "react-native";

const screenshot = {
  uri: "file:///quick-panel.png",
  width: 1080,
  height: 2340,
};
const outerRect = {
  x: 40,
  y: 300,
  width: 1000,
  height: 1400,
  radius: 0,
};

describe("CalibrationAreaPreview", () => {
  it("pins the preview on tap and dismisses it from the backdrop", async () => {
    const screen = render(
      <CalibrationAreaPreview outerRect={outerRect} screenshot={screenshot}>
        {(previewTrigger) => <View>{previewTrigger}</View>}
      </CalibrationAreaPreview>,
    );

    fireEvent.press(screen.getByLabelText("Preview outlined area"));

    expect(screen.getByTestId("calibration-area-preview-overlay")).toBeTruthy();
    expect(screen.queryByText("Release to close")).toBeNull();

    fireEvent.press(screen.getByLabelText("Close outlined area preview"));

    await waitFor(() => {
      expect(screen.queryByTestId("calibration-area-preview-overlay")).toBeNull();
    });
  });

  it("does not open the preview on long press", () => {
    const screen = render(
      <CalibrationAreaPreview outerRect={outerRect} screenshot={screenshot}>
        {(previewTrigger) => <View>{previewTrigger}</View>}
      </CalibrationAreaPreview>,
    );
    const trigger = screen.getByLabelText("Preview outlined area");

    fireEvent(trigger, "longPress");

    expect(screen.queryByTestId("calibration-area-preview-overlay")).toBeNull();
  });
});
