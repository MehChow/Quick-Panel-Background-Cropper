import { useState } from "react";
import { openGoodLock } from "./good-lock-link";

interface GoodLockLinkState {
  hasGoodLockLinkError: boolean;
  isOpeningGoodLock: boolean;
  openGoodLockApp: () => Promise<void>;
}

export function useGoodLockLink(): GoodLockLinkState {
  const [hasGoodLockLinkError, setHasGoodLockLinkError] = useState(false);
  const [isOpeningGoodLock, setIsOpeningGoodLock] = useState(false);

  const openGoodLockApp = async () => {
    setHasGoodLockLinkError(false);
    setIsOpeningGoodLock(true);

    const didOpenGoodLock = await openGoodLock();

    setIsOpeningGoodLock(false);
    setHasGoodLockLinkError(!didOpenGoodLock);
  };

  return {
    hasGoodLockLinkError,
    isOpeningGoodLock,
    openGoodLockApp,
  };
}
