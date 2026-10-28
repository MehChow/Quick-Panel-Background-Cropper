# Design and preservation notes

Approved Charcoal + Amber theme, 2026-10-03. Static design artifacts only.

## Design read

A native task-oriented utility for Samsung users, using the approved QPBC design system. DESIGN_VARIANCE 3, MOTION_INTENSITY 2, VISUAL_DENSITY 4. Restraint, image/calibration space and clear reachable actions take priority. The design-taste-frontend skill's landing-page patterns were adapted to this brief. No marketing sections, new routes, Settings, saved-layout library or My Icons were introduced.

The six approved screens and four design-system boards retain their IDs within the [organized canvas](canvas-organization/README.md). Current screens are grouped into fourteen tinted flow/state frames below the foundations. Thirteen obsolete or duplicate canvas review boards were removed; all historical PNGs remain on disk. Group colors organize the canvas and do not change the approved screen theme. Combined import imUDj was absent before cleanup; its existing editable review copy GxffP was retained as the current screen. Parent/row/group mapping is recorded in manifest.json.

## Four-path behavior

Default has only screenshot import and one outer Controls rectangle. All Advanced targets retain import, outer area, required 1–8 grid counts, guided adjustment and review. Controls-only/Combined can select Controls; Buttons-only/Combined select Buttons and custom icons. Both families are required for Combined. Disabled Controls retain geometry.

Guided Controls order is Button box, Brightness, Volume, Media player, skipping disabled Controls. Selected Buttons follow selection order. Next must atomically commit the current gesture before validating bounds and completed-panel overlap. Purple active Controls, blue active Buttons, orange completed geometry and green outer bounds remain distinct. Low/Balanced/Strong snapping and existing haptics remain; no Off choice is added.

Calibration examples crop the maintained Combined flow capture through image-fill transforms. Geometry layers and handles remain editable. These examples illustrate families and states, not replacement runtime calibration data. Twelve-pixel visual handles require expanded 44-point hit areas in implementation without overlapping adjacent actions.

Saved calibration may enter C01 directly. Recalibration remains available. Last successfully exported mode/target still preselects entry choices. Selection previews return to the same selection state.

## Customize and identifier ownership

Default/Controls-only have image replacement, pan/pinch, reset and export, without Button intensity or identifier controls. Buttons-only and Combined retain separately saved Button image intensity; identifier settings remain shared.

Content is Both/Icon/None. Appearance opens the existing transactional editor. Position opens a focused inspector state within Customize, rather than a new route. None disables both Appearance and Position and removes all identifiers. Available position axes follow real calibrated geometry, and the overview only summarizes them.

Both includes the glyph and label; Icon removes the label; None removes the complete overlay. The source preview shapes and image fills use one shared coordinate model and transform. Custom Shazam uses a stable generic star icon as a design example; it creates no new icon ID. The custom icon sheets show all 32 preset and 28 generic choices from the current catalog.

Appearance contains a focused Button with previous/next, color wheel, hex input, Brightness/Intensity, neutral Light/Dark, overall preview and Confirm/Cancel. Light/Dark is identifier-neutral data within the dark app theme. Glyph brightness affects the glyph; identifier intensity affects the complete overlay. Confirm persists; Cancel, backdrop and Android Back discard. Overall-preview Back returns to the same draft, active tab and focused Button. Keep the picker mounted but hidden from display, touch and accessibility during preview, retaining HSV/alpha and zero-brightness hue. Dismiss the keyboard first and restore Customize at the same transform.

## Working images, exports and storage

Preview and export retain working-image coordinates and one transform. A preview proxy changes the URI only; exports never use the smaller proxy. Preserve bounded 2048-edge preparation, actual orientation/dimensions, transparency, working-source ownership and previous selection after cancellation or failure.

Result illustrates centered square PNG content. It is static design imagery, not an execution of the production renderer. Implementation must keep 1024×1024 PNGs, centered square source areas and sequential image/identifier readiness. Controls export in Good Lock order: Button box, Media player, Brightness, Volume; Buttons follow selection order. Combined uses one contiguous family-aware sequence. Capture failure cleans run-owned captures and prevents partial Result. A media save failure can leave earlier gallery writes; do not promise rollback.

Keep the quick-panel MMKV instance, current storage keys and compatibility parsers. Preserve the four calibration branches, shared identifier settings, separately persisted Combined image intensity, global snap preference, last-exported choices, help acknowledgement and announcement acknowledgement. No reset flow is introduced. Preserve URI cache ownership; do not clear unowned images.

## System and external surfaces

The system-handoff board covers photo picker, media permission, keyboard, Good Lock, Samsung store, native startup and empty Result redirection. Their visual UI remains owned by Android or the external app. Keyboard blocks are footprint annotations, not custom keyboards. System prompts are not redesigned. Native splash is a reference to app.json (#09090b and 76-wide appicon.png). The current release announcement is 1.7.4, matching app.json and its active descriptor.

## Responsive, localization and accessibility review

412×915 is the main reference. 360×740 examples show grid controls and upper/lower editor scroll positions with Confirm/Cancel pinned. 768×915 Fold examples center a column with 520 points of usable content. Keyboard samples keep search/custom label/hex fields and actions reachable. Actual native insets remain authoritative.

Maintain 44-point action targets, 54-point primaries and 56-point concern rows. Expose radio/switch selection, adjustable label/value/range, disabled/busy state and meaningful icon labels to TalkBack. Hide the underlay from modal accessibility. Gesture handles and chip removal need expanded hit areas. Focus and scroll behavior are annotations to verify on-device during implementation.

Spanish long-label and Traditional Chinese Noto Sans TC samples retain type size. English design copy and those sample translations are provisional; synchronize finalized copy in all three existing locales before implementation ships. No language switcher is added.

Press feedback 120ms, inspector transition 200ms, sheet 280ms; reduced motion 0ms. Direct calibration gestures do not gain decorative motion.

## Static verification

Resolved instances and enabled-node bounds were rechecked after the organization layout committed. All 134 current screens and the system annotation are present; no broken refs, enabled-node clipping, overlapping group frames or unfinished placeholders remain. All fifteen wrappers and the overview were visually inspected. Individual screen PNGs remain 2×; organization group PNGs are 1× and the full 4000×7179 overview is 0.5×. See the latest [organization verification](canvas-organization/verification.json).

The core text contrast pairs use the approved design-system values. This pass verifies static canvas structure and imagery. It does not claim device QA, runtime gesture performance, TalkBack traversal, dynamic type coverage or renderer/export equality. Production source, dependencies and app configuration remain unchanged.
