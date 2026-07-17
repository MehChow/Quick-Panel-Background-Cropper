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
  "Auto rotate",
  "Flashlight",
  "Sound",
  "Airplane mode",
  "Location",
  "Mobile data",
  "Hotspot",
  "Power saving",
  "Smart View",
  "Nearby devices",
];

const otherLabels = [
  "Eye comfort shield",
  "Do not disturb",
  "Link to Windows",
  "Quick Share",
  "NFC",
  "Wireless power sharing",
  "Screen recorder",
  "Screenshot",
  "Modes",
  "Device control",
  "Music Share",
  "Dolby Atmos",
  "Extra dim",
  "Secure Folder",
  "Always On Display",
  "Sync",
  "Kids",
  "Scan QR code",
  "Video call effects",
  "Live Caption",
  "Call caption",
  "Microphone mode",
  "Performance profile",
  "Battery protect",
  "Bluetooth tethering",
  "Ultra-wideband",
  "Data saver",
  "VPN",
  "Focus mode",
  "Bedtime mode",
  "Screen cast",
  "Dex",
  "SmartThings",
  "One-handed mode",
  "Touch sensitivity",
  "Color inversion",
  "Color correction",
  "Reduce brightness",
  "Accessibility",
  "Camera access",
  "Microphone access",
  "Private Share",
  "Nearby Share",
  "Work profile",
  "USB tethering",
  "Storage",
  "Hotspot 2.0",
];

const builtInButtonIconNames: Record<string, LucideIconName> = {
  "wi-fi": "wifi",
  bluetooth: "bluetooth",
  "auto-rotate": "rotate-cw",
  flashlight: "flashlight",
  sound: "volume-2",
  "airplane-mode": "plane",
  location: "map-pin",
  "mobile-data": "antenna",
  hotspot: "radio-tower",
  "power-saving": "battery-charging",
  "smart-view": "monitor-up",
  "nearby-devices": "radar",
  "eye-comfort-shield": "eye",
  "do-not-disturb": "circle-minus",
  "link-to-windows": "monitor-smartphone",
  "quick-share": "share-2",
  nfc: "nfc",
  "wireless-power-sharing": "battery-charging",
  "screen-recorder": "video",
  screenshot: "scan-line",
  modes: "sliders-horizontal",
  "device-control": "settings-2",
  "music-share": "music-2",
  "dolby-atmos": "audio-lines",
  "extra-dim": "sun-dim",
  "secure-folder": "folder-lock",
  "always-on-display": "clock-3",
  sync: "refresh-cw",
  kids: "baby",
  "scan-qr-code": "scan-qr-code",
  "video-call-effects": "video",
  "live-caption": "captions",
  "call-caption": "message-square-text",
  "microphone-mode": "mic-2",
  "performance-profile": "gauge",
  "battery-protect": "shield-check",
  "bluetooth-tethering": "bluetooth",
  "ultra-wideband": "radio",
  "data-saver": "database",
  vpn: "shield",
  "focus-mode": "focus",
  "bedtime-mode": "bed-double",
  "screen-cast": "cast",
  dex: "monitor",
  smartthings: "house-plug",
  "one-handed-mode": "hand",
  "touch-sensitivity": "pointer",
  "color-inversion": "contrast",
  "color-correction": "palette",
  "reduce-brightness": "sun-dim",
  accessibility: "accessibility",
  "camera-access": "camera",
  "microphone-access": "mic",
  "private-share": "lock-keyhole",
  "nearby-share": "send",
  "work-profile": "briefcase-business",
  "usb-tethering": "usb",
  storage: "hard-drive",
  "hotspot-2-0": "radio-tower",
};

export const customButtonIconChoices = [
  { id: "star", translationKey: "advancedCalibration.customIconStar" },
  { id: "zap", translationKey: "advancedCalibration.customIconZap" },
  { id: "home", translationKey: "advancedCalibration.customIconHome" },
  { id: "app-window", translationKey: "advancedCalibration.customIconAppWindow" },
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

export function isCustomButtonIconId(value: unknown): value is CustomButtonIconId {
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
