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
  it("shows an unacknowledged announcement and dismisses it", () => {
    render(<ReleaseAnnouncementHost />);

    expect(screen.getByText("releaseAnnouncement.v1_3_3.title")).toBeTruthy();
    expect(screen.getByText("releaseAnnouncement.v1_3_3.body")).toBeTruthy();
    expect(
      screen.getByText("releaseAnnouncement.v1_3_3.title").props.className,
    ).toContain("text-white");
    expect(
      screen.getByText("releaseAnnouncement.v1_3_3.gotIt").props.className,
    ).toContain("text-black");
    expect(
      screen.getByRole("button", {
        name: "releaseAnnouncement.v1_3_3.gotIt",
      }).props.className,
    ).toContain("bg-white");
    expect(
      screen.getByLabelText(
        "releaseAnnouncement.v1_3_3.mediaAccessibilityLabel",
      ).props.contentFit,
    ).toBe("cover");
    expect(
      screen.getByLabelText(
        "releaseAnnouncement.v1_3_3.mediaAccessibilityLabel",
      ).props.source,
    ).toEqual(
      expect.objectContaining({
        testUri: expect.stringContaining("9.webp"),
      }),
    );
    expect(
      screen.getByTestId("release-announcement-media-wrapper").props.style,
    ).toEqual(expect.objectContaining({ borderRadius: 16 }));
    expect(
      screen.getByTestId("release-announcement-media-wrapper").props.style,
    ).toEqual(expect.objectContaining({ overflow: "hidden" }));

    fireEvent.press(screen.getByText("releaseAnnouncement.v1_3_3.gotIt"));

    expect(loadAcknowledgedReleaseAnnouncement()).toBe(
      "v1.3.3-snap-strength-announcement",
    );
    expect(screen.queryByText("releaseAnnouncement.v1_3_3.title")).toBeNull();
  });

  it("only dismisses when the user acknowledges the announcement", () => {
    render(<ReleaseAnnouncementHost />);

    fireEvent.press(screen.getByText("releaseAnnouncement.v1_3_3.gotIt"));

    expect(loadAcknowledgedReleaseAnnouncement()).toBe(
      "v1.3.3-snap-strength-announcement",
    );
  });

  it("does not show an already acknowledged announcement", () => {
    acknowledgeReleaseAnnouncement("v1.3.3-snap-strength-announcement");

    render(<ReleaseAnnouncementHost />);

    expect(screen.queryByText("releaseAnnouncement.v1_3_3.title")).toBeNull();
  });

  it("acknowledges when the dialog is dismissed by the platform", () => {
    const rendered = render(<ReleaseAnnouncementHost />);

    fireEvent(rendered.UNSAFE_getByType(Modal), "requestClose");

    expect(loadAcknowledgedReleaseAnnouncement()).toBe(
      "v1.3.3-snap-strength-announcement",
    );
  });
});
