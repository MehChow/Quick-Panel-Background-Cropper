import { Button } from "@/components/ani-ui/button";
import { Skeleton } from "@/components/ani-ui/skeleton";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface CustomizeActionsProps {
  canReset: boolean;
  isExporting: boolean;
  isProcessingImage: boolean;
  onExport: () => void;
  onPick: () => void;
  onReset: () => void;
}

export function CustomizeActions({
  canReset,
  isExporting,
  isProcessingImage,
  onExport,
  onPick,
  onReset,
}: CustomizeActionsProps) {
  const { t } = useTranslation();
  const isBusy = isExporting || isProcessingImage;

  return (
    <View className="mt-5 gap-3">
      <Button
        className="px-0 bg-white"
        disabled={isBusy}
        onPress={onPick}
        textClassName="font-semibold w-full text-black"
      >
        {isProcessingImage
          ? t("customize.optimizingImage")
          : t("customize.chooseAnotherImage")}
      </Button>
      <View className="flex-row gap-3 pb-4">
        <View className="basis-0 flex-1">
          <Button
            className="w-full bg-black px-0"
            disabled={isBusy || !canReset}
            onPress={onReset}
            textClassName="font-semibold text-white w-full"
          >
            {t("customize.resetPosition")}
          </Button>
        </View>
        <View className="basis-0 flex-1 overflow-hidden rounded-md">
          <Button
            className="w-full bg-green-200/90 px-0"
            loading={isExporting}
            disabled={isProcessingImage}
            onPress={onExport}
            textClassName="font-semibold text-green-900 w-full"
          >
            {isExporting
              ? ""
              : isProcessingImage
                ? t("customize.optimizingImage")
                : t("customize.exportPngs")}
          </Button>
          {isExporting ? (
            <Skeleton
              className="absolute inset-0 bg-white/30"
              pointerEvents="none"
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}
