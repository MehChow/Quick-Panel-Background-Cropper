import { AdvancedPanelSelection } from "../components/AdvancedPanelSelection";
import { ButtonPanelSelection } from "../components/ButtonPanelSelection";
import type {
  AdvancedCombinedDraft,
  ControlPanelId,
  ButtonCalibrationItem,
} from "../../../model/types";

interface Props {
  draft: AdvancedCombinedDraft;
  isButtonSelectionPhase: boolean;
  isControlSelectionPhase: boolean;
  onButtonsChange: (buttons: ButtonCalibrationItem[]) => void;
  onControlsChange: (controls: ControlPanelId[]) => void;
}

export function CombinedSelectionStep({
  draft,
  isButtonSelectionPhase,
  isControlSelectionPhase,
  onButtonsChange,
  onControlsChange,
}: Props) {
  if (!draft.screenshot || !draft.outerRect) {
    return null;
  }
  if (isButtonSelectionPhase) {
    return (
      <ButtonPanelSelection
        buttons={draft.buttons}
        outerRect={draft.outerRect}
        screenshot={draft.screenshot}
        onButtonsChange={onButtonsChange}
      />
    );
  }
  if (isControlSelectionPhase) {
    return (
      <AdvancedPanelSelection
        enabledPanels={draft.enabledControls}
        outerRect={draft.outerRect}
        screenshot={draft.screenshot}
        onEnabledPanelsChange={onControlsChange}
      />
    );
  }
  return null;
}
