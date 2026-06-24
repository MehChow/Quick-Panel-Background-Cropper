import React from "react";
import { render, screen } from "@testing-library/react-native";
import * as ReactNative from "react-native";
import { CalibrationHelpSheet } from "@/features/quick-panel/shared/CalibrationHelpSheet";
import { AdvancedGridSheet } from "@/features/quick-panel/calibration/advanced/AdvancedGridSheet";

const mockBottomSheet = jest.fn();
const mockBottomSheetScrollView = jest.fn();
const mockBottomSheetView = jest.fn();

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: { resolvedLanguage: "en" },
    t: (key: string) => key,
  }),
}));

jest.mock("@gorhom/bottom-sheet", () => {
  const React = jest.requireActual("react");
  const { View } = jest.requireActual("react-native");

  function BottomSheet(props: { children?: React.ReactNode }) {
    mockBottomSheet(props);
    return <>{props.children}</>;
  }

  return {
    __esModule: true,
    default: BottomSheet,
    BottomSheetBackdrop: () => null,
    BottomSheetFlatList: () => null,
    BottomSheetScrollView: ({ children }: { children?: React.ReactNode }) => {
      mockBottomSheetScrollView();
      return <View>{children}</View>;
    },
    BottomSheetView: ({ children }: { children?: React.ReactNode }) => {
      mockBottomSheetView();
      return <View>{children}</View>;
    },
  };
});

jest.mock("@/features/quick-panel/shared/CalibrationOuterTips", () => ({
  CalibrationOuterTips: () => {
    const React = jest.requireActual("react");
    const { Text } = jest.requireActual("react-native");
    return React.createElement(Text, null, "outer-tips");
  },
}));

jest.mock("@/features/quick-panel/shared/CalibrationOuterExample", () => ({
  CalibrationOuterExample: () => {
    const React = jest.requireActual("react");
    const { Text } = jest.requireActual("react-native");
    return React.createElement(Text, null, "outer-example");
  },
}));

jest.mock("@/features/quick-panel/shared/HelpSheetZoomImage", () => ({
  HelpSheetZoomImage: () => null,
}));

jest.mock("@/data/images", () => ({
  images: {
    calibrateGridCountExample1: 1,
    calibrateGridCountExample2: 2,
  },
}));

describe("help sheet sizing", () => {
  beforeEach(() => {
    mockBottomSheet.mockClear();
    mockBottomSheetScrollView.mockClear();
    mockBottomSheetView.mockClear();
    jest.spyOn(ReactNative, "useWindowDimensions").mockReturnValue({
      fontScale: 1,
      height: 915,
      scale: 1,
      width: 412,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("uses content-fit sizing for the advanced calibration help sheet", () => {
    render(<CalibrationHelpSheet onClose={jest.fn()} />);

    expect(mockBottomSheet).toHaveBeenCalledTimes(1);
    const props = mockBottomSheet.mock.calls[0]?.[0];

    expect(props?.enableDynamicSizing).toBe(true);
    expect(props?.maxDynamicContentSize).toBe(720);
    expect(props?.snapPoints).toBeUndefined();
    expect(mockBottomSheetScrollView).toHaveBeenCalledTimes(1);
    expect(mockBottomSheetView).not.toHaveBeenCalled();
    expect(screen.getByText("outer-tips")).toBeTruthy();
    expect(screen.getByText("outer-example")).toBeTruthy();
  });

  it("uses content-fit sizing for the row and column help sheet", () => {
    render(<AdvancedGridSheet onClose={jest.fn()} />);

    expect(mockBottomSheet).toHaveBeenCalledTimes(1);
    const props = mockBottomSheet.mock.calls[0]?.[0];

    expect(props?.enableDynamicSizing).toBe(true);
    expect(props?.maxDynamicContentSize).toBe(720);
    expect(props?.snapPoints).toBeUndefined();
  });
});
