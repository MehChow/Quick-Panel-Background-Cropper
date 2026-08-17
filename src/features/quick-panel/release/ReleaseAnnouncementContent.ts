import type { ImageSource } from "expo-image";
import { activeReleaseAnnouncementId } from "../store/storage";

export interface ReleaseAnnouncementDescriptor {
  actionKey: string;
  bodyKey: string;
  id: string;
  mediaAccessibilityKey?: string;
  mediaSource?: ImageSource;
  titleKey: string;
}

export const activeReleaseAnnouncement: ReleaseAnnouncementDescriptor = {
  actionKey: "releaseAnnouncement.v1_4_0.gotIt",
  bodyKey: "releaseAnnouncement.v1_4_0.body",
  id: activeReleaseAnnouncementId,
  mediaAccessibilityKey: "releaseAnnouncement.v1_4_0.mediaAccessibilityLabel",
  mediaSource: require("../../../../assets/announcement/v1_4_0.webp"),
  titleKey: "releaseAnnouncement.v1_4_0.title",
};
