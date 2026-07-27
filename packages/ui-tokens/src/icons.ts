// Icon library decision (Faz 5, #57): `lucide-react-native`, backed by `react-native-svg`.
// Reasons: SVG-based (no native font linking like react-native-vector-icons needs),
// consistent stroke-based style that fits the Dark & Gold premium identity, actively
// maintained, tree-shakeable (only imported icons ship). No custom/hand-drawn icon set —
// see docs/PROJECT_PLAN.md, Faz 5 non-goals.
//
// Usage in screens: import icons directly from "lucide-react-native", e.g.
//   import { Search } from "lucide-react-native";
//   <Search size={iconSizes.md} color={colors.textPrimary} strokeWidth={iconStrokeWidth} />
export const iconStrokeWidth = 1.75;

export const iconSizes = {
  sm: 16,
  md: 24,
  lg: 32,
} as const;
