import { ButtonLabelAppearanceDialog } from "@/features/quick-panel/customize/components/ButtonLabelAppearanceDialog";
import { useButtonLabelAppearanceDraft } from "@/features/quick-panel/customize/hooks/useButtonLabelAppearanceDraft";
import type { QuickPanelPreset } from "@/features/quick-panel/model/types";
import { act, fireEvent, render, renderHook } from "@testing-library/react-native";
import { KeyboardAvoidingView, Modal, Platform } from "react-native";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, string | number>) => {
      const strings: Record<string, string> = {
        "common.cancel": "Cancel",
        "common.confirm": "Confirm",
        "customize.invalidButtonIdentifierHex":
          "Enter a valid six-digit HEX color.",
        "customize.buttonAppearanceNext": "Next Button",
        "customize.buttonAppearancePosition": "{{label}} · {{current}} of {{total}}",
        "customize.buttonAppearancePrevious": "Previous Button",
        "customize.buttonAppearancePreview": "{{label}} appearance preview",
        "customize.buttonAppearanceOverallPreview": "Preview full layout",
        "customize.buttonAppearanceOverallPreviewHint":
          "Tap to open the full layout preview. Tap the dimmed background to close.",
        "customize.buttonAppearanceOverallPreviewClose":
          "Close full layout preview",
        "customize.buttonAppearanceUnavailable": "Button preview unavailable.",
      };
      return (strings[key] ?? key).replace(/\{\{(\w+)\}\}/g, (_, name) =>
        String(values?.[name] ?? `{{${name}}}`),
      );
    },
  }),
}));
jest.mock("reanimated-color-picker", () => {
  const React = jest.requireActual("react");
  const { View } = jest.requireActual("react-native");
  const pickerValues = {
    alphaValue: { value: 0.7 },
    brightnessValue: { value: 64 },
  };
  const Picker = React.forwardRef(
    (
      props: { children: React.ReactNode },
      ref: React.ForwardedRef<{ setColor: (color: string) => void }>,
    ) => {
      React.useImperativeHandle(ref, () => ({ setColor: jest.fn() }));
      return React.createElement(
        View,
        { ...props, children: undefined, testID: "mock-color-picker" },
        props.children,
      );
    },
  );
  const part = (testID: string) => (props: Record<string, unknown>) =>
    React.createElement(View, { ...props, testID });
  const colorKit = {
    HEX: (value: string) => value.slice(0, 7),
    RGB: (value: string) => ({
      object: () => ({ a: Number(value.split(",").at(-1)?.replace(")", "") ?? 1) }),
    }),
    getAlpha: () => 1,
    runOnUI: () => colorKit,
    setAlpha: (color: string, alpha: number) => ({
      rgb: () => ({ string: () => `rgba(255,255,255,${alpha})` }),
      color,
    }),
  };
  return {
    __esModule: true,
    default: Picker,
    BrightnessSlider: part("mock-brightness"),
    OpacitySlider: part("mock-opacity"),
    Panel3: part("mock-panel"),
    colorKit,
    useColorPickerContext: () => pickerValues,
  };
});
jest.mock(
  "@/features/quick-panel/customize/components/FocusedButtonAppearancePreview",
  () => {
    const React = jest.requireActual("react");
    const { View } = jest.requireActual("react-native");
    return {
      FocusedButtonAppearancePreview: (props: Record<string, unknown>) =>
        React.createElement(View, { ...props, testID: "focused-button-preview" }),
    };
  },
);
jest.mock(
  "@/features/quick-panel/customize/components/QuickPanelPreview",
  () => {
    const React = jest.requireActual("react");
    const { View } = jest.requireActual("react-native");
    return {
      QuickPanelPreview: (props: Record<string, unknown>) =>
        React.createElement(View, { ...props, testID: "overall-preview-panel" }),
    };
  },
);
const preset: QuickPanelPreset = {
  id: "buttons",
  label: "Buttons",
  mode: "advanced" as const,
  width: 300,
  height: 600,
  customizationArea: { x: 0, y: 0, width: 300, height: 600, radius: 0 },
  panels: {
    brightness: {
      id: "brightness",
      label: "Brightness",
      fileName: "01-control-brightness.png",
      family: "control",
      rect: { x: 0, y: 0, width: 300, height: 80, radius: 40 },
    },
    "button-1": {
      id: "button-1",
      label: "Wi-Fi",
      fileName: "02-button-wi-fi.png",
      family: "button",
      rect: { x: 0, y: 100, width: 160, height: 80, radius: 40 },
      buttonIdentifier: {
        columnSpan: 2,
        iconName: "wifi",
        referenceCellSize: 80,
        rowSpan: 1,
      },
    },
    "button-2": {
      id: "button-2",
      label: "Bluetooth",
      fileName: "03-button-bluetooth.png",
      family: "button",
      rect: { x: 0, y: 200, width: 80, height: 160, radius: 40 },
      buttonIdentifier: {
        columnSpan: 1,
        iconName: "bluetooth",
        referenceCellSize: 80,
        rowSpan: 2,
      },
    },
    "button-3": {
      id: "button-3",
      label: "Smart View",
      fileName: "04-button-smart-view.png",
      family: "button",
      rect: { x: 100, y: 200, width: 100, height: 100, radius: 50 },
      buttonIdentifier: {
        columnSpan: 1,
        iconName: "panels-top-left",
        referenceCellSize: 100,
        rowSpan: 1,
      },
    },
  },
  visualOrder: ["brightness", "button-1", "button-2", "button-3"],
  goodLockOrder: ["brightness", "button-1", "button-2", "button-3"],
};
const emptyPreset: QuickPanelPreset = {
  ...preset,
  panels: {},
  visualOrder: [],
  goodLockOrder: [],
};
const props = {
  backgroundTheme: "light" as const,
  color: "#FFFFFF",
  image: { uri: "file://image", width: 100, height: 100 },
  identifierPositions: { horizontal: 0.5, vertical: 0.5 },
  imageOpacity: 0.78,
  onCancel: jest.fn(),
  onConfirm: jest.fn(),
  opacity: 70,
  open: true,
  preset,
  previewUri: "file://preview",
  showButtonIdentifiers: true,
  transform: { x: 0, y: 0, scale: 1 },
};

describe("ButtonLabelAppearanceDialog", () => {
  beforeEach(() => jest.clearAllMocks());

  it("keeps preview read-only and validates transactional HEX confirmation", () => {
    const screen = render(
      <ButtonLabelAppearanceDialog
        {...props}
        identifierPositions={{ horizontal: 0.23, vertical: 0.77 }}
        imageOpacity={0.42}
      />,
    );
    expect(screen.getByTestId("focused-button-preview").props.panel.id).toBe(
      "button-1",
    );
    expect(screen.getByTestId("focused-button-preview").props).toMatchObject({
      backgroundTheme: "light",
      buttonPanelOpacity: 0.42,
      identifierPositions: { horizontal: 0.23, vertical: 0.77 },
    });
    const input = screen.getByTestId("button-identifier-hex-input");
    fireEvent.changeText(input, "#12");
    expect(screen.getByText("Enter a valid six-digit HEX color.")).toBeTruthy();
    fireEvent.press(screen.getByText("Confirm"));
    expect(props.onConfirm).not.toHaveBeenCalled();
    fireEvent.changeText(input, "336699");
    fireEvent.press(screen.getByText("Confirm"));
    expect(props.onConfirm).toHaveBeenCalledWith({
      backgroundTheme: "light",
      color: "#336699",
      opacity: 70,
    });
  });

  it("updates only the draft circle immediately when its theme changes", () => {
    const hook = renderHook(() =>
      useButtonLabelAppearanceDraft("#123456", 70, "light")
    );

    expect(hook.result.current.backgroundTheme).toBe("light");
    expect(hook.result.current.animatedAppearance.circleColor.value).toBe(
      "#FFFFFF",
    );
    const circleColor = hook.result.current.animatedAppearance.circleColor;

    act(() => hook.result.current.handleBackgroundThemeChange("dark"));

    expect(hook.result.current.backgroundTheme).toBe("dark");
    expect(circleColor.value).toBe("#666666");
    expect(hook.result.current.readConfirmedAppearance()).toEqual({
      backgroundTheme: "dark",
      color: "#123456",
      opacity: 70,
    });
  });

  it("cancels from the action and backdrop without committing", () => {
    const screen = render(<ButtonLabelAppearanceDialog {...props} />);
    fireEvent.press(screen.getByText("Cancel"));
    fireEvent.press(screen.getByTestId("button-label-appearance-backdrop"));
    expect(props.onCancel).toHaveBeenCalledTimes(2);
    expect(props.onConfirm).not.toHaveBeenCalled();
  });

  it("switches one shared slider card without losing picker values", () => {
    const screen = render(<ButtonLabelAppearanceDialog {...props} />);

    expect(screen.getByTestId("mock-brightness")).toBeTruthy();
    expect(screen.queryByTestId("mock-opacity")).toBeNull();
    expect(screen.getByTestId("button-label-adjustment-value").props.animatedProps)
      .toMatchObject({ text: "64%" });

    fireEvent.press(screen.getByTestId("button-label-intensity-tab"));
    expect(screen.queryByTestId("mock-brightness")).toBeNull();
    expect(screen.getByTestId("mock-opacity")).toBeTruthy();
    expect(screen.getByTestId("button-label-adjustment-value").props.animatedProps)
      .toMatchObject({ text: "70%" });

    fireEvent.press(screen.getByTestId("button-label-brightness-tab"));
    expect(screen.getByTestId("mock-brightness")).toBeTruthy();
    expect(screen.queryByTestId("mock-opacity")).toBeNull();
    expect(screen.getByTestId("button-label-adjustment-value").props.animatedProps)
      .toMatchObject({ text: "64%" });
  });

  it("places the theme toggle beside HEX and changes only the draft circle", () => {
    const screen = render(<ButtonLabelAppearanceDialog {...props} />);
    const previewAppearance = screen.getByTestId("focused-button-preview").props
      .animatedAppearance;
    const initialColor = previewAppearance.color.value;
    const circleColor = previewAppearance.circleColor;
    const row = screen.getByTestId("button-identifier-hex-theme-row");

    expect(row.props.className).toContain("flex-row");
    expect(screen.getByTestId("button-identifier-hex-input").props.className)
      .toContain("flex-1");
    expect(screen.getByTestId("button-identifier-background-theme-toggle").props)
      .toMatchObject({
        accessibilityLabel:
          "customize.buttonIdentifierBackgroundThemeChoice",
      });

    fireEvent.press(
      screen.getByTestId("button-identifier-background-theme-toggle"),
    );

    expect(circleColor.value).toBe("#666666");
    expect(previewAppearance.color.value).toBe(initialColor);
    expect(screen.getByTestId("focused-button-preview").props).toMatchObject({
      backgroundTheme: "dark",
    });
    expect(screen.getByTestId("focused-button-preview").props.animatedAppearance)
      .toBeDefined();
    fireEvent.press(screen.getByText("Confirm"));
    expect(props.onConfirm).toHaveBeenCalledWith({
      backgroundTheme: "dark",
      color: "#FFFFFF",
      opacity: 70,
    });
  });

  it("uses compact picker controls and a keyboard-safe announcement surface", () => {
    const screen = render(<ButtonLabelAppearanceDialog {...props} />);

    expect(screen.getByTestId("mock-color-picker").props).toMatchObject({
      sliderThickness: 12,
      thumbSize: 28,
    });
    expect(
      screen.getByTestId("button-label-appearance-keyboard-avoider"),
    ).toBeTruthy();
    expect(screen.getByTestId("button-label-adjustment-tabs").props.className)
      .toContain("mt-4");
    expect(screen.getByTestId("button-label-appearance-card").props.className)
      .toContain("border-slate-700");
    expect(screen.getByTestId("button-label-appearance-card").props.className)
      .toContain("bg-slate-950");
    expect(screen.getByTestId("button-label-appearance-cancel").props.className)
      .toContain("bg-white");
    expect(screen.getByText("Cancel").props.className).toContain("text-black");
  });

  it("uses a compact color wheel", () => {
    const screen = render(<ButtonLabelAppearanceDialog {...props} />);

    expect(screen.getByTestId("mock-panel").props.style).toMatchObject({
      height: 150,
      width: 150,
    });
  });

  it("uses one native modal and mounts one dialog preview at a time", () => {
    const screen = render(<ButtonLabelAppearanceDialog {...props} />);

    expect(screen.UNSAFE_getAllByType(Modal)).toHaveLength(1);
    expect(screen.getByTestId("focused-button-preview")).toBeTruthy();
    expect(screen.getByTestId("mock-color-picker")).toBeTruthy();
    expect(
      screen.queryByTestId("button-appearance-overall-preview-overlay"),
    ).toBeNull();

    fireEvent.press(screen.getByTestId("button-label-appearance-overall-preview"));
    expect(screen.UNSAFE_getAllByType(Modal)).toHaveLength(1);
    expect(screen.queryByTestId("focused-button-preview")).toBeNull();
    expect(screen.queryByTestId("mock-color-picker")).toBeNull();
    expect(screen.getByTestId("button-appearance-overall-preview-overlay")).toBeTruthy();
    expect(screen.getByTestId("overall-preview-panel").props).toMatchObject({
      animatedButtonIdentifierAppearance: expect.any(Object),
      buttonIdentifierBackgroundTheme: "light",
      image: props.image,
      interactive: false,
      previewUri: props.previewUri,
      preset: props.preset,
      transform: props.transform,
    });

    fireEvent.press(screen.getByTestId("button-appearance-overall-preview-backdrop"));
    expect(screen.queryByTestId("button-appearance-overall-preview-overlay")).toBeNull();
    expect(screen.getByTestId("focused-button-preview")).toBeTruthy();
    expect(screen.getByTestId("mock-color-picker")).toBeTruthy();
  });

  it("closes the overall preview before Android Back cancels the dialog", () => {
    const screen = render(<ButtonLabelAppearanceDialog {...props} />);

    fireEvent.press(screen.getByTestId("button-label-appearance-overall-preview"));

    act(() => screen.UNSAFE_getByType(Modal).props.onRequestClose());
    expect(
      screen.queryByTestId("button-appearance-overall-preview-overlay"),
    ).toBeNull();
    expect(screen.getByTestId("focused-button-preview")).toBeTruthy();
    expect(props.onCancel).not.toHaveBeenCalled();

    act(() => screen.UNSAFE_getByType(Modal).props.onRequestClose());
    expect(props.onCancel).toHaveBeenCalledTimes(1);
    expect(props.onConfirm).not.toHaveBeenCalled();
  });

  it("uses non-sticky Android keyboard padding while the backdrop stays full-screen", () => {
    const originalPlatform = Platform.OS;
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "android",
    });

    try {
      const screen = render(<ButtonLabelAppearanceDialog {...props} />);
      const keyboardAvoider = screen.UNSAFE_getByType(KeyboardAvoidingView);

      expect(keyboardAvoider.props.behavior).toBe("padding");
      expect(
        screen.getByTestId("button-label-appearance-scroll").props
          .automaticallyAdjustKeyboardInsets,
      ).toBeUndefined();
      const backdropAncestorIds: unknown[] = [];
      let ancestor = screen.getByTestId(
        "button-label-appearance-backdrop",
      ).parent;
      while (ancestor) {
        backdropAncestorIds.push(ancestor.props.testID);
        ancestor = ancestor.parent;
      }
      expect(backdropAncestorIds).toContain("button-label-appearance-root");
      expect(backdropAncestorIds).not.toContain(
        "button-label-appearance-keyboard-avoider",
      );
    } finally {
      Object.defineProperty(Platform, "OS", {
        configurable: true,
        value: originalPlatform,
      });
    }
  });

  it("cycles focus without changing the shared preset or transform", () => {
    const screen = render(<ButtonLabelAppearanceDialog {...props} />);
    const preview = screen.getByTestId("focused-button-preview");
    const initialTransform = preview.props.transform;
    const initialPreset = preview.props.preset;

    expect(preview.props.panel.id).toBe("button-1");
    fireEvent.press(screen.getByTestId("button-appearance-next"));
    expect(screen.getByTestId("focused-button-preview").props.panel.id).toBe(
      "button-2",
    );
    fireEvent.press(screen.getByTestId("button-appearance-next"));
    fireEvent.press(screen.getByTestId("button-appearance-next"));
    expect(screen.getByTestId("focused-button-preview").props.panel.id).toBe(
      "button-1",
    );
    fireEvent.press(screen.getByTestId("button-appearance-previous"));
    expect(screen.getByTestId("focused-button-preview").props.panel.id).toBe(
      "button-3",
    );
    expect(screen.getByTestId("focused-button-preview").props.transform).toBe(
      initialTransform,
    );
    expect(screen.getByTestId("focused-button-preview").props.preset).toBe(
      initialPreset,
    );
    expect(props.onConfirm).not.toHaveBeenCalled();
    expect(props.onCancel).not.toHaveBeenCalled();
  });

  it("always shows the latest valid draft appearance", () => {
    const screen = render(<ButtonLabelAppearanceDialog {...props} />);
    const preview = screen.getByTestId("focused-button-preview");

    expect(preview.props.animatedAppearance).toBeDefined();
    fireEvent.press(screen.getByTestId("button-identifier-background-theme-toggle"));
    expect(screen.getByTestId("focused-button-preview").props.animatedAppearance)
      .toBeDefined();
    expect(screen.getByTestId("focused-button-preview").props.backgroundTheme)
      .toBe("dark");
    fireEvent.press(screen.getByText("Confirm"));
    expect(props.onConfirm).toHaveBeenCalledWith({
      backgroundTheme: "dark",
      color: "#FFFFFF",
      opacity: 70,
    });
  });

  it("locks outer scrolling only while the picker owns touch input", () => {
    const screen = render(<ButtonLabelAppearanceDialog {...props} />);
    const scrollView = screen.getByTestId("button-label-appearance-scroll");
    const pickerRegion = screen.getByTestId("button-label-picker-gesture-region");
    const picker = screen.getByTestId("mock-color-picker");

    expect(scrollView.props.scrollEnabled).toBe(true);
    expect(picker.props.onChange).toBeDefined();
    expect(picker.props.onChangeJS).toBeUndefined();

    fireEvent(pickerRegion, "touchStart");
    expect(screen.getByTestId("button-label-appearance-scroll").props.scrollEnabled)
      .toBe(false);
    fireEvent(pickerRegion, "touchEnd");
    expect(screen.getByTestId("button-label-appearance-scroll").props.scrollEnabled)
      .toBe(true);

    fireEvent(pickerRegion, "touchStart");
    fireEvent(pickerRegion, "touchCancel");
    expect(screen.getByTestId("button-label-appearance-scroll").props.scrollEnabled)
      .toBe(true);

    fireEvent(pickerRegion, "touchStart");
    act(() => {
      picker.props.onCompleteJS({ rgba: "rgba(255,255,255,1)" });
    });
    expect(screen.getByTestId("button-label-appearance-scroll").props.scrollEnabled)
      .toBe(true);
  });

  it("keeps the defensive empty state cancellable and unconfirmable", () => {
    const screen = render(
      <ButtonLabelAppearanceDialog {...props} preset={emptyPreset} />,
    );

    expect(screen.getByText("Button preview unavailable.")).toBeTruthy();
    expect(screen.queryByTestId("focused-button-preview")).toBeNull();
    expect(screen.queryByTestId("button-appearance-new")).toBeNull();
    expect(screen.getByTestId("button-label-appearance-cancel").props.disabled)
      .not.toBe(true);
    expect(screen.getByTestId("button-label-appearance-confirm").props.className)
      .toContain("opacity-50");
    fireEvent.press(screen.getByTestId("button-label-appearance-confirm"));
    expect(props.onConfirm).not.toHaveBeenCalled();
  });
});
