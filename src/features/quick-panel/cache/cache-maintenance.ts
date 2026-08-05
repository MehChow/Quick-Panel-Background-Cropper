import { recordCrashlyticsError } from "@/lib/crashlytics";
import { Image } from "expo-image";
import { cleanupStaleAppOwnedCache } from "./cache-files";
import {
  loadLastImageDiskCacheClearAt,
  saveLastImageDiskCacheClearAt,
} from "../store/storage";

export const imageDiskCacheMaxAgeMs = 7 * 24 * 60 * 60 * 1000;

export function shouldClearImageDiskCache(
  now: number,
  lastClearedAt: number | null,
): boolean {
  return lastClearedAt === null
    || lastClearedAt > now
    || now - lastClearedAt >= imageDiskCacheMaxAgeMs;
}

export async function runColdStartCacheMaintenance(
  now = Date.now(),
): Promise<void> {
  cleanupStaleAppOwnedCache();

  if (!shouldClearImageDiskCache(now, loadLastImageDiskCacheClearAt())) {
    return;
  }

  try {
    if (await Image.clearDiskCache()) {
      saveLastImageDiskCacheClearAt(now);
    }
  } catch (error) {
    void recordCrashlyticsError(error, {
      action: "clear_image_disk_cache",
    });
  }
}
