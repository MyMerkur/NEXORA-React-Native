import { colors, gradients } from "./colors";
import { typography, fontFamilies, typographyPresets } from "./typography";
import { spacing, radii } from "./spacing";
import { elevation } from "./elevation";
import { duration, easing, spring } from "./motion";
import { iconStrokeWidth, iconSizes } from "./icons";

export const theme = {
  colors,
  gradients,
  typography,
  fontFamilies,
  typographyPresets,
  spacing,
  radii,
  elevation,
  motion: { duration, easing, spring },
  icon: { strokeWidth: iconStrokeWidth, sizes: iconSizes },
};

export type Theme = typeof theme;
