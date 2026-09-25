import { ReleaseAnnouncementHost } from "@/features/quick-panel/release/ReleaseAnnouncementHost";
import {
  acknowledgeReleaseAnnouncement,
  loadAcknowledgedReleaseAnnouncement,
} from "@/features/quick-panel/store/storage";
import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ComponentProps } from "react";
import { Modal, View } from "react-native";

jest.mock("expo-image", () => {
  const { View: MockImage } = jest.requireActual("react-native");

  return {
    Image: (props: ComponentProps<typeof View>) => <MockImage {...props} />,
  };
});

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
  it("shows the new announcement after acknowledging the previous release", () => {
    acknowledgeReleaseAnnouncement(
      "v1.7.1-image-selection-fix-button-icons-announcement",
    );

    render(<ReleaseAnnouncementHost />);

    expect(screen.getByText("releaseAnnouncement.v1_7_3.title")).toBeTruthy();
  });

  it("shows an unacknowledged announcement and dismisses it", () => {
    render(<ReleaseAnnouncementHost />);

    expect(screen.getByText("releaseAnnouncement.v1_7_3.title")).toBeTruthy();
    expect(screen.getByText("releaseAnnouncement.v1_7_3.body")).toBeTruthy();
    expect(
      screen.getByText("releaseAnnouncement.v1_7_3.title").props.className,
    ).toContain("text-white");
    expect(
      screen.getByText("releaseAnnouncement.v1_7_3.gotIt").props.className,
    ).toContain("text-black");
    expect(
      screen.getByRole("button", {
        name: "releaseAnnouncement.v1_7_3.gotIt",
      }).props.className,
    ).toContain("bg-white");
    expect(screen.queryByTestId("release-announcement-media-wrapper")).toBeNull();
    expect(screen.queryByTestId("release-announcement-media")).toBeNull();

    fireEvent.press(screen.getByText("releaseAnnouncement.v1_7_3.gotIt"));

    expect(loadAcknowledgedReleaseAnnouncement()).toBe(
      "v1.7.3-app-optimization-display-fixes-announcement",
    );
    expect(screen.queryByText("releaseAnnouncement.v1_7_3.title")).toBeNull();
  });

  it("only dismisses when the user acknowledges the announcement", () => {
    render(<ReleaseAnnouncementHost />);

    fireEvent.press(screen.getByText("releaseAnnouncement.v1_7_3.gotIt"));

    expect(loadAcknowledgedReleaseAnnouncement()).toBe(
      "v1.7.3-app-optimization-display-fixes-announcement",
    );
  });

  it("does not show an already acknowledged announcement", () => {
    acknowledgeReleaseAnnouncement(
      "v1.7.3-app-optimization-display-fixes-announcement",
    );

    render(<ReleaseAnnouncementHost />);

    expect(screen.queryByText("releaseAnnouncement.v1_7_3.title")).toBeNull();
  });

  it("acknowledges when the dialog is dismissed by the platform", () => {
    const rendered = render(<ReleaseAnnouncementHost />);

    fireEvent(rendered.UNSAFE_getByType(Modal), "requestClose");

    expect(loadAcknowledgedReleaseAnnouncement()).toBe(
      "v1.7.3-app-optimization-display-fixes-announcement",
    );
  });
});
