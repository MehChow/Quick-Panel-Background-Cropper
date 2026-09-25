import { useState } from "react";
import { Pressable, Text } from "react-native";
import { act, fireEvent, render } from "@testing-library/react-native";
import ColorPicker, { useColorPickerContext } from "reanimated-color-picker";
import { ButtonLabelAppearanceDialogFrame } from "@/features/quick-panel/customize/components/ButtonLabelAppearanceDialogFrame";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("react-native-reanimated", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  return {
    ...jest.requireActual("react-native-reanimated/mock"),
    useSharedValue: (value: number) => React.useState(() => ({ value }))[0],
  };
});

interface DraftChannels { brightness: number; alpha: number }

function PickerProbe({ brightness, alpha }: DraftChannels) {
  const values = useColorPickerContext();
  return <Pressable testID="picker-state" onPress={() => {
    values.hueValue.value = 287;
    values.saturationValue.value = 63;
    values.brightnessValue.value = brightness;
    values.alphaValue.value = alpha;
  }} accessibilityValue={{ text: JSON.stringify({
    hue: values.hueValue.value,
    saturation: values.saturationValue.value,
    brightness: values.brightnessValue.value,
    alpha: values.alphaValue.value,
  }) }} />;
}

function Harness(channels: DraftChannels) {
  const [preview, setPreview] = useState(false);
  const [revision, setRevision] = useState(0);
  return <ButtonLabelAppearanceDialogFrame
    confirmDisabled={false}
    fullScreenContent={preview ? <Pressable testID="close-preview" onPress={() => setPreview(false)} /> : undefined}
    onCancel={() => undefined}
    onConfirm={() => undefined}
    onOpenOverallPreview={() => setPreview(true)}
    onRequestClose={() => setPreview(false)}
    open
    scrollEnabled
  >
    <ColorPicker value="#ffffff"><PickerProbe {...channels} /></ColorPicker>
    <Pressable testID="refresh-probe" onPress={() => setRevision(revision + 1)}><Text>{revision}</Text></Pressable>
  </ButtonLabelAppearanceDialogFrame>;
}

it.each([{ brightness: 42, alpha: 0.36 }, { brightness: 0, alpha: 0 }])(
  "preserves the real picker's HSV and alpha through preview round trips: %j", (channels) => {
  const screen = render(<Harness {...channels} />);
  fireEvent.press(screen.getByTestId("picker-state"));
  // The native shared-value mock does not drive React renders.
  act(() => fireEvent.press(screen.getByTestId("refresh-probe")));
  const expected = JSON.stringify({ hue: 287, saturation: 63, ...channels });
  expect(screen.getByTestId("picker-state").props.accessibilityValue.text).toBe(expected);
  for (let i = 0; i < 2; i++) {
    fireEvent.press(screen.getByTestId("button-label-appearance-overall-preview"));
    expect(screen.queryByTestId("picker-state")).toBeNull();
    fireEvent.press(screen.getByTestId("close-preview"));
    expect(screen.getByTestId("picker-state").props.accessibilityValue.text).toBe(expected);
  }
});
