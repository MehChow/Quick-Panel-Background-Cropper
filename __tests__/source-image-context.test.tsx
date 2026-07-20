import { SourceImageContext } from "@/features/quick-panel/customize/components/SourceImageContext";
import { getImagePlacementBounds } from "@/features/quick-panel/model/panel-geometry";
import { s25PlusOneUi85Preset } from "@/features/quick-panel/model/preset";
import type {
  ImageTransform,
  QuickPanelPreset,
} from "@/features/quick-panel/model/types";
import { render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import type { SharedValue } from "react-native-reanimated";

jest.mock("expo-image", () => {
  const React = jest.requireActual("react");
  const { View } = jest.requireActual("react-native");
  return {
    Image: (props: Record<string, unknown>) =>
      React.createElement(View, { ...props, testID: "expo-image" }),
  };
});

jest.mock("react-native-svg", () => {
  const React = jest.requireActual("react");
  const { View } = jest.requireActual("react-native");
  const Svg = (props: Record<string, unknown>) =>
    React.createElement(View, props);
  const Path = (props: Record<string, unknown>) =>
    React.createElement(View, props);
  const Rect = (props: Record<string, unknown>) =>
    React.createElement(View, props);
  return { __esModule: true, default: Svg, Path, Rect };
});

const image = { height: 654, uri: "file:///background.png", width: 298 };
const transform = { scale: 1, x: 0, y: 0 };
const sharedTransform = {
  get: () => transform,
  set: jest.fn(),
  value: transform,
} as unknown as SharedValue<ImageTransform>;
const previewScale = {
  get: () => 0.5,
  set: jest.fn(),
  value: 0.5,
} as unknown as SharedValue<number>;

const buttonPreset: QuickPanelPreset = {
  ...s25PlusOneUi85Preset,
  id: "button-test",
  mode: "advanced",
  panels: {
    "button-1": {
      id: "button-1",
      family: "button",
      fileName: "button.png",
      label: "Wi-Fi",
      rect: { x: 14, y: 164, width: 120, height: 60, radius: 20 },
    },
  },
  visualOrder: ["button-1"],
  goodLockOrder: ["button-1"],
};

function renderContext(
  preset: QuickPanelPreset,
  buttonPanelOpacity = 0.63,
  visible = true,
) {
  return render(
    <SourceImageContext
      buttonPanelOpacity={buttonPanelOpacity}
      frame={getImagePlacementBounds(preset)}
      image={image}
      layoutScale={0.5}
      preset={preset}
      previewScale={previewScale}
      previewUri="file:///preview.png"
      transform={sharedTransform}
      visible={visible}
    />,
  );
}

describe("source image context", () => {
  it("renders one Controls image with SVG backing and inverse dim layers", () => {
    const screen = renderContext(s25PlusOneUi85Preset);

    expect(screen.getAllByTestId("source-context-panel-backing")).toHaveLength(4);
    expect(screen.getByTestId("source-context-dim-path").props.fillRule).toBe(
      "evenodd",
    );
    expect(screen.getByTestId("source-context-dim-path").props.fill).toBe(
      "rgba(0,0,0,0.5)",
    );
    expect(screen.getAllByTestId("expo-image")).toHaveLength(1);
    expect(
      StyleSheet.flatten(screen.getByTestId("expo-image").props.style),
    ).toMatchObject({ opacity: 0.5 });
  });

  it.each([
    ["Controls", s25PlusOneUi85Preset],
    ["Buttons", buttonPreset],
  ])("renders one inset movement boundary for %s", (_label, preset) => {
    const screen = renderContext(preset);
    const frame = getImagePlacementBounds(preset);
    const inset = 2;
    const boundaries = screen.getAllByTestId(
      "source-context-movement-boundary",
    );

    expect(boundaries).toHaveLength(1);
    expect(boundaries[0].props).toMatchObject({
      fill: "none",
      height: frame.height - inset * 2,
      stroke: "#f5d6aa",
      strokeOpacity: 0.55,
      strokeWidth: 4,
      width: frame.width - inset * 2,
      x: frame.x + inset,
      y: frame.y + inset,
    });
    expect(screen.queryAllByTestId("source-context-crop-square")).toHaveLength(
      0,
    );
  });

  it("uses the Button image intensity on the shared image", () => {
    const screen = renderContext(buttonPreset, 0.63);
    const sourceImage = screen.getByTestId("expo-image");

    expect(StyleSheet.flatten(sourceImage.props.style)).toMatchObject({
      opacity: 0.63,
    });
    expect(sourceImage.props.source).toEqual({ uri: "file:///preview.png" });
    expect(sourceImage.props.cachePolicy).toBe("memory-disk");
  });

  it("keeps every source layer mounted with zero visibility when hidden", () => {
    const screen = renderContext(s25PlusOneUi85Preset, 0.63, false);

    expect(screen.getAllByTestId("expo-image")).toHaveLength(1);
    expect(
      StyleSheet.flatten(screen.getByTestId("expo-image").props.style),
    ).toMatchObject({ opacity: 0 });
    expect(screen.getByTestId("source-context-backings").props.opacity).toBe(0);
    expect(screen.getByTestId("source-context-dim").props.opacity).toBe(0);
    expect(
      screen.getByTestId("source-context-movement-boundary").props
        .strokeOpacity,
    ).toBe(0);
    expect(screen.queryAllByTestId("source-context-crop-square")).toHaveLength(
      0,
    );
  });
});
