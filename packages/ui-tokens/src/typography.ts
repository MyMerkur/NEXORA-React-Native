// v1 kept unchanged (fontFamily: "System") for screens not yet migrated — see colors.ts for the
// same rationale. v2 introduces real Inter weights (native-linked, see apps/mobile/assets/fonts)
// and named presets; migration issues (Faz 5, #62-#66) switch call sites to `typographyPresets`.
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

export const fontFamilies = {
  regular: "Inter-Regular",
  medium: "Inter-Medium",
  semibold: "Inter-SemiBold",
  bold: "Inter-Bold",
} as const;

interface TypographyPreset {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: "uppercase";
}

export const typographyPresets = {
  display: { fontFamily: fontFamilies.bold, fontSize: 32, lineHeight: 40 },
  h1: { fontFamily: fontFamilies.semibold, fontSize: 24, lineHeight: 32 },
  h2: { fontFamily: fontFamilies.semibold, fontSize: 20, lineHeight: 28 },
  h3: { fontFamily: fontFamilies.semibold, fontSize: 17, lineHeight: 24 },
  bodyLarge: { fontFamily: fontFamilies.regular, fontSize: 16, lineHeight: 24 },
  body: { fontFamily: fontFamilies.regular, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fontFamilies.regular, fontSize: 12, lineHeight: 16 },
  label: {
    fontFamily: fontFamilies.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
} satisfies Record<string, TypographyPreset>;
