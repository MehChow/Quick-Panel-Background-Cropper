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
  actionKey: "releaseAnnouncement.v1_6_0.gotIt",
  bodyKey: "releaseAnnouncement.v1_6_0.body",
  id: activeReleaseAnnouncementId,
  mediaAccessibilityKey: "releaseAnnouncement.v1_6_0.mediaAccessibilityLabel",
  mediaSources: [
    require("../../../../assets/announcement/v1_6_0_a.webp"),
    require("../../../../assets/announcement/v1_6_0_b.webp"),
  ],
  titleKey: "releaseAnnouncement.v1_6_0.title",
};
