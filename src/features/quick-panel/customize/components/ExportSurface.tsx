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
  transform: ImageTransform;
  side: number;
  onImageLoad: () => void;
}

export const ExportSurface = forwardRef<View, ExportSurfaceProps>(
  function ExportSurface({ panel, image, transform, side, onImageLoad }, ref) {
    const squareRect = getExportSquareRect(panel);
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
          source={{ uri: image.uri }}
          contentFit="fill"
          onLoad={onImageLoad}
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
