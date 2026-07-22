import { Image } from "expo-image";
import { forwardRef } from "react";
import { StyleSheet, View } from "react-native";
import { getExportSquareRect } from "../../model/panel-geometry";
import {
  getButtonExportBounds,
  type ButtonIdentifierPositions,
} from "../../model/button-identifier-layout";
import type {
  ImageTransform,
  PanelDefinition,
  PickedImage,
} from "../../model/types";
import { ButtonIdentifierOverlay } from "./ButtonIdentifierOverlay";

interface ExportSurfaceProps {
  buttonIdentifierOpacity: number;
  buttonPanelOpacity: number;
  panel: PanelDefinition;
  image: PickedImage;
  identifierPositions: ButtonIdentifierPositions;
  transform: ImageTransform;
  side: number;
  onIdentifierPositionReady: () => void;
  onImageLoad: () => void;
  showButtonIdentifiers: boolean;
}

export const ExportSurface = forwardRef<View, ExportSurfaceProps>(
  function ExportSurface(
    {
      buttonIdentifierOpacity,
      buttonPanelOpacity,
      panel,
      image,
      identifierPositions,
      transform,
      side,
      onIdentifierPositionReady,
      onImageLoad,
      showButtonIdentifiers,
    },
    ref,
  ) {
    const squareRect = getExportSquareRect(panel);
    const squareScale = side / squareRect.width;
    const imageScale = transform.scale * squareScale;

    return (
      <View
        ref={ref}
        collapsable={false}
        className="overflow-hidden"
        style={{ backgroundColor: "transparent", height: side, width: side }}
      >
        <Image
          cachePolicy="memory-disk"
          source={{ uri: image.uri }}
          contentFit="fill"
          onLoad={onImageLoad}
          style={[
            styles.fill,
            {
              height: image.height * imageScale,
              left: (transform.x - squareRect.x) * squareScale,
              opacity: panel.family === "button" ? buttonPanelOpacity : 1,
              top: (transform.y - squareRect.y) * squareScale,
              width: image.width * imageScale,
            },
          ]}
        />
        {showButtonIdentifiers && panel.family === "button" && panel.buttonIdentifier ? (
          <ButtonIdentifierOverlay
            bounds={getButtonExportBounds(panel, side)}
            identifier={panel.buttonIdentifier}
            label={panel.label}
            onPositionReady={onIdentifierPositionReady}
            opacity={buttonIdentifierOpacity}
            positions={identifierPositions}
            referenceCellSize={panel.buttonIdentifier.referenceCellSize * squareScale}
          />
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  fill: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
});
