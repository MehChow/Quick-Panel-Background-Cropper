import { Lucide } from "@react-native-vector-icons/lucide";
import { View } from "react-native";
import type { PanelId } from "../types";

interface PanelOverlayProps {
  panelId: PanelId;
}

export function PanelOverlay({ panelId }: PanelOverlayProps) {
  if (panelId === "buttonBox") {
    return (
      <View
        className="absolute inset-0 justify-evenly"
        style={{ paddingHorizontal: "8.2%" }}
      >
        {[0, 1].map((row) => (
          <View key={row} className="flex-row justify-between">
            {[0, 1, 2, 3].map((column) => (
              <View
                key={column}
                className="rounded-full bg-black/30"
                style={{ aspectRatio: 1, width: "14.7%" }}
              />
            ))}
          </View>
        ))}
      </View>
    );
  }

  if (panelId === "mediaPlayer") {
    return (
      <View className="absolute inset-0 flex-row items-center justify-between px-5">
        <Lucide color="rgba(255,255,255,0.92)" name="play" size={24} />
        <View className="h-5 w-16 rounded-full bg-black/30" />
      </View>
    );
  }

  return (
    <View className="absolute inset-0 flex-row items-center px-5">
      <View
        className={`h-8 rounded-full bg-white/70 ${panelId === "brightness" ? "w-40" : "w-24"}`}
      />
      <View className="ml-auto h-10 w-10 items-center justify-center rounded-full bg-white/75">
        <Lucide
          color="rgba(0,0,0,0.7)"
          name={panelId === "brightness" ? "moon" : "volume-2"}
          size={24}
        />
      </View>
    </View>
  );
}
