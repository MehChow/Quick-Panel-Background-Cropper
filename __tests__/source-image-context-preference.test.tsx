import { act, renderHook } from "@testing-library/react-native";
import { useShowSourceImageContext } from "@/features/quick-panel/store/storage";

interface MmkvTestGlobal {
  __mmkvStore?: Map<string, boolean | string>;
}

describe("source image context preference", () => {
  it("defaults to visible and persists an explicit eye choice", () => {
    const first = renderHook(() => useShowSourceImageContext());
    expect(first.result.current[0]).toBe(true);

    act(() => first.result.current[1](false));
    expect(first.result.current[0]).toBe(false);
    first.unmount();

    const second = renderHook(() => useShowSourceImageContext());
    expect(second.result.current[0]).toBe(false);
  });

  it("falls back to visible for an invalid stored value", () => {
    const store = (globalThis as typeof globalThis & MmkvTestGlobal).__mmkvStore;
    store?.set("quick-panel.show-source-image-context", "invalid");

    const hook = renderHook(() => useShowSourceImageContext());
    expect(hook.result.current[0]).toBe(true);
  });
});
