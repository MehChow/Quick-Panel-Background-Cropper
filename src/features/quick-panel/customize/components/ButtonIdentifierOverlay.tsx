import { Text } from "@/components/ani-ui/text";
import { Lucide } from "@react-native-vector-icons/lucide";
import { StyleSheet, View } from "react-native";
import {
  getButtonIdentifierLayout,
  type ButtonIdentifierBounds,
  type ButtonIdentifierRenderTarget,
} from "../../model/button-identifier-layout";
import type { ButtonIdentifierDefinition } from "../../model/types";

interface ButtonIdentifierOverlayProps {
  bounds: ButtonIdentifierBounds;
  identifier: ButtonIdentifierDefinition;
  label: string;
  opacity: number;
  target: ButtonIdentifierRenderTarget;
}

export function ButtonIdentifierOverlay({
  bounds,
  identifier,
  label,
  opacity,
  target,
}: ButtonIdentifierOverlayProps) {
  const layout = getButtonIdentifierLayout(bounds, identifier, target);
  const contentStyle = layout.alignment === "center"
    ? styles.center
    : layout.alignment === "top-center"
      ? [styles.topCenter, { paddingTop: layout.inset }]
      : [
          styles.leftCenter,
          { gap: layout.gap, paddingHorizontal: layout.inset },
        ];

  return (
    <View
      pointerEvents="none"
      testID="button-identifier-overlay"
      style={{
        height: bounds.height,
        left: bounds.x,
        opacity,
        position: "absolute",
        top: bounds.y,
        width: bounds.width,
      }}
    >
      <View
        testID="button-identifier-content"
        style={[styles.content, contentStyle]}
      >
        <Lucide
          color="#FFFFFF"
          name={identifier.iconName}
          size={layout.iconSize}
          style={styles.shadow}
        />
        {layout.showLabel ? (
          <Text
            adjustsFontSizeToFit
            allowFontScaling={false}
            ellipsizeMode="tail"
            minimumFontScale={layout.minimumFontScale}
            numberOfLines={1}
            testID="button-identifier-label"
            style={[
              styles.label,
              styles.shadow,
              { fontSize: layout.fontSize, maxWidth: layout.maxLabelWidth },
            ]}
          >
            {label}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  content: { flex: 1 },
  label: { color: "#FFFFFF", fontWeight: "600" },
  leftCenter: { alignItems: "center", flexDirection: "row" },
  shadow: {
    textShadowColor: "rgba(0, 0, 0, 0.45)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 2,
  },
  topCenter: { alignItems: "center", justifyContent: "flex-start" },
});
