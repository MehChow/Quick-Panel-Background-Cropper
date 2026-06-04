import { useState } from "react";
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

    setIsOpeningGoodLock(false);
    setIsGoodLockDialogOpen(!didOpenGoodLock);
  };

  const openSamsungStore = async () => {
    setIsOpeningSamsungStore(true);
    await openGoodLockInSamsungStore();
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
