import {
  cleanupStaleAppOwnedCache,
  deleteOwnedCacheUris,
  getExportCacheFile,
} from "@/features/quick-panel/cache/cache-files";

const mockDelete = jest.fn();
const mockDirectoryCreate = jest.fn();
const mockDirectoryEntries = new Map<string, unknown[]>();

jest.mock("@/lib/crashlytics", () => ({
  recordCrashlyticsError: jest.fn(),
}));

jest.mock("expo-file-system", () => ({
  Directory: class MockDirectory {
    uri: string;
    name: string;
    exists = true;

    constructor(...parts: Array<string | { uri: string }>) {
      this.uri = parts
        .map((part) => typeof part === "string" ? part : part.uri)
        .join("/")
        .replace("file:///cache//", "file:///cache/");
      this.name = this.uri.split("/").pop() ?? "";
    }

    create(options?: unknown) {
      mockDirectoryCreate(options);
    }

    delete() {
      mockDelete(this.uri);
    }

    list() {
      return mockDirectoryEntries.get(this.uri) ?? [];
    }
  },
  File: class MockFile {
    uri: string;
    name: string;

    constructor(...parts: Array<string | { uri: string }>) {
      this.uri = parts
        .map((part) => typeof part === "string" ? part : part.uri)
        .join("/")
        .replace("file:///cache//", "file:///cache/");
      this.name = this.uri.split("/").pop() ?? "";
    }

    delete() {
      mockDelete(this.uri);
    }
  },
  Paths: { cache: { uri: "file:///cache" } },
}));

const { Directory: MockDirectory, File: MockFile } = jest.requireMock(
  "expo-file-system",
) as {
  Directory: new (...parts: Array<string | { uri: string }>) => { uri: string; name: string; delete: () => void };
  File: new (...parts: Array<string | { uri: string }>) => { uri: string; name: string; delete: () => void };
};

describe("cache file ownership", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDirectoryEntries.clear();
  });

  it("deletes each owned cache URI once and ignores non-cache URIs", () => {
    deleteOwnedCacheUris([
      "file:///cache/ImagePicker/source.jpg",
      "file:///cache/ImagePicker/source.jpg",
      "file:///photos/original.jpg",
    ], { action: "cleanup_test" });

    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledWith(
      "file:///cache/ImagePicker/source.jpg",
    );
  });

  it("creates and returns a file inside qpbc-exports", () => {
    expect(getExportCacheFile("01-button-box.png").uri).toBe(
      "file:///cache/qpbc-exports/01-button-box.png",
    );
    expect(mockDirectoryCreate).toHaveBeenCalledWith(
      { idempotent: true },
    );
  });

  it("removes only known stale app-owned entries", () => {
    const rootFiles = [
      new MockFile("file:///cache/01-button-box.png"),
      new MockFile("file:///cache/not-owned.txt"),
    ];
    const staleDirectories = [
      new MockDirectory("file:///cache/ImagePicker"),
      new MockDirectory("file:///cache/ImageManipulator"),
      new MockDirectory("file:///cache/qpbc-exports"),
      new MockDirectory("file:///cache/image_manager_disk_cache"),
      new MockDirectory("file:///cache/WebView"),
    ];
    mockDirectoryEntries.set("file:///cache", [...rootFiles, ...staleDirectories]);

    cleanupStaleAppOwnedCache();

    expect(mockDelete).toHaveBeenCalledWith("file:///cache/01-button-box.png");
    expect(mockDelete).toHaveBeenCalledWith("file:///cache/ImagePicker");
    expect(mockDelete).toHaveBeenCalledWith("file:///cache/ImageManipulator");
    expect(mockDelete).toHaveBeenCalledWith("file:///cache/qpbc-exports");
    expect(mockDelete).not.toHaveBeenCalledWith("file:///cache/not-owned.txt");
    expect(mockDelete).not.toHaveBeenCalledWith("file:///cache/image_manager_disk_cache");
    expect(mockDelete).not.toHaveBeenCalledWith("file:///cache/WebView");
    expect(mockDelete).not.toHaveBeenCalledWith("file:///cache");
  });
});
