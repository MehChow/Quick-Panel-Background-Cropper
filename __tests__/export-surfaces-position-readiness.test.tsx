import { ExportSurfaceHost } from "@/features/quick-panel/customize/components/ExportSurfaceHost";
import type { ExportSurfaceToken } from "@/features/quick-panel/customize/hooks/useSequentialExport";
import type { PanelDefinition } from "@/features/quick-panel/model/types";
import { act, render } from "@testing-library/react-native";
import { createRef } from "react";
import type { View } from "react-native";

let mockSurfaceProps: Record<string, unknown> | null = null;

jest.mock(
  "@/features/quick-panel/customize/components/ExportSurface",
  () => {
    const React = jest.requireActual("react");
    const { View: MockView } = jest.requireActual("react-native");
    return {
      ExportSurface: (props: Record<string, unknown>) => {
        mockSurfaceProps = props;
        return React.createElement(
          MockView,
          null,
          React.createElement(MockView, {
            onSignal: props.onImageLoad,
            testID: "current-image-ready",
          }),
          React.createElement(MockView, {
            onSignal: props.onIdentifierPositionReady,
            testID: "current-identifier-ready",
          }),
        );
      },
    };
  },
);

const panel: PanelDefinition = {
  id: "button-1",
  label: "Wi-Fi",
  fileName: "01-wi-fi.png",
  family: "button",
  rect: { x: 0, y: 0, width: 100, height: 50, radius: 0 },
  buttonIdentifier: {
    columnSpan: 2,
    rowSpan: 1,
    iconName: "wifi",
    referenceCellSize: 50,
  },
};
const token: ExportSurfaceToken = { panelId: "button-1", runId: 7 };

describe("ExportSurfaceHost readiness", () => {
  beforeEach(() => {
    mockSurfaceProps = null;
  });

  it("renders one active panel and echoes its token from ready callbacks", () => {
    const markIdentifierReady = jest.fn();
    const markImageReady = jest.fn();
    const screen = render(
      <ExportSurfaceHost
        activePanel={panel}
        activeToken={token}
        buttonIdentifierOpacity={0.7}
        buttonPanelOpacity={0.78}
        exportRef={createRef<View>()}
        identifierPositions={{ horizontal: 0.2, vertical: 0.8 }}
        image={{ height: 200, uri: "file:///original.png", width: 100 }}
        markIdentifierReady={markIdentifierReady}
        markImageReady={markImageReady}
        showButtonIdentifiers
        transform={{ scale: 1, x: 0, y: 0 }}
      />,
    );

    expect(screen.getAllByTestId("export-surface-button-1")).toHaveLength(1);
    expect(mockSurfaceProps).toMatchObject({
      identifierPositions: { horizontal: 0.2, vertical: 0.8 },
      panel,
      showButtonIdentifiers: true,
    });
    act(() => screen.getByTestId("current-image-ready").props.onSignal());
    act(() => screen.getByTestId("current-identifier-ready").props.onSignal());
    expect(markImageReady).toHaveBeenCalledWith(token);
    expect(markIdentifierReady).toHaveBeenCalledWith(token);
  });
});
