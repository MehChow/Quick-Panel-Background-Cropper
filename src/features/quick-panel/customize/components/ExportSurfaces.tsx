import { useLayoutEffect, useRef } from "react";
import { PixelRatio, View } from "react-native";
import { createExportSurfaceReadiness } from "../export-surface-readiness";
import {
  getButtonIdentifierOrientation,
  type ButtonIdentifierPositions,
} from "../../model/button-identifier-layout";
import { exportSidePixels } from "../../model/panel-geometry";
import type {
  ExportRefs,
  ImageTransform,
  PickedImage,
  QuickPanelPreset,
} from "../../model/types";
import { ExportSurface } from "./ExportSurface";

interface ExportSurfacesProps {
  buttonIdentifierOpacity: number;
  buttonPanelOpacity: number;
  image: PickedImage;
  identifierPositions: ButtonIdentifierPositions;
  transform: ImageTransform;
  preset: QuickPanelPreset;
  refs: ExportRefs;
  loadToken: number;
  onReady: () => void;
  showButtonIdentifiers: boolean;
}

function getMeasuredIdentifierIds(
  order: QuickPanelPreset["goodLockOrder"],
  panels: QuickPanelPreset["panels"],
  areIdentifiersVisible: boolean,
) {
  if (!areIdentifiersVisible) return [];
  return order.filter((id) => {
    const panel = panels[id];
    return panel?.family === "button"
      && panel.buttonIdentifier
      && getButtonIdentifierOrientation(panel.buttonIdentifier) === "horizontal";
  });
}

export function ExportSurfaces({
  buttonIdentifierOpacity,
  buttonPanelOpacity,
  image,
  identifierPositions,
  transform,
  preset,
  refs,
  loadToken,
  onReady,
  showButtonIdentifiers,
}: ExportSurfacesProps) {
  const side = exportSidePixels / PixelRatio.get();
  const readinessRef = useRef(
    createExportSurfaceReadiness(
      preset.goodLockOrder,
      getMeasuredIdentifierIds(
        preset.goodLockOrder,
        preset.panels,
        showButtonIdentifiers,
      ),
    ),
  );
  const isReadyReportedRef = useRef(false);

  useLayoutEffect(() => {
    readinessRef.current = createExportSurfaceReadiness(
      preset.goodLockOrder,
      getMeasuredIdentifierIds(
        preset.goodLockOrder,
        preset.panels,
        showButtonIdentifiers,
      ),
    );
    isReadyReportedRef.current = false;
  }, [
    identifierPositions.horizontal,
    identifierPositions.vertical,
    image.uri,
    loadToken,
    preset.goodLockOrder,
    preset.id,
    preset.panels,
    showButtonIdentifiers,
  ]);

  const reportReady = (isReady: boolean) => {
    if (!isReady || isReadyReportedRef.current) return;
    isReadyReportedRef.current = true;
    onReady();
  };

  const handleImageLoad = (id: (typeof preset.goodLockOrder)[number]) => {
    reportReady(readinessRef.current.markImageLoaded(id));
  };

  const handleIdentifierReady = (id: (typeof preset.goodLockOrder)[number]) => {
    reportReady(readinessRef.current.markIdentifierReady(id));
  };

  return (
    <View
      pointerEvents="none"
      style={{ left: -10000, position: "absolute", top: 0 }}
    >
      {preset.goodLockOrder.map((id) => (
        <ExportSurface
          buttonIdentifierOpacity={buttonIdentifierOpacity}
          buttonPanelOpacity={buttonPanelOpacity}
          key={id}
          ref={refs[id]}
          panel={preset.panels[id]}
          image={image}
          identifierPositions={identifierPositions}
          onImageLoad={() => handleImageLoad(id)}
          onIdentifierPositionReady={() => handleIdentifierReady(id)}
          transform={transform}
          side={side}
          showButtonIdentifiers={showButtonIdentifiers}
        />
      ))}
    </View>
  );
}
