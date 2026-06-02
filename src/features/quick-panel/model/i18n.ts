import i18n from "../../../../i18next/i18next";
import type { PanelId } from "./types";

export function translate(key: string, options?: Record<string, unknown>) {
  return i18n.t(key, options);
}

export function getPanelLabel(id: PanelId) {
  return translate(`panels.${id}`);
}
