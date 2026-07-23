import { useState } from "react";
import {
  acknowledgeReleaseAnnouncement,
  loadAcknowledgedReleaseAnnouncement,
} from "../store/storage";
import {
  activeReleaseAnnouncement,
} from "./ReleaseAnnouncementContent";
import { ReleaseAnnouncementDialog } from "./ReleaseAnnouncementDialog";

export function ReleaseAnnouncementHost() {
  const [isOpen, setIsOpen] = useState(
    () => loadAcknowledgedReleaseAnnouncement() !== activeReleaseAnnouncement.id,
  );

  const acknowledge = () => {
    acknowledgeReleaseAnnouncement(activeReleaseAnnouncement.id);
    setIsOpen(false);
  };

  return (
    <ReleaseAnnouncementDialog
      descriptor={activeReleaseAnnouncement}
      onDismiss={acknowledge}
      open={isOpen}
    />
  );
}
