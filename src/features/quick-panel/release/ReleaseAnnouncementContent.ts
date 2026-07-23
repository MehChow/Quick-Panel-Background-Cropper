import { activeReleaseAnnouncementId } from "../store/storage";

export interface ReleaseAnnouncementDescriptor {
  actionKey: string;
  bodyKey: string;
  id: string;
  titleKey: string;
}

export const activeReleaseAnnouncement: ReleaseAnnouncementDescriptor = {
  actionKey: "releaseAnnouncement.v1_1_0.gotIt",
  bodyKey: "releaseAnnouncement.v1_1_0.body",
  id: activeReleaseAnnouncementId,
  titleKey: "releaseAnnouncement.v1_1_0.title",
};
