# Custom Layout Calibration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve the current default-layout calibration flow and add a separate custom-layout calibration mode that lets users calibrate `buttonBox`, `brightness`, `volume`, and `mediaPlayer` individually, skip hidden panels, and export only the present panels as a testable Android APK workflow.

**Architecture:** Keep the current one-box union calibration as `default-union` mode, introduce a versioned calibration profile with `custom-panels` mode, and derive the runtime preset from persisted calibration data instead of treating one scaled preset as the only source of truth. Custom mode uses explicit per-panel rectangles plus hidden/present status, while preview and export filter down to the present panels only.

**Tech Stack:** Expo 56, Expo Router, expo-image, expo-image-picker, expo-media-library, react-native-view-shot, Zustand, Uniwind, AniUI, TypeScript

---

## File Structure

### Existing files to modify

- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\model\types.ts`
  - extend calibration and preset types to support dual-mode calibration and visible-panel filtering
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\model\panel-geometry.ts`
  - handle filtered panel sets safely and build custom presets from panel calibrations
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\storage.ts`
  - migrate legacy one-box data into a versioned calibration profile
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-defaults.ts`
  - derive startup state from the new calibration profile
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-transitions.ts`
  - support calibration mode selection, custom calibration completion, and filtered export state
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-store.ts`
  - expose new calibration actions and custom wizard state
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\selectors.ts`
  - add selectors for layout mode and custom calibration wizard state
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\home\LandingScreen.tsx`
  - add layout mode choice and route the user into the matching calibration flow
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\CalibrationScreen.tsx`
  - branch between default one-box calibration and custom panel wizard
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\hooks\useCalibrationScreen.ts`
  - manage calibration mode, screenshot import, and save behavior for both modes
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\components\CalibrationCanvas.tsx`
  - remain the default-mode canvas only
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\customize\components\QuickPanelPreview.tsx`
  - render only present panels
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\customize\components\PanelSlice.tsx`
  - safely read panel geometry from filtered preset data
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\customize\components\ExportSurfaces.tsx`
  - create hidden offscreen export surfaces only for present panels
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\customize\hooks\useCustomizeScreen.ts`
  - pass filtered preset and updated export refs through the screen
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\customize\hooks\useCustomizeActions.ts`
  - keep export flow consistent after preset filtering
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\customize\services\export-files.ts`
  - fail clearly when no present export surfaces exist and save only present panels
- `E:\Coding_things\Quick-Panel-Background-Cropper\i18next\locales\en.ts`
  - add strings for layout mode selection and custom calibration wizard
- `E:\Coding_things\Quick-Panel-Background-Cropper\i18next\locales\zh.ts`
  - add the same strings in Chinese
- `E:\Coding_things\Quick-Panel-Background-Cropper\README.md`
  - document default and custom calibration modes
- `E:\Coding_things\Quick-Panel-Background-Cropper\CALIBRATION_PLAN.md`
  - update the documented scope to explain the dual-mode calibration model
- `E:\Coding_things\Quick-Panel-Background-Cropper\eas.json`
  - make the preview build profile explicitly emit an APK artifact

### New files to create

- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\model\calibration-profile.ts`
  - source-of-truth calibration profile types and helper constructors
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\model\custom-preset.ts`
  - build a filtered runtime preset from custom per-panel calibration
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\components\CalibrationModeCard.tsx`
  - landing-screen choice UI for `Default layout` and `Custom layout`
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\components\CustomCalibrationCanvas.tsx`
  - single-panel calibration canvas for the current custom wizard step
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\components\CustomCalibrationStepper.tsx`
  - current panel label, progress, hidden toggle, and next/back actions
- `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\hooks\useCustomCalibrationFlow.ts`
  - focused hook for per-panel draft state and step transitions

### Existing tests that may need interface updates only if they break

- `E:\Coding_things\Quick-Panel-Background-Cropper\__tests__\storage.test.ts`
- `E:\Coding_things\Quick-Panel-Background-Cropper\__tests__\quick-panel-transitions.test.ts`

Repo instruction note: do not add new test suites unless explicitly requested by the user. Keep verification lightweight and update existing tests only if current interface changes break them.

### Task 1: Add Versioned Calibration Profile And Migration

**Files:**
- Create: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\model\calibration-profile.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\model\types.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\storage.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-defaults.ts`

- [ ] **Step 1: Add calibration profile domain types**

```ts
// src/features/quick-panel/model/calibration-profile.ts
import type { PanelId, PanelRect } from "./types";

export type CalibrationMode = "default-union" | "custom-panels";
export type PanelCalibrationStatus = "present" | "hidden" | "unconfigured";

export interface PanelCalibration {
  id: PanelId;
  rect: PanelRect | null;
  status: PanelCalibrationStatus;
}

export interface DefaultUnionCalibrationProfile {
  mode: "default-union";
  rect: PanelRect;
  version: 1;
}

export interface CustomPanelsCalibrationProfile {
  mode: "custom-panels";
  panels: Record<PanelId, PanelCalibration>;
  version: 1;
}

export type CalibrationProfile =
  | DefaultUnionCalibrationProfile
  | CustomPanelsCalibrationProfile;
```

- [ ] **Step 2: Extend shared types to reference the new profile model**

```ts
// src/features/quick-panel/model/types.ts
import type {
  CalibrationMode,
  CalibrationProfile,
  PanelCalibration,
} from "./calibration-profile";

export type { CalibrationMode, CalibrationProfile, PanelCalibration };
```

- [ ] **Step 3: Replace legacy storage loading with migration-aware profile loading**

```ts
// src/features/quick-panel/store/storage.ts
const calibrationProfileKey = "quick-panel.calibration-profile";

export function loadCalibrationProfile(): CalibrationProfile | null {
  const profileJson = storage.getString(calibrationProfileKey);
  if (profileJson) {
    return parseCalibrationProfile(profileJson);
  }

  const legacy = loadLegacyCalibration();
  if (!legacy) {
    return null;
  }

  return {
    mode: "default-union",
    rect: legacy,
    version: 1,
  };
}

export function saveCalibrationProfile(profile: CalibrationProfile) {
  storage.set(calibrationProfileKey, JSON.stringify(profile));
  if (profile.mode === "default-union") {
    saveCalibration(profile.rect);
  }
}
```

- [ ] **Step 4: Initialize app state from calibration profile instead of only `calibrationRect`**

```ts
// src/features/quick-panel/store/quick-panel-defaults.ts
const calibrationProfile = loadCalibrationProfile();
const activePreset = calibrationProfile
  ? getPresetFromCalibrationProfile(calibrationProfile)
  : s25PlusOneUi85Preset;

return {
  calibrationMode: calibrationProfile?.mode ?? "default-union",
  calibrationProfile,
  isCalibrated: calibrationProfile !== null,
  // keep legacy fields only if still needed during the transition
};
```

- [ ] **Step 5: Verify migration logic and state wiring**

Run: `npm run lint`

Expected: no TypeScript or ESLint errors from the new calibration profile and startup state wiring.

- [ ] **Step 6: Commit**

```bash
git add src/features/quick-panel/model/calibration-profile.ts src/features/quick-panel/model/types.ts src/features/quick-panel/store/storage.ts src/features/quick-panel/store/quick-panel-defaults.ts
git commit -m "feat: add calibration profile migration"
```

### Task 2: Derive Filtered Runtime Presets For Custom Layouts

**Files:**
- Create: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\model\custom-preset.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\model\types.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\model\panel-geometry.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-transitions.ts`

- [ ] **Step 1: Allow runtime presets to contain only present panels**

```ts
// src/features/quick-panel/model/types.ts
export interface QuickPanelPreset {
  id: string;
  label: string;
  width: number;
  height: number;
  panels: Partial<Record<PanelId, PanelDefinition>>;
  visualOrder: PanelId[];
  goodLockOrder: PanelId[];
}
```

- [ ] **Step 2: Build a custom preset directly from present panel calibrations**

```ts
// src/features/quick-panel/model/custom-preset.ts
import { getPanelLabel, translate } from "./i18n";
import type { CustomPanelsCalibrationProfile } from "./calibration-profile";
import type { PanelId, PanelRect, QuickPanelPreset } from "./types";

const visualOrder: PanelId[] = ["buttonBox", "brightness", "volume", "mediaPlayer"];
const goodLockOrder: PanelId[] = ["buttonBox", "mediaPlayer", "brightness", "volume"];
const fileNames: Record<PanelId, string> = {
  brightness: "03-brightness.png",
  buttonBox: "01-button-box.png",
  mediaPlayer: "02-media-player.png",
  volume: "04-volume.png",
};

export function buildCustomPreset(
  profile: CustomPanelsCalibrationProfile,
): QuickPanelPreset {
  const presentIds = visualOrder.filter(
    (id) => profile.panels[id].status === "present" && profile.panels[id].rect,
  );

  const panels = Object.fromEntries(
    presentIds.map((id) => [
      id,
      {
        fileName: fileNames[id],
        id,
        label: getPanelLabel(id),
        rect: profile.panels[id].rect!,
      },
    ]),
  );
  const union = getCustomPanelUnion(profile, presentIds);

  return {
    id: "custom-layout-calibrated",
    label: translate("preset.customLabel"),
    width: Math.ceil(union.x + union.width),
    height: Math.ceil(union.y + union.height),
    panels,
    visualOrder: presentIds,
    goodLockOrder: goodLockOrder.filter((id) => presentIds.includes(id)),
  };
}

function getCustomPanelUnion(
  profile: CustomPanelsCalibrationProfile,
  presentIds: PanelId[],
): PanelRect {
  const rects = presentIds.map((id) => profile.panels[id].rect!) as PanelRect[];
  const left = Math.min(...rects.map((rect) => rect.x));
  const top = Math.min(...rects.map((rect) => rect.y));
  const right = Math.max(...rects.map((rect) => rect.x + rect.width));
  const bottom = Math.max(...rects.map((rect) => rect.y + rect.height));

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
    radius: 0,
  };
}
```

- [ ] **Step 3: Make geometry helpers safe for filtered panel orders**

```ts
// src/features/quick-panel/model/panel-geometry.ts
export function getPanelUnion(preset: QuickPanelPreset): PanelRect {
  const rects = preset.visualOrder
    .map((id) => preset.panels[id]?.rect)
    .filter(Boolean) as PanelRect[];

  if (rects.length === 0) {
    return { x: 0, y: 0, width: 1, height: 1, radius: 0 };
  }

  // existing union logic
}
```

- [ ] **Step 4: Route `activePreset` derivation through the calibration profile**

```ts
// src/features/quick-panel/store/quick-panel-transitions.ts
export function getPresetFromCalibrationProfile(
  profile: CalibrationProfile,
): QuickPanelPreset {
  if (profile.mode === "custom-panels") {
    return buildCustomPreset(profile);
  }

  return getCalibratedPreset(profile.rect);
}
```

- [ ] **Step 5: Verify filtered preset derivation**

Run: `npm run lint`

Expected: no type errors from `Partial<Record<PanelId, PanelDefinition>>` and no unchecked access in geometry helpers.

- [ ] **Step 6: Commit**

```bash
git add src/features/quick-panel/model/custom-preset.ts src/features/quick-panel/model/types.ts src/features/quick-panel/model/panel-geometry.ts src/features/quick-panel/store/quick-panel-transitions.ts
git commit -m "feat: derive presets from custom panel calibration"
```

### Task 3: Add Layout Mode Selection And Custom Calibration State

**Files:**
- Create: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\components\CalibrationModeCard.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-store.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\selectors.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\store\quick-panel-transitions.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\home\LandingScreen.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\i18next\locales\en.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\i18next\locales\zh.ts`

- [ ] **Step 1: Add store state for layout mode and custom calibration draft**

```ts
// src/features/quick-panel/store/quick-panel-store.ts
export interface QuickPanelState extends QuickPanelStateData {
  setCalibrationMode: (mode: CalibrationMode) => void;
  startCustomCalibration: () => void;
  setPanelCalibration: (panel: PanelCalibration) => void;
  setCustomCalibrationStep: (panelId: PanelId) => void;
}
```

- [ ] **Step 2: Add selectors for landing mode choice and custom wizard state**

```ts
// src/features/quick-panel/store/selectors.ts
landingScreen: (state) => ({
  calibrationMode: state.calibrationMode,
  isCalibrated: state.isCalibrated,
  setCalibrationMode: state.setCalibrationMode,
  goToCalibration: state.goToCalibration,
  startCustomizing: state.startCustomizing,
}),
customCalibrationScreen: (state) => ({
  calibrationMode: state.calibrationMode,
  customCalibrationDraft: state.customCalibrationDraft,
  customCalibrationStep: state.customCalibrationStep,
  setPanelCalibration: state.setPanelCalibration,
  setCustomCalibrationStep: state.setCustomCalibrationStep,
})
```

- [ ] **Step 3: Render `Default layout` and `Custom layout` choices on the landing screen**

```tsx
// src/features/quick-panel/home/LandingScreen.tsx
<CalibrationModeCard
  selected={calibrationMode === "default-union"}
  title={t("landing.defaultLayoutTitle")}
  description={t("landing.defaultLayoutDescription")}
  onPress={() => setCalibrationMode("default-union")}
/>
<CalibrationModeCard
  selected={calibrationMode === "custom-panels"}
  title={t("landing.customLayoutTitle")}
  description={t("landing.customLayoutDescription")}
  onPress={() => setCalibrationMode("custom-panels")}
/>
```

- [ ] **Step 4: Add localization strings for the new layout-mode UI**

```ts
// i18next/locales/en.ts
landing: {
  customLayoutDescription: "Calibrate each Quick Panel surface individually.",
  customLayoutTitle: "Custom layout",
  defaultLayoutDescription: "Use the fast one-box calibration for the default One UI layout.",
  defaultLayoutTitle: "Default layout",
}
```

- [ ] **Step 5: Verify landing mode selection**

Run: `npm run lint`

Expected: landing screen compiles, new selector fields type-check, and locale files remain valid modules.

- [ ] **Step 6: Commit**

```bash
git add src/features/quick-panel/calibration/components/CalibrationModeCard.tsx src/features/quick-panel/store/quick-panel-store.ts src/features/quick-panel/store/selectors.ts src/features/quick-panel/store/quick-panel-transitions.ts src/features/quick-panel/home/LandingScreen.tsx i18next/locales/en.ts i18next/locales/zh.ts
git commit -m "feat: add calibration mode selection"
```

### Task 4: Build The Custom Panel Calibration Wizard

**Files:**
- Create: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\components\CustomCalibrationCanvas.tsx`
- Create: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\components\CustomCalibrationStepper.tsx`
- Create: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\hooks\useCustomCalibrationFlow.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\CalibrationScreen.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\hooks\useCalibrationScreen.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\calibration\components\CalibrationCanvas.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\i18next\locales\en.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\i18next\locales\zh.ts`

- [ ] **Step 1: Add a focused hook to drive current panel, hidden state, and completion**

```ts
// src/features/quick-panel/calibration/hooks/useCustomCalibrationFlow.ts
export function useCustomCalibrationFlow() {
  const {
    customCalibrationDraft,
    customCalibrationStep,
    setPanelCalibration,
    setCustomCalibrationStep,
  } = useQuickPanelStore(useShallow(quickPanelSelectors.customCalibrationScreen));

  const currentPanel = customCalibrationDraft.panels[customCalibrationStep];
  const isComplete = Object.values(customCalibrationDraft.panels).every(
    (panel) => panel.status !== "unconfigured",
  );

  return {
    currentPanel,
    customCalibrationStep,
    isComplete,
    setPanelCalibration,
    setCustomCalibrationStep,
  };
}
```

- [ ] **Step 2: Create a single-panel calibration canvas that reuses the existing green-box interaction**

```tsx
// src/features/quick-panel/calibration/components/CustomCalibrationCanvas.tsx
export function CustomCalibrationCanvas({
  screenshot,
  rect,
  onRectChange,
}: CustomCalibrationCanvasProps) {
  const [viewWidth, setViewWidth] = useState(0);
  const scale = viewWidth ? viewWidth / screenshot.width : 1;

  return (
    <View onLayout={(event) => setViewWidth(event.nativeEvent.layout.width)}>
      <Image source={{ uri: screenshot.uri }} contentFit="fill" style={{ height: "100%", width: "100%" }} />
      <CalibrationOverlay
        rect={rect}
        scale={scale}
        screenshot={screenshot}
        onRectChange={onRectChange}
      />
    </View>
  );
}
```

- [ ] **Step 3: Add stepper controls for `Present`, `Hidden`, `Back`, and `Next/Save`**

```tsx
// src/features/quick-panel/calibration/components/CustomCalibrationStepper.tsx
<Button onPress={onMarkHidden}>{t("calibration.markHidden")}</Button>
<Button onPress={onBack} disabled={!canGoBack}>{t("common.back")}</Button>
<Button onPress={onNext} disabled={!canContinue}>{isLast ? t("calibration.saveCustomLayout") : t("common.next")}</Button>
```

- [ ] **Step 4: Branch `CalibrationScreen` by selected calibration mode**

```tsx
// src/features/quick-panel/calibration/CalibrationScreen.tsx
{calibrationMode === "custom-panels" ? (
  <CustomCalibrationCanvas
    screenshot={displayedScreenshot}
    panel={currentPanel}
    onRectChange={setCurrentPanelRect}
  />
) : (
  <CalibrationCanvas
    screenshot={displayedScreenshot}
    rect={displayedRect}
    onImport={importScreenshot}
    onRectChange={setCalibrationRect}
    onContinue={saveCalibration}
  />
)}
```

- [ ] **Step 5: Add wizard copy for each panel and hidden-state guidance**

```ts
// i18next/locales/en.ts
common: {
  back: "Back",
  next: "Next",
},
calibration: {
  markHidden: "Mark hidden",
  panelStepSubtitle: "Place a box around the {{panel}} area, or mark it hidden.",
  reviewCustomLayout: "Review custom layout",
  saveCustomLayout: "Save custom layout",
},
errors: {
  noPanelsToExport: "At least one panel must be visible before export.",
}
```

- [ ] **Step 6: Verify the wizard flow manually**

Run: `npm run lint`

Then run: `npx expo start --web`

Expected: the app launches, custom layout mode opens a per-panel wizard, and save is blocked until every panel is configured as present or hidden.

- [ ] **Step 7: Commit**

```bash
git add src/features/quick-panel/calibration/components/CustomCalibrationCanvas.tsx src/features/quick-panel/calibration/components/CustomCalibrationStepper.tsx src/features/quick-panel/calibration/hooks/useCustomCalibrationFlow.ts src/features/quick-panel/calibration/CalibrationScreen.tsx src/features/quick-panel/calibration/hooks/useCalibrationScreen.ts src/features/quick-panel/calibration/components/CalibrationCanvas.tsx i18next/locales/en.ts i18next/locales/zh.ts
git commit -m "feat: add custom panel calibration wizard"
```

### Task 5: Filter Preview, Export, Docs, And APK Output

**Files:**
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\customize\components\QuickPanelPreview.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\customize\components\PanelSlice.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\customize\components\ExportSurfaces.tsx`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\src\features\quick-panel\customize\services\export-files.ts`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\README.md`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\CALIBRATION_PLAN.md`
- Modify: `E:\Coding_things\Quick-Panel-Background-Cropper\eas.json`

- [ ] **Step 1: Render preview slices only for panels that exist in the runtime preset**

```tsx
// src/features/quick-panel/customize/components/QuickPanelPreview.tsx
{preset.visualOrder.map((id) => {
  const panel = preset.panels[id];
  if (!panel) {
    return null;
  }

  return (
    <PanelSlice
      key={id}
      panel={panel}
      image={image}
      layoutScale={layoutScale}
      originX={panelUnion.x}
      originY={panelUnion.y}
      previewScale={sharedScale}
      transform={sharedTransform}
    />
  );
})}
```

- [ ] **Step 2: Render export surfaces only for present panels and block empty exports**

```tsx
// src/features/quick-panel/customize/components/ExportSurfaces.tsx
{preset.goodLockOrder.map((id) => {
  const panel = preset.panels[id];
  if (!panel) {
    return null;
  }

  return (
    <ExportSurface
      key={id}
      ref={refs[id]}
      panel={panel}
      image={image}
      transform={transform}
      side={side}
    />
  );
})}
```

```ts
// src/features/quick-panel/customize/services/export-files.ts
if (capturedFiles.length === 0) {
  throw new Error(translate("errors.noPanelsToExport"));
}
```

- [ ] **Step 3: Update docs and make preview builds explicitly emit an APK**

```json
// eas.json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

- [ ] **Step 4: Run final verification**

Run: `npm run lint`

Run: `npm test -- --runInBand __tests__/storage.test.ts __tests__/quick-panel-transitions.test.ts`

Run: `eas build --platform android --profile preview`

Expected:
- lint passes
- the affected existing test suites pass, after interface updates if required
- EAS preview build produces an APK artifact suitable for device install

- [ ] **Step 5: Commit**

```bash
git add src/features/quick-panel/customize/components/QuickPanelPreview.tsx src/features/quick-panel/customize/components/PanelSlice.tsx src/features/quick-panel/customize/components/ExportSurfaces.tsx src/features/quick-panel/customize/services/export-files.ts README.md CALIBRATION_PLAN.md eas.json
git commit -m "feat: support custom layout preview and apk build"
```
