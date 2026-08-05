import {
  recordCrashlyticsError,
  type CrashlyticsContext,
} from "@/lib/crashlytics";
import { Directory, File, Paths } from "expo-file-system";

const staleDirectoryNames = [
  "ImagePicker",
  "ImageManipulator",
  "qpbc-exports",
] as const;
const legacyExportPattern = /^\d{2}-[a-z0-9-]+\.png$/;

function getCachePrefix() {
  return Paths.cache.uri.endsWith("/")
    ? Paths.cache.uri
    : `${Paths.cache.uri}/`;
}

function recordCleanupError(error: unknown, context: CrashlyticsContext) {
  void recordCrashlyticsError(error, context);
}

export function deleteOwnedCacheUris(
  uris: readonly string[],
  context: CrashlyticsContext,
): void {
  const cachePrefix = getCachePrefix();
  for (const uri of new Set(uris)) {
    if (!uri.startsWith(cachePrefix)) {
      continue;
    }

    try {
      new File(uri).delete();
    } catch (error) {
      recordCleanupError(error, context);
    }
  }
}

export function getExportCacheFile(fileName: string): File {
  const directory = new Directory(Paths.cache, "qpbc-exports");
  directory.create({ idempotent: true });
  return new File(directory, fileName);
}

export function cleanupStaleAppOwnedCache(): void {
  const cacheDirectory = new Directory(Paths.cache);
  try {
    for (const entry of cacheDirectory.list()) {
      const isStaleDirectory =
        entry instanceof Directory && staleDirectoryNames.includes(entry.name as typeof staleDirectoryNames[number]);
      const isLegacyExport =
        entry instanceof File && legacyExportPattern.test(entry.name);
      if (!isStaleDirectory && !isLegacyExport) {
        continue;
      }

      try {
        entry.delete();
      } catch (error) {
        recordCleanupError(error, {
          action: "cleanup_stale_app_owned_cache",
        });
      }
    }
  } catch (error) {
    recordCleanupError(error, {
      action: "cleanup_stale_app_owned_cache",
    });
  }
}
