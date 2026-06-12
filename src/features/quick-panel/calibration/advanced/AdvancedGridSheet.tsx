import { Button } from "@/components/ani-ui/button";
import { Text } from "@/components/ani-ui/text";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { useWindowDimensions, View } from "react-native";

interface Props {
  columns: number;
  onClose: () => void;
  onDecreaseColumns: () => void;
  onDecreaseRows: () => void;
  onIncreaseColumns: () => void;
  onIncreaseRows: () => void;
  rows: number;
}

export function AdvancedGridSheet({
  columns,
  onClose,
  onDecreaseColumns,
  onDecreaseRows,
  onIncreaseColumns,
  onIncreaseRows,
  rows,
}: Props) {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();

  return (
    <BottomSheet
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.6}
          pressBehavior="close"
        />
      )}
      backgroundStyle={{
        backgroundColor: "#18181b",
        borderColor: "#27272a",
        borderRadius: 32,
        borderWidth: 1,
      }}
      enableDynamicSizing
      enablePanDownToClose
      handleIndicatorStyle={{
        backgroundColor: "#52525b",
        height: 6,
        width: 48,
      }}
      index={0}
      maxDynamicContentSize={height * 0.6}
      onClose={onClose}
    >
      <BottomSheetView
        style={{
          paddingBottom: 32,
          paddingHorizontal: 20,
          paddingTop: 8,
        }}
      >
        <View className="gap-6">
          <View className="gap-2">
            <Text className="text-lg font-semibold text-white">
              {t("advancedCalibration.gridSheetTitle")}
            </Text>
            <Text className="text-sm leading-6 text-zinc-300">
              {t("advancedCalibration.gridSheetSubtitle")}
            </Text>
          </View>
          <View className="flex-row gap-3">
            <GridCounter
              label={t("advancedCalibration.columns")}
              onDecrease={onDecreaseColumns}
              onIncrease={onIncreaseColumns}
              value={columns}
            />
            <GridCounter
              label={t("advancedCalibration.rows")}
              onDecrease={onDecreaseRows}
              onIncrease={onIncreaseRows}
              value={rows}
            />
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

interface GridCounterProps {
  label: string;
  onDecrease: () => void;
  onIncrease: () => void;
  value: number;
}

function GridCounter({
  label,
  onDecrease,
  onIncrease,
  value,
}: GridCounterProps) {
  return (
    <View className="flex-1 rounded-2xl border border-white/10 bg-zinc-800 p-4">
      <Text className="text-xs font-semibold uppercase tracking-[1px] text-zinc-400">
        {label}
      </Text>
      <View className="mt-3 flex-row items-center gap-2">
        <Button
          className="h-11 flex-1 rounded-xl bg-zinc-700"
          onPress={onDecrease}
          textClassName="text-lg font-semibold text-white"
        >
          -
        </Button>
        <Text className="min-w-8 text-center text-lg font-semibold text-white">
          {value}
        </Text>
        <Button
          className="h-11 flex-1 rounded-xl bg-zinc-700"
          onPress={onIncrease}
          textClassName="text-lg font-semibold text-white"
        >
          +
        </Button>
      </View>
    </View>
  );
}
