import { StyleSheet } from "react-native";

export const buttonIdentifierStyles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  content: { flex: 1 },
  horizontal: {
    alignItems: "center",
    bottom: 0,
    flexDirection: "row",
    position: "absolute",
    top: 0,
  },
  label: { color: "#FFFFFF", fontWeight: "600" },
  iconBackground: {
    alignItems: "center",
    backgroundColor: "#666666",
    justifyContent: "center",
  },
  corner: {
    alignItems: "flex-start",
    flex: 1,
    justifyContent: "space-between",
  },
  cornerLabel: { alignSelf: "flex-end" },
  shadow: {
    textShadowColor: "rgba(0, 0, 0, 0.45)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 2,
  },
  vertical: { alignItems: "center", left: 0, position: "absolute" },
});
