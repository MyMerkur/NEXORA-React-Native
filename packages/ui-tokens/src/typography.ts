// v1 kept unchanged (fontFamily: "System") — raw Text elements using `typography.sizes`/
// `weights` directly (not through a component) still render in the system font; only
// `typographyPresets`/`fontFamilies` consumers pick up the three v2 families below.
export const typography = {
  fontFamily: "System",
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  weights: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
};

// Design system v2 (spec §2) — three families, strict roles:
//  - Manrope: default UI/body font (buttons, form labels, body copy, card text).
//  - Fraunces: brand/emotional weight only (screen titles, names, prices/totals).
//  - IBM Plex Mono: small structural/meta data only (eyebrow, timestamp, hashtag
//    badges) — v1 overused mono for form labels ("sert" feedback); that ratio is
//    deliberately not being repeated, see spec's v1→v2 correction note.
// Static font files live in apps/mobile/assets/fonts, linked via react-native.config.js.
export const fontFamilies = {
  regular: "Manrope-Regular",
  medium: "Manrope-Medium",
  semibold: "Manrope-SemiBold",
  bold: "Manrope-Bold",
  extrabold: "Manrope-ExtraBold",
  serifRegular: "Fraunces-Regular",
  serifMedium: "Fraunces-Medium",
  serifSemibold: "Fraunces-SemiBold",
  mono: "PlexMono-Regular",
  monoMedium: "PlexMono-Medium",
} as const;

interface TypographyPreset {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: "uppercase";
}

export const typographyPresets = {
  display: { fontFamily: fontFamilies.serifMedium, fontSize: 30, lineHeight: 38 },
  h1: { fontFamily: fontFamilies.serifMedium, fontSize: 19.5, lineHeight: 26 },
  h2: { fontFamily: fontFamilies.serifMedium, fontSize: 17.5, lineHeight: 24 },
  bodyLarge: { fontFamily: fontFamilies.regular, fontSize: 16, lineHeight: 24 },
  body: { fontFamily: fontFamilies.regular, fontSize: 13.5, lineHeight: 20 },
  bodySmall: { fontFamily: fontFamilies.medium, fontSize: 11.5, lineHeight: 16 },
  label: {
    fontFamily: fontFamilies.bold,
    fontSize: 9.75,
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  button: { fontFamily: fontFamilies.extrabold, fontSize: 12.75, lineHeight: 16 },
  // Eyebrow/hashtag/timestamp — the only place IBM Plex Mono is allowed (spec §2).
  meta: {
    fontFamily: fontFamilies.mono,
    fontSize: 9.5,
    lineHeight: 13,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
} satisfies Record<string, TypographyPreset>;
