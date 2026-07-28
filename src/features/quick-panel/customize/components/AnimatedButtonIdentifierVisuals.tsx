import { Text } from "@/components/ani-ui/text";
import { Lucide } from "@react-native-vector-icons/lucide";
import Animated, { useAnimatedProps, useAnimatedStyle } from "react-native-reanimated";
import type { ButtonIdentifierLayout } from "../../model/button-identifier-layout";
import type { ButtonIdentifierDefinition } from "../../model/types";
import type { AnimatedButtonIdentifierAppearance } from "./button-identifier-animated-appearance";
import { buttonIdentifierStyles as styles } from "./button-identifier-content";

const AnimatedLucide = Animated.createAnimatedComponent(Lucide);
const AnimatedText = Animated.createAnimatedComponent(Text);

interface AnimatedButtonIdentifierVisualsProps {
  appearance: AnimatedButtonIdentifierAppearance;
  identifier: ButtonIdentifierDefinition;
  label: string;
  layout: ButtonIdentifierLayout;
}

export function AnimatedButtonIdentifierVisuals({
  appearance,
  identifier,
  label,
  layout,
}: AnimatedButtonIdentifierVisualsProps) {
  const iconProps = useAnimatedProps(() => ({ color: appearance.color.get() }));
  const circleStyle = useAnimatedStyle(() => ({
    backgroundColor: appearance.circleColor.get(),
  }));
  const labelStyle = useAnimatedStyle(() => ({ color: appearance.color.get() }));
  return (
    <>
      <Animated.View
        style={[styles.iconBackground, circleStyle, {
          borderRadius: layout.iconBackgroundSize / 2,
          height: layout.iconBackgroundSize,
          width: layout.iconBackgroundSize,
        }]}
        testID="button-identifier-icon-background"
      >
        <AnimatedLucide
          animatedProps={iconProps}
          name={identifier.iconName}
          size={layout.iconSize}
          style={styles.shadow}
        />
      </Animated.View>
      {layout.showLabel ? (
        <AnimatedText
          adjustsFontSizeToFit
          allowFontScaling={false}
          ellipsizeMode="tail"
          minimumFontScale={layout.minimumFontScale}
          numberOfLines={1}
          style={[
            styles.label,
            styles.shadow,
            labelStyle,
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
        </AnimatedText>
      ) : null}
    </>
  );
}
