import i18n from "../../../../i18next/i18next";
import { getButtonDisplayLabel } from "./button-labels";
import type { PanelId } from "./types";

export function translate(key: string, options?: Record<string, unknown>) {
  return i18n.t(key, options);
}

export function getPanelLabel(id: PanelId) {
  return translate(`panels.${id}`);
}

export function getButtonLabel(label: string) {
  return getButtonDisplayLabel(label, (key) => translate(key));
}
