import { act, renderHook } from "@testing-library/react-native";
import { s25PlusOneUi85Preset } from "@/features/quick-panel/model/preset";
import {
  loadButtonCustomizeSettings,
  loadCombinedButtonImageIntensity,
  saveButtonCustomizeSettings,
  saveCombinedButtonImageIntensity,
} from "@/features/quick-panel/store/storage";
import { useButtonCustomizeControls } from "@/features/quick-panel/customize/hooks/useButtonCustomizeControls";

describe("useButtonCustomizeControls", () => {
  it("restores saved slider and identifier settings and persists changes", () => {
    saveButtonCustomizeSettings({
      buttonIdentifierBackgroundTheme: "light",
      buttonIdentifierColor: "#1A2B3C",
      buttonIdentifierOpacity: 61,
      buttonPanelOpacity: 84,
      horizontalIdentifierPosition: 23,
      buttonIdentifierContentMode: "icon",
      verticalIdentifierPosition: 77,
    });

    const hook = renderHook(() =>
      useButtonCustomizeControls(s25PlusOneUi85Preset, "buttons"),
    );

    expect(hook.result.current).toMatchObject({
      buttonIdentifierBackgroundTheme: "light",
      buttonIdentifierColor: "#1A2B3C",
      buttonIdentifierOpacity: 61,
      buttonPanelOpacity: 84,
      horizontalIdentifierPosition: 23,
      buttonIdentifierContentMode: "icon",
      verticalIdentifierPosition: 77,
    });

    act(() => {
      hook.result.current.setButtonIdentifierAppearance({
        backgroundTheme: "dark",
        color: "#336699",
        opacity: 142,
      });
    });

    expect(loadButtonCustomizeSettings()).toMatchObject({
      buttonIdentifierBackgroundTheme: "dark",
      buttonIdentifierColor: "#336699",
      buttonIdentifierOpacity: 100,
      buttonPanelOpacity: 84,
      buttonIdentifierContentMode: "icon",
    });
  });

  it("keeps combined image intensity isolated while sharing identifier settings", () => {
    saveButtonCustomizeSettings({
      buttonIdentifierBackgroundTheme: "dark",
      buttonIdentifierColor: "#FFFFFF",
      buttonIdentifierOpacity: 70,
      buttonPanelOpacity: 84,
      horizontalIdentifierPosition: 50,
      buttonIdentifierContentMode: "both",
      verticalIdentifierPosition: 50,
    });
    saveCombinedButtonImageIntensity(63);

    const buttons = renderHook(() =>
      useButtonCustomizeControls(s25PlusOneUi85Preset, "buttons"),
    );
    const combined = renderHook(() =>
      useButtonCustomizeControls(s25PlusOneUi85Preset, "combined"),
    );

    expect(buttons.result.current.buttonPanelOpacity).toBe(84);
    expect(combined.result.current.buttonPanelOpacity).toBe(63);

    act(() => {
      combined.result.current.setButtonPanelOpacity(42);
      combined.result.current.commitButtonPanelOpacity(42);
      combined.result.current.setButtonIdentifierContentMode("icon");
      combined.result.current.setHorizontalIdentifierPosition(23);
      combined.result.current.commitHorizontalIdentifierPosition(23);
      combined.result.current.setVerticalIdentifierPosition(77);
      combined.result.current.commitVerticalIdentifierPosition(77);
      combined.result.current.setButtonIdentifierAppearance({
        backgroundTheme: "light",
        color: "#1A2B3C",
        opacity: 61,
      });
    });

    expect(loadCombinedButtonImageIntensity()).toBe(42);
    expect(loadButtonCustomizeSettings()).toMatchObject({
      buttonPanelOpacity: 84,
      buttonIdentifierBackgroundTheme: "light",
      buttonIdentifierColor: "#1A2B3C",
      buttonIdentifierOpacity: 61,
      horizontalIdentifierPosition: 23,
      buttonIdentifierContentMode: "icon",
      verticalIdentifierPosition: 77,
    });

    const reloadedButtons = renderHook(() =>
      useButtonCustomizeControls(s25PlusOneUi85Preset, "buttons"),
    );
    expect(reloadedButtons.result.current).toMatchObject({
      buttonPanelOpacity: 84,
      buttonIdentifierBackgroundTheme: "light",
      buttonIdentifierColor: "#1A2B3C",
      buttonIdentifierOpacity: 61,
      horizontalIdentifierPosition: 23,
      buttonIdentifierContentMode: "icon",
      verticalIdentifierPosition: 77,
    });
  });

  it("defaults invalid combined image intensity to 78", () => {
    saveCombinedButtonImageIntensity(Number.NaN);

    const combined = renderHook(() =>
      useButtonCustomizeControls(s25PlusOneUi85Preset, "combined"),
    );

    expect(combined.result.current.buttonPanelOpacity).toBe(78);
  });

  it("keeps shared Button slider changes live and persists on completion", () => {
    saveButtonCustomizeSettings({
      buttonIdentifierBackgroundTheme: "dark",
      buttonIdentifierColor: "#FFFFFF",
      buttonIdentifierOpacity: 70,
      buttonPanelOpacity: 78,
      horizontalIdentifierPosition: 50,
      buttonIdentifierContentMode: "both",
      verticalIdentifierPosition: 50,
    });
    const hook = renderHook(() =>
      useButtonCustomizeControls(s25PlusOneUi85Preset, "buttons"),
    );

    act(() => hook.result.current.setHorizontalIdentifierPosition(23));
    expect(hook.result.current.horizontalIdentifierPosition).toBe(23);
    expect(loadButtonCustomizeSettings().horizontalIdentifierPosition).toBe(50);

    act(() => hook.result.current.commitHorizontalIdentifierPosition(23));
    expect(loadButtonCustomizeSettings().horizontalIdentifierPosition).toBe(23);
  });

  it("persists combined intensity only when its slider completes", () => {
    saveCombinedButtonImageIntensity(63);
    const hook = renderHook(() =>
      useButtonCustomizeControls(s25PlusOneUi85Preset, "combined"),
    );

    act(() => hook.result.current.setButtonPanelOpacity(42));
    expect(hook.result.current.buttonPanelOpacity).toBe(42);
    expect(loadCombinedButtonImageIntensity()).toBe(63);

    act(() => hook.result.current.commitButtonPanelOpacity(42));
    expect(loadCombinedButtonImageIntensity()).toBe(42);
  });
});
