import { act, renderHook } from "@testing-library/react-native";
import { s25PlusOneUi85Preset } from "@/features/quick-panel/model/preset";
import { loadButtonCustomizeSettings, saveButtonCustomizeSettings } from "@/features/quick-panel/store/storage";
import { useButtonCustomizeControls } from "@/features/quick-panel/customize/hooks/useButtonCustomizeControls";

describe("useButtonCustomizeControls", () => {
  it("restores saved slider and identifier settings and persists changes", () => {
    saveButtonCustomizeSettings({
      buttonIdentifierOpacity: 61,
      buttonPanelOpacity: 84,
      horizontalIdentifierPosition: 23,
      showButtonIdentifiers: false,
      verticalIdentifierPosition: 77,
    });

    const hook = renderHook(() => useButtonCustomizeControls(s25PlusOneUi85Preset));

    expect(hook.result.current).toMatchObject({
      buttonIdentifierOpacity: 61,
      buttonPanelOpacity: 84,
      horizontalIdentifierPosition: 23,
      showButtonIdentifiers: false,
      verticalIdentifierPosition: 77,
    });

    act(() => {
      hook.result.current.setButtonPanelOpacity(92);
      hook.result.current.setShowButtonIdentifiers(true);
    });

    expect(loadButtonCustomizeSettings()).toMatchObject({
      buttonPanelOpacity: 92,
      showButtonIdentifiers: true,
    });
  });
});
