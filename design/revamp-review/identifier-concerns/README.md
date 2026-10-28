# Home and identifier concerns, revision 3

Pen.dev visual refinement on 2026-10-03. The charcoal/amber direction continues;
application code and the design system remain unchanged.

## Home

Removed both explanatory strings: the introduction sentence and the
"One photo across your panel" caption. Home now contains the headline,
the existing applied Quick Panel example, and Start customizing. The preview
uses the space released by the removed copy.

## Identifier responsibilities

The Identifiers inspector is an overview with three distinct concern frames:

| Concern | Control | Responsibility |
| --- | --- | --- |
| Content | Both / Icon / None | Choose identifier content only |
| Appearance | Labeled row with current glyph-color swatch | Open the existing transactional appearance editor |
| Position | Labeled row with current position summary | Open a focused positioning inspector |

The focused Position inspector contains its own back action, Horizontal/Vertical
axis selector and active-axis slider. It has no content selector or appearance
controls. Its back action returns to the identifier overview within Customize;
it is a panel state, not a new route. Export remains reachable. Position changes
retain the existing persistence behavior; this adds no save transaction.

Content None disables both Appearance and Position. Geometry still controls
which position axes are available. The appearance editor retains glyph color,
identifier intensity, Light/Dark neutral background, overall preview and its
existing Confirm/Cancel behavior. Image intensity stays in the separate Image
inspector and applies to Buttons. User settings retain their existing shared
or per-target ownership; distinct view groups do not create duplicate settings.

These three frames describe future component boundaries without introducing a
design system now. The positioning inspector owns axis selection and slider
presentation; the overview only shows the entry and current summary.

## Artifacts

| PNG | Editable canvas node |
| --- | --- |
| `home.png` | EeI0F |
| `customize-image.png` | Ebb5z |
| `identifier-overview.png` | CKKZM |
| `identifier-position.png` | vWVmS |
| `review-board.png` | X7P7L |

Document: `C:/Users/Meh Chow/.pencil/documents/3a4c797f-62d3-46d2-a08a-dd33d6fadb46/pencil-new.pen`.
Revision 3's review board sits below revision 2. Earlier boards remain snapshots;
continue edits in the individual screen nodes.

## Verification

Pen.dev found zero visible layout problems across the updated Home, Image
inspector, identifier overview, focused position inspector and review board.
Screenshots and exported PNGs were visually inspected. Inspector selectors now
have 44-pixel inner targets, with 56-pixel Appearance and Position rows.
Exports use 2x scale. These are static visual drafts, not runtime/device QA.
Remaining screens, interaction states, responsive cases and all three locales
still belong to the later implementation and design passes.
