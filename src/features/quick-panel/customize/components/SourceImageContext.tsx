import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import Svg, { Path, Rect } from "react-native-svg";
import type {
  ImageTransform,
  PanelRect,
  PickedImage,
  QuickPanelPreset,
} from "../../model/types";
import { getPanelImageTransform } from "../panel-image-transform";
import {
  getSourceContextDimPath,
  getSourceContextImageOpacity,
  getSourceContextPanelRects,
} from "../source-image-context-geometry";

interface SourceImageContextProps {
  buttonPanelOpacity: number;
  frame: PanelRect;
  image: PickedImage;
  layoutScale: number;
  preset: QuickPanelPreset;
  previewScale: SharedValue<number>;
  previewUri: string;
  transform: SharedValue<ImageTransform>;
  visible: boolean;
}

export function SourceImageContext(props: SourceImageContextProps) {
  const panelRects = getSourceContextPanelRects(
    props.preset,
    props.layoutScale,
  );
  const boundaryInset = 1 / props.layoutScale;
  const viewBox = [
    props.frame.x,
    props.frame.y,
    props.frame.width,
    props.frame.height,
  ].join(" ");
  const imageStyle = useAnimatedStyle(() => {
    const placement = getPanelImageTransform({
      panelX: props.frame.x,
      panelY: props.frame.y,
      previewScale: props.previewScale.get(),
      transform: props.transform.get(),
    });
    return {
      transform: [
        { translateX: placement.translateX },
        { translateY: placement.translateY },
        { scale: placement.scale },
      ],
    };
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg
        opacity={props.visible ? 1 : 0}
        style={StyleSheet.absoluteFill}
        testID="source-context-backings"
        viewBox={viewBox}
      >
        {panelRects.map((rect, index) => (
          <Rect
            fill="rgba(255,255,255,0.1)"
            height={rect.height}
            key={props.preset.visualOrder[index]}
            rx={rect.radius}
            testID="source-context-panel-backing"
            width={rect.width}
            x={rect.x}
            y={rect.y}
          />
        ))}
      </Svg>
      <Animated.View
        style={[
          {
            height: props.image.height,
            left: 0,
            position: "absolute",
            top: 0,
            transformOrigin: [0, 0, 0],
            width: props.image.width,
          },
          imageStyle,
        ]}
      >
        <Image
          cachePolicy="memory-disk"
          contentFit="fill"
          source={{ uri: props.previewUri }}
          style={{
            height: props.image.height,
            opacity: getSourceContextImageOpacity(
              props.preset,
              props.buttonPanelOpacity,
            ) * Number(props.visible),
            width: props.image.width,
          }}
        />
      </Animated.View>
      <Svg
        opacity={props.visible ? 1 : 0}
        style={StyleSheet.absoluteFill}
        testID="source-context-dim"
        viewBox={viewBox}
      >
        <Path
          d={getSourceContextDimPath(props.frame, panelRects)}
          fill="rgba(0,0,0,0.5)"
          fillRule="evenodd"
          testID="source-context-dim-path"
        />
      </Svg>
      <Svg style={StyleSheet.absoluteFill} viewBox={viewBox}>
        <Rect
          fill="none"
          height={props.frame.height - boundaryInset * 2}
          stroke="#f5d6aa"
          strokeOpacity={props.visible ? 0.55 : 0}
          strokeWidth={2 / props.layoutScale}
          testID="source-context-movement-boundary"
          width={props.frame.width - boundaryInset * 2}
          x={props.frame.x + boundaryInset}
          y={props.frame.y + boundaryInset}
        />
      </Svg>
    </View>
  );
}
