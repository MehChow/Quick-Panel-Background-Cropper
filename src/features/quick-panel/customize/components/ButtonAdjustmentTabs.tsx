import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ani-ui/tabs";
import { useTranslation } from "react-i18next";
import {
  ButtonAdjustmentSlider,
  type ButtonAdjustment,
} from "./ButtonAdjustmentSlider";

interface ButtonAdjustmentTabsProps {
  buttonIdentifierOpacity: number;
  buttonPanelOpacity: number;
  hasHorizontalButtons: boolean;
  hasVerticalButtons: boolean;
  horizontalIdentifierPosition: number;
  onButtonIdentifierOpacityChange: (value: number) => void;
  onButtonPanelOpacityChange: (value: number) => void;
  onHorizontalIdentifierPositionChange: (value: number) => void;
  onVerticalIdentifierPositionChange: (value: number) => void;
  showButtonIdentifiers: boolean;
  verticalIdentifierPosition: number;
}

export function ButtonAdjustmentTabs(props: ButtonAdjustmentTabsProps) {
  const { t } = useTranslation();
  const identifierDisabled = !props.showButtonIdentifiers;
  const adjustments: ButtonAdjustment[] = [
    {
      accessibilityLabel: t("customize.buttonPanelOpacity"),
      disabled: false,
      label: t("customize.buttonPanelOpacity"),
      onValueChange: props.onButtonPanelOpacityChange,
      sliderTestID: "button-panel-opacity-slider",
      tabLabel: t("customize.buttonAdjustmentImageTab"),
      tabTestID: "button-adjustment-image-tab",
      value: props.buttonPanelOpacity,
      valueKey: "image",
    },
    {
      accessibilityLabel: t("customize.buttonIdentifierOpacity"),
      disabled: identifierDisabled,
      label: t("customize.buttonIdentifierOpacity"),
      onValueChange: props.onButtonIdentifierOpacityChange,
      sliderTestID: "button-identifier-opacity-slider",
      tabLabel: t("customize.buttonAdjustmentIdentifierTab"),
      tabTestID: "button-adjustment-identifier-tab",
      value: props.buttonIdentifierOpacity,
      valueKey: "identifier",
    },
  ];

  if (props.hasHorizontalButtons) {
    adjustments.push({
      accessibilityLabel: t("customize.horizontalIdentifierPosition"),
      disabled: identifierDisabled,
      label: t("customize.horizontalIdentifierPosition"),
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
      key={props.showButtonIdentifiers ? "identifiers-on" : "identifiers-off"}
      size="sm"
    >
      <TabsList className="w-full border border-white/15 bg-zinc-800/95">
        {adjustments.map((adjustment) => (
          <TabsTrigger
            accessibilityLabel={adjustment.accessibilityLabel}
            disabled={adjustment.disabled}
            key={adjustment.valueKey}
            testID={adjustment.tabTestID}
            textClassName="text-zinc-200"
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
