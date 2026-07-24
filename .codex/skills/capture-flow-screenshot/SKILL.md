---
name: capture-flow-screenshot
description: Use when QPBC Android UI screenshots under flow/ need to be added, refreshed, or replaced from a connected physical device or emulator after UI changes, including requests naming a flow path, screen, mode, or step.
---

# Capture Flow Screenshot

## Overview

Navigate QPBC on a connected Android device with ADB, visually confirm the requested screen, then capture the full display as WebP. Preserve app data and replace only the explicitly requested `flow/` file.

## Workflow

1. Require the destination path and a description of the desired screen. The path must be under `flow/` and end in `.webp`. Do not guess which numbered screenshot to replace.
2. Run `adb devices -l`. Use `adb -s SERIAL` for every command when more than one device is connected. If the sandbox blocks the ADB server, rerun the ADB command with escalation.
3. Prefer the currently foregrounded QPBC package. Otherwise prefer `com.meh_chow.quickpanelbackgroundcropper.dev` for UI iteration when installed, unless the user requests production `com.meh_chow.quickpanelbackgroundcropper`.
4. Launch and navigate with ADB. Inspect a temporary PNG with `view_image` after each meaningful action. Use UI hierarchy dumps when labels or coordinates are unclear.
5. Wait for animations, keyboards, transient messages, and loading states to settle. Confirm the final screen visually before replacing anything.
6. Run:

   ```bash
   .codex/skills/capture-flow-screenshot/scripts/capture-flow-screenshot.sh flow/default-mode/4.webp SERIAL
   ```

   Omit `SERIAL` only when exactly one device is online. The script captures PNG bytes to a temporary file, converts at WebP quality 80, checks dimensions against an existing target, and replaces the target atomically.
7. Inspect the saved WebP with `view_image`. Run `webpinfo -summary TARGET` and `git diff --stat -- TARGET`. Confirm that only the requested screenshot changed.

## ADB Quick Reference

| Task | Command |
| --- | --- |
| Devices | `adb devices -l` |
| Foreground app | `adb -s SERIAL shell dumpsys window \| rg 'mCurrentFocus\|mFocusedApp'` |
| Launch app | `adb -s SERIAL shell monkey -p PACKAGE -c android.intent.category.LAUNCHER 1` |
| Tap | `adb -s SERIAL shell input tap X Y` |
| Swipe | `adb -s SERIAL shell input swipe X1 Y1 X2 Y2 DURATION_MS` |
| Back | `adb -s SERIAL shell input keyevent KEYCODE_BACK` |
| UI tree | `adb -s SERIAL shell uiautomator dump /sdcard/window.xml` then `adb -s SERIAL pull /sdcard/window.xml /tmp/window.xml` |
| Inspect current screen | `adb -s SERIAL exec-out screencap -p > /tmp/qpbc-current.png` |

## Guardrails

- Never run `pm clear`, uninstall, reinstall, or reset calibration/persisted state unless the user explicitly requests it.
- Never save raw `screencap` output directly with a `.webp` extension; ADB produces PNG.
- Never overwrite the destination before visual confirmation.
- Keep status and navigation bars because existing `flow/` screenshots are full-display 1080×2340 captures.
- Do not stage, commit, or push screenshot changes.
