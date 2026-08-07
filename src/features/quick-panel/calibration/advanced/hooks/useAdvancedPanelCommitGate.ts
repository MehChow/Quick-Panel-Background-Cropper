import { useEffect, useRef, useState } from "react";
import type { PanelId, PanelRect } from "../../../model/types";

export interface PanelGestureIdentity {
  panelId: PanelId;
  token: number;
}

export interface AdvancedPanelCommitGate {
  beginPanelGesture: (panelId: PanelId, token: number) => void;
  commitPanelGesture: (panelId: PanelId, token: number, rect: PanelRect) => void;
  isPanelGesturePending: boolean;
}

export function useAdvancedPanelCommitGate(
  activePanelId: PanelId | null,
  commitPanel: (id: PanelId, rect: PanelRect) => void,
): AdvancedPanelCommitGate {
  const activePanelIdRef = useRef(activePanelId);
  const commitPanelRef = useRef(commitPanel);
  const pendingRef = useRef<PanelGestureIdentity | null>(null);
  const [isPanelGesturePending, setIsPanelGesturePending] = useState(false);

  useEffect(() => {
    activePanelIdRef.current = activePanelId;
    commitPanelRef.current = commitPanel;
    if (pendingRef.current && pendingRef.current.panelId !== activePanelId) {
      pendingRef.current = null;
      setIsPanelGesturePending(false);
    }
  }, [activePanelId, commitPanel]);

  const beginPanelGesture = (panelId: PanelId, token: number) => {
    if (activePanelIdRef.current !== panelId) {
      return;
    }
    pendingRef.current = { panelId, token };
    setIsPanelGesturePending(true);
  };

  const commitPanelGesture = (panelId: PanelId, token: number, rect: PanelRect) => {
    const pending = pendingRef.current;
    if (
      !pending ||
      pending.panelId !== panelId ||
      pending.token !== token ||
      activePanelIdRef.current !== panelId
    ) {
      return;
    }
    pendingRef.current = null;
    setIsPanelGesturePending(false);
    commitPanelRef.current(panelId, rect);
  };

  return { beginPanelGesture, commitPanelGesture, isPanelGesturePending };
}
