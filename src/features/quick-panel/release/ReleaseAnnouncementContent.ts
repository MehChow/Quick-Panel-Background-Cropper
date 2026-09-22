import type { ImageSource } from "expo-image";
import { activeReleaseAnnouncementId } from "../store/storage";

export interface ReleaseAnnouncementDescriptor {
  actionKey: string;
  bodyKey: string;
  id: string;
  mediaAccessibilityKey?: string;
  mediaSources?: ImageSource[];
  titleKey: string;
}

export const activeReleaseAnnouncement: ReleaseAnnouncementDescriptor = {
  actionKey: "releaseAnnouncement.v1_7_1.gotIt",
  bodyKey: "releaseAnnouncement.v1_7_1.body",
  id: activeReleaseAnnouncementId,
  titleKey: "releaseAnnouncement.v1_7_1.title",
};
