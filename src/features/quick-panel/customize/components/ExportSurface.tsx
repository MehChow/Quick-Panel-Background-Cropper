import { Image } from "expo-image";
import { forwardRef } from "react";
import { View } from "react-native";
import { getExportSquareRect } from "../../model/panel-geometry";
import type {
  ImageTransform,
  PanelDefinition,
  PickedImage,
} from "../../model/types";

interface ExportSurfaceProps {
  panel: PanelDefinition;
  image: PickedImage;
  onReadyChange: (isReady: boolean) => void;
  transform: ImageTransform;
  side: number;
  presetId: string;
}

export const ExportSurface = forwardRef<View, ExportSurfaceProps>(
  function ExportSurface(
    { panel, image, onReadyChange, presetId, transform, side },
    ref,
  ) {
    const squareRect = getExportSquareRect(panel, presetId);
    const squareScale = side / squareRect.width;
    const imageScale = transform.scale * squareScale;

    return (
      <View
        ref={ref}
        collapsable={false}
        className="overflow-hidden bg-black"
        style={{ height: side, width: side }}
      >
        <Image
          cachePolicy="disk"
          onDisplay={() => onReadyChange(true)}
          onError={() => onReadyChange(false)}
          onLoadStart={() => onReadyChange(false)}
          source={{ uri: image.uri }}
          contentFit="fill"
          style={{
            height: image.height * imageScale,
            left: (transform.x - squareRect.x) * squareScale,
            position: "absolute",
            top: (transform.y - squareRect.y) * squareScale,
            width: image.width * imageScale,
          }}
        />
      </View>
    );
  },
);
