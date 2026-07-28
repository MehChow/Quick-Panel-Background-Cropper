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
  actionKey: "releaseAnnouncement.v1_2_0.gotIt",
  bodyKey: "releaseAnnouncement.v1_2_0.body",
  id: activeReleaseAnnouncementId,
  mediaAccessibilityKey:
    "releaseAnnouncement.v1_2_0.mediaAccessibilityLabel",
  mediaSource: require("../../../../assets/announcement/icon-color-picker.gif"),
  titleKey: "releaseAnnouncement.v1_2_0.title",
};
