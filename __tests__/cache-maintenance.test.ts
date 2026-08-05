import { Image } from "expo-image";
import {
  imageDiskCacheMaxAgeMs,
  runColdStartCacheMaintenance,
  shouldClearImageDiskCache,
} from "@/features/quick-panel/cache/cache-maintenance";

const mockCleanupStaleAppOwnedCache = jest.fn();
const mockLoadLastImageDiskCacheClearAt = jest.fn();
const mockSaveLastImageDiskCacheClearAt = jest.fn();
const mockRecordCrashlyticsError = jest.fn();

jest.mock("@/features/quick-panel/cache/cache-files", () => ({
  cleanupStaleAppOwnedCache: () => mockCleanupStaleAppOwnedCache(),
}));

jest.mock("@/features/quick-panel/store/storage", () => ({
  loadLastImageDiskCacheClearAt: () => mockLoadLastImageDiskCacheClearAt(),
  saveLastImageDiskCacheClearAt: (timestamp: number) =>
    mockSaveLastImageDiskCacheClearAt(timestamp),
}));

jest.mock("@/lib/crashlytics", () => ({
  recordCrashlyticsError: (...args: unknown[]) => mockRecordCrashlyticsError(...args),
}));

jest.mock("expo-image", () => ({
  Image: { clearDiskCache: jest.fn() },
}));

describe("cold-start cache maintenance", () => {
  const now = 1_000_000_000;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadLastImageDiskCacheClearAt.mockReturnValue(null);
    (Image.clearDiskCache as jest.Mock).mockResolvedValue(true);
  });

  it("clears when no previous successful clear exists or the interval elapsed", () => {
    expect(shouldClearImageDiskCache(now, null)).toBe(true);
    expect(shouldClearImageDiskCache(now, now - imageDiskCacheMaxAgeMs + 1)).toBe(false);
    expect(shouldClearImageDiskCache(now, now - imageDiskCacheMaxAgeMs)).toBe(true);
    expect(shouldClearImageDiskCache(now, now + 1)).toBe(true);
  });

  it("recovers stale app-owned files on every run and records successful clears", async () => {
    mockLoadLastImageDiskCacheClearAt.mockReturnValue(now - imageDiskCacheMaxAgeMs);

    await runColdStartCacheMaintenance(now);

    expect(mockCleanupStaleAppOwnedCache).toHaveBeenCalledTimes(1);
    expect(Image.clearDiskCache).toHaveBeenCalledTimes(1);
    expect(mockSaveLastImageDiskCacheClearAt).toHaveBeenCalledWith(now);
  });

  it("does not touch Glide before the interval elapses", async () => {
    mockLoadLastImageDiskCacheClearAt.mockReturnValue(now - 1);

    await runColdStartCacheMaintenance(now);

    expect(mockCleanupStaleAppOwnedCache).toHaveBeenCalledTimes(1);
    expect(Image.clearDiskCache).not.toHaveBeenCalled();
    expect(mockSaveLastImageDiskCacheClearAt).not.toHaveBeenCalled();
  });

  it("does not save a timestamp when Glide reports an unsuccessful clear", async () => {
    (Image.clearDiskCache as jest.Mock).mockResolvedValue(false);

    await runColdStartCacheMaintenance(now);

    expect(mockSaveLastImageDiskCacheClearAt).not.toHaveBeenCalled();
  });

  it("swallows and records a Glide cleanup failure", async () => {
    const error = new Error("disk cache unavailable");
    (Image.clearDiskCache as jest.Mock).mockRejectedValue(error);

    await expect(runColdStartCacheMaintenance(now)).resolves.toBeUndefined();
    expect(mockRecordCrashlyticsError).toHaveBeenCalledWith(error, {
      action: "clear_image_disk_cache",
    });
  });
});
