import type { LucideIconName } from "@react-native-vector-icons/lucide";

export interface BuiltInButtonLabel {
  id: string;
  iconName: LucideIconName;
  label: string;
  translationKey: string;
}

export type ButtonLabelTranslator = (key: string) => string;

const pinnedLabels = [
  "Wi-Fi",
  "Bluetooth",
  "Mobile Data",
  "Flight Mode",
  "Mobile Hotspot",
  "NFC",
  "Location",
  "Quick Share",
  "Auto-Rotate",
  "Eye Comfort Shield",
  "Extra Dim",
  "Always On Display",
];

const otherLabels = [
  "Smart View",
  "Do Not Disturb",
  "Dolby Atmos",
  "Live Caption",
  "Flashlight",
  "Power Saving",
  "Screen Recorder",
  "Take Screenshot",
  "QR Code Scanner",
  "Performance Profile",
  "Wireless PowerShare",
  "Camera Access",
  "Microphone Access",
  "Secure Folder",
  "Modes",
  "SmartThings",
  "Link to Windows",
  "Wireless DeX",
];

const builtInButtonIconNames: Record<string, LucideIconName> = {
  "wi-fi": "wifi",
  bluetooth: "bluetooth",
  "auto-rotate": "rotate-cw",
  flashlight: "flashlight",
  "flight-mode": "plane",
  location: "map-pin",
  "mobile-data": "arrow-down-up",
  "mobile-hotspot": "radio-tower",
  "power-saving": "leaf",
  "smart-view": "monitor-up",
  "eye-comfort-shield": "eye",
  "do-not-disturb": "circle-minus",
  "link-to-windows": "monitor-smartphone",
  "quick-share": "share-2",
  nfc: "nfc",
  "wireless-powershare": "battery-charging",
  "screen-recorder": "video",
  "take-screenshot": "scan-line",
  modes: "chart-pie",
  "dolby-atmos": "audio-lines",
  "extra-dim": "sun-dim",
  "secure-folder": "folder-lock",
  "always-on-display": "clock-3",
  "qr-code-scanner": "scan-qr-code",
  "live-caption": "captions",
  "performance-profile": "gauge",
  "wireless-dex": "monitor",
  smartthings: "house-plug",
  "camera-access": "camera",
  "microphone-access": "mic",
};

export const customButtonIconChoices = [
  { id: "zap", translationKey: "advancedCalibration.customIconZap" },
  { id: "star", translationKey: "advancedCalibration.customIconStar" },
  {
    id: "sparkles",
    translationKey: "advancedCalibration.customIconSparkles",
  },
  { id: "circle", translationKey: "advancedCalibration.customIconCircle" },
  { id: "music", translationKey: "advancedCalibration.customIconMusic" },
  {
    id: "gamepad-2",
    translationKey: "advancedCalibration.customIconGamepad",
  },
  { id: "globe", translationKey: "advancedCalibration.customIconGlobe" },
  {
    id: "sliders-horizontal",
    translationKey: "advancedCalibration.customIconSliders",
  },
] as const;

export type CustomButtonIconId = (typeof customButtonIconChoices)[number]["id"];

export const buttonLabelCatalog: BuiltInButtonLabel[] = [
  ...pinnedLabels,
  ...otherLabels,
].map((label) => {
  const id = slug(label);
  const iconName = builtInButtonIconNames[id];
  if (!iconName) {
    throw new Error(`Built-in Button ${label} has no icon`);
  }
  return { id, iconName, label, translationKey: `buttonLabels.${id}` };
});

const buttonLabelsByCanonicalLabel = new Map(
  buttonLabelCatalog.map((item) => [item.label, item]),
);

export const pinnedButtonLabelIds = buttonLabelCatalog
  .slice(0, pinnedLabels.length)
  .map((item) => item.id);

export function getBuiltInButtonLabel(label: string) {
  return buttonLabelsByCanonicalLabel.get(label) ?? null;
}

export function isCustomButtonIconId(
  value: unknown,
): value is CustomButtonIconId {
  return customButtonIconChoices.some((choice) => choice.id === value);
}

export function getButtonIconName(
  label: string,
  customIconId: CustomButtonIconId | null,
): LucideIconName {
  const builtIn = getBuiltInButtonLabel(label);
  if (builtIn) return builtIn.iconName;
  if (customIconId) return customIconId;
  throw new Error(`Custom Button ${label} has no icon`);
}

export function getButtonDisplayLabel(
  label: string,
  translate: ButtonLabelTranslator,
): string {
  const item = buttonLabelsByCanonicalLabel.get(label);
  return item ? translate(item.translationKey) : label;
}

export function searchButtonLabels(
  query: string,
  translate?: ButtonLabelTranslator,
): BuiltInButtonLabel[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return buttonLabelCatalog;

  return buttonLabelCatalog.filter((item) => {
    const localizedLabel = translate?.(item.translationKey) ?? item.label;
    return (
      item.label.toLowerCase().includes(needle) ||
      localizedLabel.toLowerCase().includes(needle)
    );
  });
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
