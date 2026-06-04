import { PixelRatio, View } from "react-native";
import { exportSidePixels } from "../../model/panel-geometry";
import type {
  ExportRefs,
  ImageTransform,
  PickedImage,
  QuickPanelPreset,
} from "../../model/types";
import { ExportSurface } from "./ExportSurface";

interface ExportSurfacesProps {
  image: PickedImage;
  transform: ImageTransform;
  preset: QuickPanelPreset;
  refs: ExportRefs;
}

export function ExportSurfaces({
  image,
  transform,
  preset,
  refs,
}: ExportSurfacesProps) {
  const side = exportSidePixels / PixelRatio.get();

  return (
    <View
      pointerEvents="none"
      style={{ left: -10000, position: "absolute", top: 0 }}
    >
      {preset.goodLockOrder.map((id) => (
        <ExportSurface
          key={id}
          ref={refs[id]}
          panel={preset.panels[id]}
          image={image}
          transform={transform}
          side={side}
        />
      ))}
    </View>
  );
}
