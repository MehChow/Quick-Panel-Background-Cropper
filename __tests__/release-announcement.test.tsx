import { fireEvent, render, screen } from "@testing-library/react-native";
import { Modal } from "react-native";
import {
  acknowledgeReleaseAnnouncement,
  loadAcknowledgedReleaseAnnouncement,
} from "@/features/quick-panel/store/storage";
import { ReleaseAnnouncementHost } from "@/features/quick-panel/release/ReleaseAnnouncementHost";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

interface MmkvTestGlobal {
  __mmkvStore?: Map<string, boolean | string>;
}

beforeEach(() => {
  (globalThis as typeof globalThis & MmkvTestGlobal).__mmkvStore?.delete(
    "quick-panel.acknowledged-release-announcement",
  );
});

describe("release announcement", () => {
  it("shows an unacknowledged announcement and dismisses it", () => {
    render(<ReleaseAnnouncementHost />);

    expect(screen.getByText("releaseAnnouncement.v1_1_0.title")).toBeTruthy();
    expect(screen.getByText("releaseAnnouncement.v1_1_0.body")).toBeTruthy();

    fireEvent.press(screen.getByText("releaseAnnouncement.v1_1_0.gotIt"));

    expect(loadAcknowledgedReleaseAnnouncement()).toBe(
      "v1.1.0-release-announcement",
    );
    expect(screen.queryByText("releaseAnnouncement.v1_1_0.title")).toBeNull();
  });

  it("only dismisses when the user acknowledges the announcement", () => {
    render(<ReleaseAnnouncementHost />);

    fireEvent.press(screen.getByText("releaseAnnouncement.v1_1_0.gotIt"));

    expect(loadAcknowledgedReleaseAnnouncement()).toBe(
      "v1.1.0-release-announcement",
    );
  });

  it("does not show an already acknowledged announcement", () => {
    acknowledgeReleaseAnnouncement("v1.1.0-release-announcement");

    render(<ReleaseAnnouncementHost />);

    expect(screen.queryByText("releaseAnnouncement.v1_1_0.title")).toBeNull();
  });

  it("acknowledges when the dialog is dismissed by the platform", () => {
    const rendered = render(<ReleaseAnnouncementHost />);

    fireEvent(rendered.UNSAFE_getByType(Modal), "requestClose");

    expect(loadAcknowledgedReleaseAnnouncement()).toBe(
      "v1.1.0-release-announcement",
    );
  });
});
