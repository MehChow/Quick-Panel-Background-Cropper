import { scheduleExportWork } from "@/features/quick-panel/customize/schedule-export-work";

describe("scheduleExportWork", () => {
  const originalRequestIdleCallback = globalThis.requestIdleCallback;
  const originalCancelIdleCallback = globalThis.cancelIdleCallback;
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;

  afterEach(() => {
    globalThis.requestIdleCallback = originalRequestIdleCallback;
    globalThis.cancelIdleCallback = originalCancelIdleCallback;
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
    jest.restoreAllMocks();
  });

  it("uses requestIdleCallback when available", () => {
    const callback = jest.fn();
    const cancelIdleCallback = jest.fn();
    const cancelAnimationFrame = jest.fn();

    globalThis.requestIdleCallback = jest.fn((work: IdleRequestCallback) => {
      work({ didTimeout: false, timeRemaining: () => 12 } as IdleDeadline);
      return 7;
    });
    globalThis.cancelIdleCallback = cancelIdleCallback;
    globalThis.requestAnimationFrame = jest.fn((work: FrameRequestCallback) => {
      work(16);
      return 9;
    });
    globalThis.cancelAnimationFrame = cancelAnimationFrame;

    const task = scheduleExportWork(callback);

    expect(globalThis.requestIdleCallback).toHaveBeenCalledTimes(1);
    expect(globalThis.requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);

    task.cancel();

    expect(cancelIdleCallback).toHaveBeenCalledWith(7);
  });

  it("falls back to requestAnimationFrame when requestIdleCallback is unavailable", () => {
    const callback = jest.fn();
    const cancelAnimationFrame = jest.fn();

    globalThis.requestIdleCallback = undefined as
      unknown as typeof globalThis.requestIdleCallback;
    globalThis.cancelIdleCallback = undefined as
      unknown as typeof globalThis.cancelIdleCallback;
    globalThis.requestAnimationFrame = jest.fn((work: FrameRequestCallback) => {
      work(16);
      return 11;
    });
    globalThis.cancelAnimationFrame = cancelAnimationFrame;

    const task = scheduleExportWork(callback);

    expect(globalThis.requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);

    task.cancel();

    expect(cancelAnimationFrame).toHaveBeenCalledWith(11);
  });
});
