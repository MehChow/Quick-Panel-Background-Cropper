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
  actionKey: "releaseAnnouncement.v1_5_0.gotIt",
  bodyKey: "releaseAnnouncement.v1_5_0.body",
  id: activeReleaseAnnouncementId,
  titleKey: "releaseAnnouncement.v1_5_0.title",
};
