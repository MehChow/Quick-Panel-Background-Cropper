import { useRouter } from "expo-router";
import { useShallow } from "zustand/react/shallow";
import type { ButtonIdentifierContentMode } from "../../model/button-identifier-content";
import type { PickedImage, QuickPanelPreset } from "../../model/types";
import { useQuickPanelStore } from "../../store/quick-panel-store";
import {
  useSequentialExportLifecycle,
  type SequentialExportState,
} from "./useSequentialExportLifecycle";

export type {
  ExportSurfaceToken,
  SequentialExportState,
} from "./useSequentialExportLifecycle";

interface UseSequentialExportParams {
  image: PickedImage | null;
  isProcessingImage: boolean;
  preset: QuickPanelPreset;
  buttonIdentifierContentMode: ButtonIdentifierContentMode;
}

export function useSequentialExport(
  params: UseSequentialExportParams,
): SequentialExportState {
  const router = useRouter();
  const { failExport, finishExport, markExportStarted } = useQuickPanelStore(
    useShallow((state) => ({
      failExport: state.failExport,
      finishExport: state.finishExport,
      markExportStarted: state.startExport,
    })),
  );

  return useSequentialExportLifecycle({
    ...params,
    onStarted: markExportStarted,
    onFinished: (files) => {
      finishExport(files);
      router.replace("/result");
    },
    onFailed: failExport,
  });
}
