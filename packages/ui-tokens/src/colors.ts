// v1 tokens are kept unchanged so screens not yet migrated to the Faz 5 design
// system (see docs/PROJECT_PLAN.md — Faz 5) keep compiling and rendering as before.
// v2 additions live alongside them; per-screen migration issues switch call sites
// to the new semantic/state tokens and eventually retire the v1-only keys.
//
// Accent/semantic colors (brand blue/gold, danger/success/warning) stay constant
// across light and dark — only surfaces, borders and text vary by theme (#73).
const sharedColors = {
  accentBlue: "#3D8BFF",
  accentGold: "#D4AF6A",
  danger: "#FF5C5C",
  success: "#3DD68C",
  textOnAccent: "#0B0B0C",

  accentBlueHover: "#5C9EFF",
  accentBluePressed: "#2E6FD9",
  accentBlueDisabled: "rgba(61, 139, 255, 0.35)",
  accentGoldHover: "#E0C084",
  accentGoldPressed: "#B8934F",
  accentGoldDisabled: "rgba(212, 175, 106, 0.35)",

  dangerHover: "#FF7A7A",
  dangerPressed: "#E14545",
  successHover: "#57E09C",
  successPressed: "#2BB873",
  warning: "#F5A623",
  warningHover: "#F7B84D",
  warningPressed: "#D6900F",
} as const;

const darkColors = {
  ...sharedColors,
  // v1
  background: "#121212",
  surface: "#1C1C1E",
  surfaceElevated: "#242426",
  border: "rgba(255, 255, 255, 0.08)",
  textPrimary: "#F5F5F7",
  textSecondary: "#A1A1A6",

  // v2
  surfaceGlass: "rgba(255, 255, 255, 0.06)",
  overlay: "rgba(6, 6, 8, 0.72)",
  borderSubtle: "rgba(255, 255, 255, 0.08)",
  borderStrong: "rgba(255, 255, 255, 0.16)",
  textTertiary: "#6E6E73",
} as const;

const lightColors = {
  ...sharedColors,
  // v1
  background: "#F7F7F8",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  border: "rgba(0, 0, 0, 0.08)",
  textPrimary: "#16161A",
  textSecondary: "#5B5B63",

  // v2
  surfaceGlass: "rgba(0, 0, 0, 0.04)",
  overlay: "rgba(20, 20, 22, 0.45)",
  borderSubtle: "rgba(0, 0, 0, 0.08)",
  borderStrong: "rgba(0, 0, 0, 0.14)",
  textTertiary: "#8B8B93",
} as const;

export const colorSchemes = { dark: darkColors, light: lightColors } as const;

// Widened (non-literal) shape shared by both variants — use this, not `typeof colors`,
// to type anything that accepts either scheme's palette (e.g. useTheme()'s return value).
export type ThemeColors = { [K in keyof typeof darkColors]: string };

// Static, dark-only export kept for screens not yet on useTheme() (see #73) — same
// shape either variant would produce, so switching a call site over later is a
// no-op besides the import itself.
export const colors = darkColors;

export const gradients = {
  goldSheen: {
    angle: 135,
    stops: ["#D4AF6A", "#F0D9A8", "#B8934F"],
  },
  glass: {
    angle: 180,
    stops: ["rgba(255, 255, 255, 0.10)", "rgba(255, 255, 255, 0.02)"],
  },
} as const;
