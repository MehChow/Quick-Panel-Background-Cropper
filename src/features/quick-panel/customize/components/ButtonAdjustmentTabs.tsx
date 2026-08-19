import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ani-ui/tabs";
import { useTranslation } from "react-i18next";
import type { ButtonIdentifierContentMode } from "../../model/button-identifier-content";
import {
  ButtonAdjustmentSlider,
  type ButtonAdjustment,
} from "./ButtonAdjustmentSlider";

interface ButtonAdjustmentTabsProps {
  buttonPanelOpacity: number;
  hasHorizontalButtons: boolean;
  hasVerticalButtons: boolean;
  horizontalIdentifierPosition: number;
  onButtonPanelOpacityChange: (value: number) => void;
  onButtonPanelOpacityCommit: (value: number) => void;
  onHorizontalIdentifierPositionChange: (value: number) => void;
  onHorizontalIdentifierPositionCommit: (value: number) => void;
  onVerticalIdentifierPositionChange: (value: number) => void;
  onVerticalIdentifierPositionCommit: (value: number) => void;
  buttonIdentifierContentMode: ButtonIdentifierContentMode;
  verticalIdentifierPosition: number;
}

export function ButtonAdjustmentTabs(props: ButtonAdjustmentTabsProps) {
  const { t } = useTranslation();
  const identifierDisabled = props.buttonIdentifierContentMode === "none";
  const adjustments: ButtonAdjustment[] = [
    {
      accessibilityLabel: t("customize.buttonPanelOpacity"),
      disabled: false,
      label: t("customize.buttonPanelOpacity"),
      onSlidingComplete: props.onButtonPanelOpacityCommit,
      onValueChange: props.onButtonPanelOpacityChange,
      sliderTestID: "button-panel-opacity-slider",
      tabLabel: t("customize.buttonAdjustmentImageTab"),
      tabTestID: "button-adjustment-image-tab",
      value: props.buttonPanelOpacity,
      valueKey: "image",
    },
  ];

  if (props.hasHorizontalButtons) {
    adjustments.push({
      accessibilityLabel: t("customize.horizontalIdentifierPosition"),
      disabled: identifierDisabled,
      label: t("customize.horizontalIdentifierPosition"),
      onSlidingComplete: props.onHorizontalIdentifierPositionCommit,
      onValueChange: props.onHorizontalIdentifierPositionChange,
      sliderTestID: "horizontal-identifier-position-slider",
      tabLabel: t("customize.buttonAdjustmentHorizontalTab"),
      tabTestID: "button-adjustment-horizontal-tab",
      value: props.horizontalIdentifierPosition,
      valueKey: "horizontal",
    });
  }
  if (props.hasVerticalButtons) {
    adjustments.push({
      accessibilityLabel: t("customize.verticalIdentifierPosition"),
      disabled: identifierDisabled,
      label: t("customize.verticalIdentifierPosition"),
      onSlidingComplete: props.onVerticalIdentifierPositionCommit,
      onValueChange: props.onVerticalIdentifierPositionChange,
      sliderTestID: "vertical-identifier-position-slider",
      tabLabel: t("customize.buttonAdjustmentVerticalTab"),
      tabTestID: "button-adjustment-vertical-tab",
      value: props.verticalIdentifierPosition,
      valueKey: "vertical",
    });
  }

  return (
    <Tabs
      defaultValue="image"
      key={identifierDisabled ? "identifiers-off" : "identifiers-on"}
      size="sm"
    >
      <TabsList className="w-full border border-white/15 bg-zinc-800/95">
        {adjustments.map((adjustment) => (
          <TabsTrigger
            accessibilityLabel={adjustment.accessibilityLabel}
            activeClassName="bg-black"
            activeTextClassName="text-white"
            disabled={adjustment.disabled}
            key={adjustment.valueKey}
            testID={adjustment.tabTestID}
            textClassName="text-white"
            value={adjustment.valueKey}
          >
            {adjustment.tabLabel}
          </TabsTrigger>
        ))}
      </TabsList>
      {adjustments.map((adjustment) => (
        <TabsContent
          className="mt-3"
          key={adjustment.valueKey}
          value={adjustment.valueKey}
        >
          <ButtonAdjustmentSlider adjustment={adjustment} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
