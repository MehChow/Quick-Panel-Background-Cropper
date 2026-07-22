import { Text } from "@/components/ani-ui/text";
import { Lucide } from "@react-native-vector-icons/lucide";
import { View } from "react-native";
import type { ButtonIdentifierLayout } from "../../model/button-identifier-layout";
import type { ButtonIdentifierDefinition } from "../../model/types";
import { buttonIdentifierStyles as styles } from "./button-identifier-content";

interface ButtonIdentifierVisualsProps {
  identifier: ButtonIdentifierDefinition;
  label: string;
  layout: ButtonIdentifierLayout;
}

export function ButtonIdentifierVisuals({
  identifier,
  label,
  layout,
}: ButtonIdentifierVisualsProps) {
  return (
    <>
      <View
        testID="button-identifier-icon-background"
        style={[
          styles.iconBackground,
          {
            borderRadius: layout.iconBackgroundSize / 2,
            height: layout.iconBackgroundSize,
            width: layout.iconBackgroundSize,
          },
        ]}
      >
        <Lucide
          color="#FFFFFF"
          name={identifier.iconName}
          size={layout.iconSize}
          style={styles.shadow}
        />
      </View>
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
            {
              fontSize: layout.fontSize,
              lineHeight: layout.fontSize * 1.2,
              maxWidth: layout.maxLabelWidth,
            },
            layout.kind === "corner" && [
              styles.cornerLabel,
              {
                marginBottom: layout.cornerLabelInset,
                marginRight: layout.cornerLabelInset,
              },
            ],
          ]}
        >
          {label}
        </Text>
      ) : null}
    </>
  );
}
