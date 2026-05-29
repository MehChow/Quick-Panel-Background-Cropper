import { PixelRatio, View } from "react-native";
import { s25PlusOneUi85Preset } from "../preset";
import { exportSidePixels } from "../transform";
import type { ExportRefs, ImageTransform, PickedImage } from "../types";
import { ExportSurface } from "./ExportSurface";

interface ExportSurfacesProps {
  image: PickedImage;
  transform: ImageTransform;
  refs: ExportRefs;
}

export function ExportSurfaces({
  image,
  transform,
  refs,
}: ExportSurfacesProps) {
  const side = exportSidePixels / PixelRatio.get();

  return (
    <View
      pointerEvents="none"
      style={{ left: -10000, position: "absolute", top: 0 }}
    >
      {s25PlusOneUi85Preset.goodLockOrder.map((id) => (
        <ExportSurface
          key={id}
          ref={refs[id]}
          panel={s25PlusOneUi85Preset.panels[id]}
          image={image}
          transform={transform}
          side={side}
        />
      ))}
    </View>
  );
}
