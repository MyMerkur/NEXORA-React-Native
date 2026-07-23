export const colors = {
  background: "#121212",
  surface: "#1C1C1E",
  surfaceElevated: "#242426",
  border: "rgba(255, 255, 255, 0.08)",
  textPrimary: "#F5F5F7",
  textSecondary: "#A1A1A6",
  accentBlue: "#3D8BFF",
  accentGold: "#D4AF6A",
  danger: "#FF5C5C",
  success: "#3DD68C",
} as const;

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

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
};

export const theme = { colors, typography, spacing, radii };

export type Theme = typeof theme;
