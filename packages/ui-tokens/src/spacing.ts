export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Deliberately non-uniform per element type (spec §3) — one of the main techniques
// for avoiding a "generic AI UI kit" look; do not collapse these to a single radius.
export const radii = {
  sm: 6, // icon: small icon backgrounds, checkbox-like controls
  md: 10, // field: inputs, small tags, grid image squares
  lg: 16, // card: cards, job cards, result cards
  xl: 20, // sheet: bottom sheet top corners, plan cards
  pill: 999, // pill: primary CTAs, badges/pills
};
