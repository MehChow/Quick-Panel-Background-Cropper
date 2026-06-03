import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";

export function AppGradientBackground() {
  return (
    <LinearGradient
      colors={["#261E1E", "#341F3A"]}
      style={StyleSheet.absoluteFill}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
  );
}
