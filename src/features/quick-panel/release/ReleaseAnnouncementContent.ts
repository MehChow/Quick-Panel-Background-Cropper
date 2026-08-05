import { activeReleaseAnnouncementId } from "../store/storage";
import type { ImageSource } from "expo-image";

export interface ReleaseAnnouncementDescriptor {
  actionKey: string;
  bodyKey: string;
  id: string;
  mediaAccessibilityKey?: string;
  mediaSource?: ImageSource;
  titleKey: string;
}

export const activeReleaseAnnouncement: ReleaseAnnouncementDescriptor = {
  actionKey: "releaseAnnouncement.v1_3_1.gotIt",
  bodyKey: "releaseAnnouncement.v1_3_1.body",
  id: activeReleaseAnnouncementId,
  mediaAccessibilityKey:
    "releaseAnnouncement.v1_3_1.mediaAccessibilityLabel",
  mediaSource: require("../../../../assets/mode/advanced_4.webp"),
  titleKey: "releaseAnnouncement.v1_3_1.title",
};
