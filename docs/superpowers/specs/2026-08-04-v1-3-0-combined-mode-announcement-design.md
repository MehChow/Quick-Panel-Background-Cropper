# v1.3.0 Advanced Combined Mode Announcement Design

**Date:** 2026-08-04
**Status:** Approved design

## Purpose

Show one startup announcement for version 1.3.0, introducing the new Advanced
`Controls + Buttons` target. It explains that a single image can flow
continuously across both Quick Panel panel families.

## User experience

- The global release-announcement dialog appears once when its new,
  reason-specific ID has not been acknowledged.
- It uses the existing dark AniUI alert-dialog shell and the standard
  `Got it` / `知道了` acknowledgement action.
- The dialog includes concise localized English and Traditional Chinese copy.
- `flow/advanced/combined/19.webp` appears below the body and above the CTA as
  the illustrative example, using a localized accessibility label.
- Acknowledging or platform-dismissal records only this announcement ID and
  closes the dialog. It does not navigate, reset calibration, or change any
  other preference.

## Implementation boundaries

- Set `activeReleaseAnnouncementId` to
  `v1.3.0-advanced-combined-mode-announcement`.
- Update the active release descriptor with matching v1.3.0 locale keys and
  the bundled WebP media.
- Reuse the existing dialog and global host without release-specific UI
  conditionals.
- Update locale, storage, and dialog behavior tests for the new ID, text keys,
  media label, and acknowledgement behavior.

## Verification

Run the focused announcement, storage, and locale tests, then lint,
TypeScript, and a whitespace diff check. Device layout and image rendering
remain manual QA.
