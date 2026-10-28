import { usePlayUpdate } from "@/features/quick-panel/home/play-update/usePlayUpdate";
import { acknowledgeReleaseAnnouncement, activeReleaseAnnouncementId } from "@/features/quick-panel/store/storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";

const mockCheck = jest.fn();
const mockStart = jest.fn();
const mockComplete = jest.fn();
let mockListener: ((state: { status: number; bytesDownloaded: number; totalBytes: number }) => void) | undefined;

jest.mock("expo-router", () => ({ usePathname: () => "/" }));
jest.mock("@/features/quick-panel/home/play-update/play-update-native", () => ({
  playUpdate: {
    check: (...args: unknown[]) => mockCheck(...args),
    start: (...args: unknown[]) => mockStart(...args),
    complete: (...args: unknown[]) => mockComplete(...args),
    addListener: (_: string, listener: typeof mockListener) => {
      mockListener = listener;
      return { remove: () => { mockListener = undefined; } };
    },
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  const store = (globalThis as typeof globalThis & { __mmkvStore: Map<string, string> }).__mmkvStore;
  store.clear();
  acknowledgeReleaseAnnouncement(activeReleaseAnnouncementId);
  mockCheck.mockResolvedValue({ available: true, versionCode: 42, status: 0 });
  mockComplete.mockResolvedValue(true);
});

it("remembers a declined version but offers a newer version", async () => {
  const first = renderHook(() => usePlayUpdate());
  await waitFor(() => expect(first.result.current.showOffer).toBe(true));
  act(() => first.result.current.decline());
  first.unmount();
  const second = renderHook(() => usePlayUpdate());
  await waitFor(() => expect(second.result.current.busy).toBe(false));
  expect(second.result.current.showOffer).toBe(false);
  second.unmount();
  mockCheck.mockResolvedValue({ available: true, versionCode: 43, status: 0 });
  const third = renderHook(() => usePlayUpdate());
  await waitFor(() => expect(third.result.current.showOffer).toBe(true));
});

it("blocks customization while downloading and completes when ready", async () => {
  const { result } = renderHook(() => usePlayUpdate());
  await waitFor(() => expect(result.current.showOffer).toBe(true));
  act(() => mockListener?.({ status: 2, bytesDownloaded: 50, totalBytes: 100 }));
  expect(result.current.busy).toBe(true);
  expect(result.current.progress).toBe(50);
  act(() => mockListener?.({ status: 11, bytesDownloaded: 100, totalBytes: 100 }));
  expect(mockComplete).toHaveBeenCalledTimes(1);
});

it("unblocks customization after a download failure", async () => {
  const { result } = renderHook(() => usePlayUpdate());
  await waitFor(() => expect(result.current.showOffer).toBe(true));
  act(() => mockListener?.({ status: 2, bytesDownloaded: 0, totalBytes: 100 }));
  act(() => mockListener?.({ status: 5, bytesDownloaded: 0, totalBytes: 100 }));
  expect(result.current.busy).toBe(false);
  expect(result.current.error).toBe(true);
});

it("records a cancellation of the Play confirmation", async () => {
  mockStart.mockResolvedValue("declined");
  const first = renderHook(() => usePlayUpdate());
  await waitFor(() => expect(first.result.current.showOffer).toBe(true));
  await act(async () => { await first.result.current.start(); });
  first.unmount();
  const second = renderHook(() => usePlayUpdate());
  await waitFor(() => expect(second.result.current.busy).toBe(false));
  expect(second.result.current.showOffer).toBe(false);
});

it("restores an active download after reopening", async () => {
  mockCheck.mockResolvedValue({ available: false, versionCode: 42, status: 2 });
  const { result } = renderHook(() => usePlayUpdate());
  await waitFor(() => expect(result.current.busy).toBe(true));
  expect(result.current.showOffer).toBe(false);
});
