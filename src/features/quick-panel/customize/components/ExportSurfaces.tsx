import { useEffect, useRef } from "react";
import { PixelRatio, View } from "react-native";
import { createExportSurfaceReadiness } from "../export-surface-readiness";
import { exportSidePixels } from "../../model/panel-geometry";
import type {
  ExportRefs,
  ImageTransform,
  PickedImage,
  QuickPanelPreset,
} from "../../model/types";
import { ExportSurface } from "./ExportSurface";

interface ExportSurfacesProps {
  buttonPanelOpacity: number;
  image: PickedImage;
  transform: ImageTransform;
  preset: QuickPanelPreset;
  refs: ExportRefs;
  loadToken: number;
  onReady: () => void;
}

export function ExportSurfaces({
  buttonPanelOpacity,
  image,
  transform,
  preset,
  refs,
  loadToken,
  onReady,
}: ExportSurfacesProps) {
  const side = exportSidePixels / PixelRatio.get();
  const readinessRef = useRef(
    createExportSurfaceReadiness(preset.goodLockOrder),
  );
  const isReadyReportedRef = useRef(false);

  useEffect(() => {
    readinessRef.current = createExportSurfaceReadiness(preset.goodLockOrder);
    isReadyReportedRef.current = false;
  }, [image.uri, loadToken, preset.goodLockOrder, preset.id]);

  const handleImageLoad = (id: (typeof preset.goodLockOrder)[number]) => {
    if (isReadyReportedRef.current) {
      return;
    }
    if (readinessRef.current.markLoaded(id)) {
      isReadyReportedRef.current = true;
      onReady();
    }
  };

  return (
    <View
      pointerEvents="none"
      style={{ left: -10000, position: "absolute", top: 0 }}
    >
      {preset.goodLockOrder.map((id) => (
        <ExportSurface
          buttonPanelOpacity={buttonPanelOpacity}
          key={id}
          ref={refs[id]}
          panel={preset.panels[id]}
          image={image}
          onImageLoad={() => handleImageLoad(id)}
          transform={transform}
          side={side}
        />
      ))}
    </View>
  );
}
