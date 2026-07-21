import { PanelSlice } from "@/features/quick-panel/customize/components/PanelSlice";
import { ExportSurface } from "@/features/quick-panel/customize/components/ExportSurface";
import type {
  ImageTransform,
  PanelDefinition,
} from "@/features/quick-panel/model/types";
import en from "@/../i18next/locales/en";
import zh from "@/../i18next/locales/zh";
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

jest.mock(
  "@/features/quick-panel/customize/components/PanelOverlay",
  () => ({ PanelOverlay: () => null }),
);

const image = { height: 200, uri: "file:///background.png", width: 100 };
const transform = { scale: 1, x: 0, y: 0 };
const sharedTransform = {
  get: () => transform,
  set: jest.fn(),
  value: transform,
} as unknown as SharedValue<ImageTransform>;
const previewScale = {
  get: () => 1,
  set: jest.fn(),
  value: 1,
} as unknown as SharedValue<number>;

function createPanel(family: PanelDefinition["family"]): PanelDefinition {
  return {
    buttonIdentifier: family === "button"
      ? { columnSpan: 1, rowSpan: 1, iconName: "wifi" }
      : undefined,
    family,
    fileName: `${family}.png`,
    id: family === "button" ? "button-1" : "brightness",
    label: family,
    rect: { height: 80, radius: 16, width: 80, x: 10, y: 20 },
  };
}

describe("panel image intensity", () => {
  it("previews Controls at 50% image opacity without a black overlay", () => {
    const screen = render(
      <PanelSlice
        buttonIdentifierOpacity={0.7}
        buttonPanelOpacity={0.78}
        image={image}
        identifierPositions={{ horizontal: 0.5, vertical: 0.5 }}
        layoutScale={1}
        mode="default"
        originX={0}
        originY={0}
        panel={createPanel("control")}
        previewScale={previewScale}
        previewUri="file:///preview.png"
        showOverlay={false}
        showButtonIdentifiers
        transform={sharedTransform}
      />,
    );

    expect(StyleSheet.flatten(screen.getByTestId("expo-image").props.style)).toMatchObject({
      opacity: 0.5,
    });
    expect(
      screen.UNSAFE_queryByProps({ className: "absolute inset-0 bg-black/10" }),
    ).toBeNull();
  });

  it("keeps Button preview opacity driven by the slider value", () => {
    const screen = render(
      <PanelSlice
        buttonIdentifierOpacity={0.7}
        buttonPanelOpacity={0.63}
        image={image}
        identifierPositions={{ horizontal: 0.5, vertical: 0.5 }}
        layoutScale={1}
        mode="advanced"
        originX={0}
        originY={0}
        panel={createPanel("button")}
        previewScale={previewScale}
        previewUri="file:///preview.png"
        showOverlay={false}
        showButtonIdentifiers
        transform={sharedTransform}
      />,
    );

    const previewImage = screen.getByTestId("expo-image");
    expect(StyleSheet.flatten(previewImage.props.style)).toMatchObject({
      opacity: 0.63,
    });
    expect(previewImage.props.source).toEqual({ uri: "file:///preview.png" });
    expect(previewImage.props.cachePolicy).toBe("memory-disk");
  });

  it("keeps image coordinates independent from the decorative panel border", () => {
    const screen = render(
      <PanelSlice
        buttonIdentifierOpacity={0.7}
        buttonPanelOpacity={0.63}
        image={image}
        identifierPositions={{ horizontal: 0.5, vertical: 0.5 }}
        layoutScale={1}
        mode="default"
        originX={0}
        originY={0}
        panel={createPanel("control")}
        previewScale={previewScale}
        previewUri="file:///preview.png"
        showOverlay={false}
        showButtonIdentifiers
        transform={sharedTransform}
      />,
    );
    const panelSlice = screen.getByTestId("panel-slice-brightness");
    const frame = screen.getByTestId("panel-slice-frame-brightness");

    expect(StyleSheet.flatten(panelSlice.props.style).borderWidth).toBeUndefined();
    expect(frame.props.pointerEvents).toBe("none");
    expect(frame.props.className).toContain("absolute inset-0");
    expect(StyleSheet.flatten(frame.props.style)).toMatchObject({
      borderColor: "rgba(255,255,255,0.9)",
      borderRadius: 32,
      borderWidth: 1,
    });
  });

  it("keeps Controls exports fully opaque", () => {
    const screen = render(
      <ExportSurface
        buttonIdentifierOpacity={0.7}
        buttonPanelOpacity={0.63}
        image={image}
        identifierPositions={{ horizontal: 0.5, vertical: 0.5 }}
        onIdentifierPositionReady={jest.fn()}
        onImageLoad={jest.fn()}
        panel={createPanel("control")}
        side={100}
        showButtonIdentifiers
        transform={transform}
      />,
    );

    const exportImage = screen.getByTestId("expo-image");
    expect(StyleSheet.flatten(exportImage.props.style)).toMatchObject({
      opacity: 1,
    });
    expect(exportImage.props.cachePolicy).toBe("memory-disk");
  });

  it("applies the slider value to Button exports", () => {
    const screen = render(
      <ExportSurface
        buttonIdentifierOpacity={0.7}
        buttonPanelOpacity={0.63}
        image={image}
        identifierPositions={{ horizontal: 0.5, vertical: 0.5 }}
        onIdentifierPositionReady={jest.fn()}
        onImageLoad={jest.fn()}
        panel={createPanel("button")}
        side={100}
        showButtonIdentifiers
        transform={transform}
      />,
    );

    expect(StyleSheet.flatten(screen.getByTestId("expo-image").props.style)).toMatchObject({
      opacity: 0.63,
    });
  });

  it("describes the slider as Button image intensity in both locales", () => {
    expect(en.translation.customize.buttonPanelOpacity).toBe(
      "Button image intensity",
    );
    expect(zh.translation.customize.buttonPanelOpacity).toBe("按鈕圖片強度");
  });
});
