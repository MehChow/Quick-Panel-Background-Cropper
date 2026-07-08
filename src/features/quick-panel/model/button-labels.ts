export interface BuiltInButtonLabel {
  id: string;
  label: string;
}

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
  "Dark mode",
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

export const buttonLabelCatalog: BuiltInButtonLabel[] = [...pinnedLabels, ...otherLabels].map((label) => ({
  id: slug(label),
  label,
}));

export const pinnedButtonLabelIds = buttonLabelCatalog
  .slice(0, pinnedLabels.length)
  .map((item) => item.id);

export function searchButtonLabels(query: string): BuiltInButtonLabel[] {
  const needle = query.trim().toLowerCase();
  return needle
    ? buttonLabelCatalog.filter((item) => item.label.toLowerCase().includes(needle))
    : buttonLabelCatalog;
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
