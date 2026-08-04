export const duration = {
  fast: 150,
  base: 250,
  slow: 400,
} as const;

// Cubic-bezier control points, meant for react-native-reanimated's Easing.bezier(...).
// `decelerate` is the design system's `easeOut` (spec §6.1) — used for press feedback,
// content fade-up, and the one-shot locked-card shimmer.
export const easing = {
  standard: [0.4, 0, 0.2, 1],
  decelerate: [0.16, 1, 0.3, 1],
  accelerate: [0.4, 0, 1, 1],
} as const;

// Spring physics for bottom sheets, the heart/like pop, and card press feedback
// (spec §6.1 — CSS equivalent cubic-bezier(.34,1.56,.64,1), a slight overshoot/bounce).
// Pass directly as the second arg to reanimated's withSpring(toValue, spring).
export const spring = {
  damping: 12,
  stiffness: 180,
  mass: 0.9,
} as const;
