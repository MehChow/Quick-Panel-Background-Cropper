import { useState } from "react";
import {
  logCrashlytics,
  recordCrashlyticsError,
} from "@/lib/crashlytics";
import {
  openGoodLock,
  openGoodLockInSamsungStore,
} from "./services/good-lock-link";

interface GoodLockLinkState {
  isGoodLockDialogOpen: boolean;
  isOpeningGoodLock: boolean;
  isOpeningSamsungStore: boolean;
  closeGoodLockDialog: () => void;
  openGoodLockApp: () => Promise<void>;
  openSamsungStore: () => Promise<void>;
}

export function useGoodLockLink(): GoodLockLinkState {
  const [isGoodLockDialogOpen, setIsGoodLockDialogOpen] = useState(false);
  const [isOpeningGoodLock, setIsOpeningGoodLock] = useState(false);
  const [isOpeningSamsungStore, setIsOpeningSamsungStore] = useState(false);

  const closeGoodLockDialog = () => {
    setIsGoodLockDialogOpen(false);
  };

  const openGoodLockApp = async () => {
    setIsGoodLockDialogOpen(false);
    setIsOpeningGoodLock(true);

    const didOpenGoodLock = await openGoodLock();
    if (!didOpenGoodLock) {
      logCrashlytics("Good Lock app unavailable");
    }

    setIsOpeningGoodLock(false);
    setIsGoodLockDialogOpen(!didOpenGoodLock);
  };

  const openSamsungStore = async () => {
    setIsOpeningSamsungStore(true);
    try {
      await openGoodLockInSamsungStore();
    } catch (error) {
      void recordCrashlyticsError(error, { action: "open_samsung_store" });
    }
    setIsOpeningSamsungStore(false);
    setIsGoodLockDialogOpen(false);
  };

  return {
    closeGoodLockDialog,
    isGoodLockDialogOpen,
    isOpeningGoodLock,
    isOpeningSamsungStore,
    openGoodLockApp,
    openSamsungStore,
  };
}
