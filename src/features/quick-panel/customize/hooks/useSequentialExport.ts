import { recordCrashlyticsError } from "@/lib/crashlytics";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import type { View } from "react-native";
import { useShallow } from "zustand/react/shallow";
import { getButtonIdentifierLayoutKind } from "../../model/button-identifier-layout";
import { translate } from "../../model/i18n";
import type {
  GeneratedExport,
  PanelDefinition,
  PanelId,
  PickedImage,
  QuickPanelPreset,
} from "../../model/types";
import { useQuickPanelStore } from "../../store/quick-panel-store";
import { createExportSurfaceReadiness } from "../export-surface-readiness";
import { scheduleExportWork } from "../schedule-export-work";
import {
  capturePanelExport,
  cleanupCapturedExports,
  saveCapturedExports,
} from "../services/export-files";

export interface ExportSurfaceToken {
  panelId: PanelId;
  runId: number;
}

export interface SequentialExportState {
  activePanel: PanelDefinition | null;
  activeToken: ExportSurfaceToken | null;
  exportRef: React.RefObject<View | null>;
  markIdentifierReady: (token: ExportSurfaceToken) => void;
  markImageReady: (token: ExportSurfaceToken) => void;
  startExport: () => void;
}

interface UseSequentialExportParams {
  image: PickedImage | null;
  isProcessingImage: boolean;
  preset: QuickPanelPreset;
  showButtonIdentifiers: boolean;
}

interface ActiveSurface {
  captureScheduled: boolean;
  index: number;
  panel: PanelDefinition;
  readiness: ReturnType<typeof createExportSurfaceReadiness>;
  token: ExportSurfaceToken;
}

function tokensMatch(
  first: ExportSurfaceToken,
  second: ExportSurfaceToken,
) {
  return first.runId === second.runId && first.panelId === second.panelId;
}

export function useSequentialExport({
  image,
  isProcessingImage,
  preset,
  showButtonIdentifiers,
}: UseSequentialExportParams): SequentialExportState {
  const router = useRouter();
  const { failExport, finishExport, markExportStarted } = useQuickPanelStore(
    useShallow((state) => ({
      failExport: state.failExport,
      finishExport: state.finishExport,
      markExportStarted: state.startExport,
    })),
  );
  const [activeSurface, setActiveSurface] = useState<ActiveSurface | null>(null);
  const exportRef = useRef<View | null>(null);
  const activeRef = useRef<ActiveSurface | null>(null);
  const capturedRef = useRef<GeneratedExport[]>([]);
  const currentRunRef = useRef(0);
  const isRunningRef = useRef(false);
  const nextFrameRef = useRef<number | null>(null);
  const runIdRef = useRef(0);
  const scheduledTaskRef = useRef<ReturnType<typeof scheduleExportWork> | null>(null);

  const clearScheduledWork = () => {
    scheduledTaskRef.current?.cancel();
    scheduledTaskRef.current = null;
    if (nextFrameRef.current !== null) {
      cancelAnimationFrame(nextFrameRef.current);
      nextFrameRef.current = null;
    }
  };

  const failRun = async (error: unknown, runId: number) => {
    if (currentRunRef.current !== runId) {
      return;
    }
    currentRunRef.current = 0;
    isRunningRef.current = false;
    clearScheduledWork();
    activeRef.current = null;
    setActiveSurface(null);
    const captured = capturedRef.current;
    capturedRef.current = [];
    try {
      await cleanupCapturedExports(captured);
    } finally {
      void recordCrashlyticsError(error, {
        action: "export_images",
        presetId: preset.id,
      });
      failExport(
        error instanceof Error
          ? error.message
          : translate("errors.unableToExport"),
      );
    }
  };

  const finishRun = async (runId: number) => {
    const captured = [...capturedRef.current];
    try {
      await saveCapturedExports(captured);
      if (currentRunRef.current !== runId) {
        return;
      }
      currentRunRef.current = 0;
      isRunningRef.current = false;
      capturedRef.current = [];
      finishExport(captured);
      router.replace("/result");
    } catch (error) {
      await failRun(error, runId);
    }
  };

  const mountPanel = (runId: number, index: number) => {
    if (currentRunRef.current !== runId) {
      return;
    }
    const panelId = preset.goodLockOrder[index];
    const panel = panelId ? preset.panels[panelId] : null;
    if (!panel) {
      void finishRun(runId);
      return;
    }
    const identifier = panel.buttonIdentifier;
    const waitsForIdentifier = Boolean(
      showButtonIdentifiers
      && identifier
      && getButtonIdentifierLayoutKind(identifier) === "horizontal",
    );
    const token = { panelId: panel.id, runId };
    const nextSurface: ActiveSurface = {
      captureScheduled: false,
      index,
      panel,
      readiness: createExportSurfaceReadiness(waitsForIdentifier),
      token,
    };
    activeRef.current = nextSurface;
    setActiveSurface(nextSurface);
  };

  const captureActivePanel = async (surface: ActiveSurface) => {
    const runId = surface.token.runId;
    try {
      const ref = exportRef.current;
      if (!ref) {
        throw new Error(translate("errors.exportSurfaceMissing", {
          panel: surface.panel.label,
        }));
      }
      const captured = await capturePanelExport(ref, surface.panel);
      if (currentRunRef.current !== runId) {
        await cleanupCapturedExports([captured]);
        return;
      }
      capturedRef.current.push(captured);
      activeRef.current = null;
      setActiveSurface(null);

      if (surface.index === preset.goodLockOrder.length - 1) {
        await finishRun(runId);
        return;
      }
      nextFrameRef.current = requestAnimationFrame(() => {
        nextFrameRef.current = null;
        mountPanel(runId, surface.index + 1);
      });
    } catch (error) {
      await failRun(error, runId);
    }
  };

  const scheduleCaptureIfReady = (
    token: ExportSurfaceToken,
    isReady: boolean,
  ) => {
    const active = activeRef.current;
    if (
      !isReady
      || !active
      || active.captureScheduled
      || !tokensMatch(active.token, token)
    ) {
      return;
    }
    active.captureScheduled = true;
    scheduledTaskRef.current = scheduleExportWork(() => {
      scheduledTaskRef.current = null;
      void captureActivePanel(active);
    });
  };

  const markIdentifierReady = (token: ExportSurfaceToken) => {
    const active = activeRef.current;
    if (!active || !tokensMatch(active.token, token)) {
      return;
    }
    scheduleCaptureIfReady(token, active.readiness.markIdentifierReady());
  };

  const markImageReady = (token: ExportSurfaceToken) => {
    const active = activeRef.current;
    if (!active || !tokensMatch(active.token, token)) {
      return;
    }
    scheduleCaptureIfReady(token, active.readiness.markImageLoaded());
  };

  const startExport = () => {
    if (!image || isProcessingImage || isRunningRef.current) {
      return;
    }
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    currentRunRef.current = runId;
    isRunningRef.current = true;
    capturedRef.current = [];
    markExportStarted();

    void ExpoImage.prefetch(image.uri, "memory-disk")
      .then((didPrefetch) => {
        if (!didPrefetch) {
          void recordCrashlyticsError(new Error("Export image prefetch failed"), {
            action: "prefetch_export_image",
            presetId: preset.id,
          });
        }
      })
      .catch((error) => {
        void recordCrashlyticsError(error, {
          action: "prefetch_export_image",
          presetId: preset.id,
        });
      })
      .finally(() => mountPanel(runId, 0));
  };

  useEffect(() => () => {
    currentRunRef.current = 0;
    isRunningRef.current = false;
    clearScheduledWork();
    const captured = capturedRef.current;
    capturedRef.current = [];
    if (captured.length > 0) {
      void cleanupCapturedExports(captured);
    }
  }, []);

  return {
    activePanel: activeSurface?.panel ?? null,
    activeToken: activeSurface?.token ?? null,
    exportRef,
    markIdentifierReady,
    markImageReady,
    startExport,
  };
}
