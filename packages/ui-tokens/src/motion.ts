export const duration = {
  fast: 150,
  base: 250,
  slow: 400,
} as const;

// Cubic-bezier control points, meant for react-native-reanimated's Easing.bezier(...)
// once Issue #60 (animation layer) adds the dependency — kept as plain data here so
// this package stays dependency-free.
export const easing = {
  standard: [0.4, 0, 0.2, 1],
  decelerate: [0, 0, 0.2, 1],
  accelerate: [0.4, 0, 1, 1],
} as const;
