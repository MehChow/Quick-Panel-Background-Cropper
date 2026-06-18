interface ScheduledExportTask {
  cancel: () => void;
}

export function scheduleExportWork(work: () => void): ScheduledExportTask {
  if (typeof globalThis.requestIdleCallback === "function") {
    const id = globalThis.requestIdleCallback(() => {
      requestAnimationFrame(() => work());
    });
    return {
      cancel: () => {
        globalThis.cancelIdleCallback?.(id);
      },
    };
  }

  const id = requestAnimationFrame(() => work());
  return {
    cancel: () => {
      cancelAnimationFrame(id);
    },
  };
}
