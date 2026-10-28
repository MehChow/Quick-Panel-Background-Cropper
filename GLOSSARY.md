# Quick Panel Background Cropper

QPBC prepares backgrounds for Samsung Good Lock QuickStar from one selected
image. This glossary names the concepts used across its customization paths.

## Panel families

**Panel**: A Quick Panel region that receives its own background, belonging to
the Control or Button family.

**Control**: One of Button box, Media player, Brightness or Volume.
_Avoid_: Button when referring to this family.

**Button**: An individual Quick Settings tile identified by a built-in or custom
label and icon.
_Avoid_: Control when referring to this family.

**Button box**: The Control containing the Quick Settings tile area, distinct
from any individual Button.

**Identifier**: The icon and/or label overlay identifying a Button on its
background.
_Avoid_: Label when referring to the entire overlay.

## Calibration

**Calibration**: A saved description of where the chosen panels lie in an
expanded Quick Panel screenshot.

**Outer area**: The screenshot rectangle enclosing the panels being calibrated.

**Default**: The customization path that derives Control geometry from a preset
and one calibrated outer area.

**Advanced target**: The chosen panel families for individual calibration:
Controls only, Buttons only or Controls + Buttons.

**Combined**: The Advanced Controls + Buttons target.
_Avoid_: Combined mode.

**Grid**: The rows and columns dividing an Advanced outer area into alignment
cells.

**Snap strength**: The Low, Balanced or Strong interaction preference for
alignment attraction during panel adjustment.

## Image composition

**Working image**: The prepared imported image whose dimensions define the
shared coordinate space for background adjustment, preview and export.
_Avoid_: Original when referring to the prepared image.

**Preview proxy**: A temporary smaller copy of the working image used for
display, with the working image's logical dimensions.
_Avoid_: Export source.

**Image transform**: The shared pan and zoom placement of the working image
across the selected layout.

**Image intensity**: The visibility of the image background on Buttons.

**Identifier intensity**: The visibility of the complete identifier overlay,
including its icon and label.

**Appearance draft**: Unconfirmed identifier appearance changes inside the
appearance editor.

**Export**: A square PNG background prepared for one panel and later applied
with QuickStar.
