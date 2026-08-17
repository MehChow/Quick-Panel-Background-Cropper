import type { RefObject } from "react";
import { PixelRatio, View } from "react-native";
import type { ButtonIdentifierPositions } from "../../model/button-identifier-layout";
import type { ButtonIdentifierContentMode } from "../../model/button-identifier-content";
import { exportSidePixels } from "../../model/panel-geometry";
import type {
  ImageTransform,
  PanelDefinition,
  PickedImage,
} from "../../model/types";
import type { ExportSurfaceToken } from "../hooks/useSequentialExport";
import { ExportSurface } from "./ExportSurface";
import type { ButtonIdentifierBackgroundTheme } from "../button-identifier-color";

interface ExportSurfaceHostProps {
  activePanel: PanelDefinition;
  activeToken: ExportSurfaceToken;
  buttonIdentifierBackgroundTheme?: ButtonIdentifierBackgroundTheme;
  buttonIdentifierColor?: string;
  buttonIdentifierOpacity: number;
  buttonPanelOpacity: number;
  exportRef: RefObject<View | null>;
  identifierPositions: ButtonIdentifierPositions;
  image: PickedImage;
  markIdentifierReady: (token: ExportSurfaceToken) => void;
  markImageReady: (token: ExportSurfaceToken) => void;
  buttonIdentifierContentMode: ButtonIdentifierContentMode;
  transform: ImageTransform;
}

export function ExportSurfaceHost({
  activePanel,
  activeToken,
  buttonIdentifierBackgroundTheme = "dark",
  buttonIdentifierColor = "#FFFFFF",
  buttonIdentifierOpacity,
  buttonPanelOpacity,
  exportRef,
  identifierPositions,
  image,
  markIdentifierReady,
  markImageReady,
  buttonIdentifierContentMode,
  transform,
}: ExportSurfaceHostProps) {
  const side = exportSidePixels / PixelRatio.get();

  return (
    <View
      ref={exportRef}
      collapsable={false}
      pointerEvents="none"
      testID={`export-surface-${activePanel.id}`}
      style={{
        height: side,
        left: -10000,
        position: "absolute",
        top: 0,
        width: side,
      }}
    >
      <ExportSurface
        buttonIdentifierBackgroundTheme={buttonIdentifierBackgroundTheme}
        buttonIdentifierColor={buttonIdentifierColor}
        buttonIdentifierOpacity={buttonIdentifierOpacity}
        buttonPanelOpacity={buttonPanelOpacity}
        image={image}
        identifierPositions={identifierPositions}
        key={`${activeToken.runId}:${activeToken.panelId}`}
        onIdentifierPositionReady={() => markIdentifierReady(activeToken)}
        onImageLoad={() => markImageReady(activeToken)}
        panel={activePanel}
        buttonIdentifierContentMode={buttonIdentifierContentMode}
        side={side}
        transform={transform}
      />
    </View>
  );
}
