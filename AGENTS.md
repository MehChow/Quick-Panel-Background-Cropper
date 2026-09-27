# Project instructions

Read the exact [Expo SDK 57 documentation](https://docs.expo.dev/versions/v57.0.0/)
before writing code. Do not use a web browser for this Expo project; read docs
through a documentation tool or HTTP client. Subagents may use GPT-6 Luna High
or below only.

## Current sources of truth

QPBC is a released Samsung Good Lock QuickStar background cropper. Current
release: 1.7.3 (authoritative release metadata: app.json). Keep all existing
features during the upcoming UI revamp.

- [Documentation index](docs/README.md)
- [Product behavior](docs/product-behavior.md): four customization paths and user-facing contracts.
- [Architecture](docs/architecture.md): geometry, image composition and persistence compatibility.
- [Current styling](docs/styling.md): baseline until explicitly superseded by the revamp.
- [Testing](docs/testing.md) and [manual acceptance](docs/production-manual-test-checklist.md).
- [Release workflow](docs/dev-release-flow.md) and [announcements](docs/release-announcement-guideline.md).

Historical plans and handoffs in Git history are not current instructions.
Deferred ideas under docs/backlog are not approved implementation scope.
Current screenshots are under flow/default, flow/advanced/controls-only,
flow/advanced/buttons-only, flow/advanced/combined and flow/bottom-sheet-tutorial.

## Non-negotiable behavior

- Preserve Default and all three independent Advanced targets: Controls only,
  Buttons only, Controls + Buttons. Combined requires at least one of each family.
- Preserve local data across updates. Keep storage keys and compatibility
  parsers; warn the user before any newly necessary reset.
- Keep English, Traditional Chinese and Spanish copy synchronized.
- All Advanced grids are required; retain bounds, overlap validation, snapping,
  haptics and atomic gesture commits before phase advance.
- Preview and export share one working-image coordinate system and transform.
  Exports use the working source, never the smaller preview proxy.
- Preserve 1024-square PNGs, centered square source areas, Good Lock order,
  sequential image/identifier readiness and capture-failure cleanup.
- Preserve URI-based cache ownership and transactional appearance editing.

## Stack and code style

- Expo 57, TypeScript, Zustand, Uniwind (Tailwind v4), currently AniUI.
- Use interfaces for props/state; avoid any.
- Keep code concise, typed and organized by feature. Extract business logic
  into hooks and keep component files under 150 lines when making changes.
- Use camelCase variables/functions, PascalCase components and lowercase
  hyphenated directories.
- React Compiler handles memoization. Do not add useMemo, useCallback or
  React.memo outside src/components/ani-ui.
- Use expo-image for raster images. Reuse current AniUI primitives for routine
  maintenance; the explicitly requested UI-library revamp may replace them.
- Use consistent padding and responsive layouts; consult docs/styling.md.

## Commands

- npm test -- --runInBand
- npx tsc --noEmit
- npm run lint
- npm run android: clean native prebuild and development installation.
- npm run build-apk: local APK variant.
- npm run build-release: interactive signed Play build/upload workflow;
  follow the release guide and preserve its upload confirmation.

## Agent-device

Use agent-device only for app/device automation tasks. For a normal app-driving task, start immediately. Do not probe first with `--help`, `--version`, `devices`, `appstate`, `snapshot`, or `screenshot`; open the requested app in the foreground and continue from its initial interactive snapshot. For TV, Fire TV, or Vega OS tasks, read `agent-device help tv`. For exploratory QA, read `agent-device help dogfood`. For logs, network, audio, traces, or runtime failures, read `agent-device help debugging`. For React Native component trees, props/state/hooks, slow renders, or rerenders, read `agent-device help react-devtools`. For React Native JavaScript heap growth, heap snapshots, allocation hotspots, or retained-object leaks, read `agent-device help cdp`. For React Native apps, overlays, Metro/Fast Refresh blockers, and routing to React DevTools or debugging evidence, read `agent-device help react-native`.

Use MCP tools or the CLI in the integrated terminal. If `agent-device` is not on PATH but the user installed it globally in another shell, resolve the command the same way the user would from a normal terminal session and run that absolute path instead. This may require inspecting shell startup behavior or package-manager/global bin locations; do not assume the agent process `PATH` is the user's `PATH`. Do not silently fall back to `npx -y agent-device@latest`; ask or use an exact version. MCP exposes structured tools backed by the agent-device client; it does not expose generic shell execution. Prefer `open -> snapshot -i -> act -> re-snapshot -> verify -> close` where the target supports capture and selectors; otherwise follow target-specific help. Use current refs such as `@e3` for exploration and selectors for durable replay. Keep mutating commands against one session serial. Capture screenshots, logs, network, audio, perf, traces, recordings, and `.ad` replay scripts only when they add evidence.
