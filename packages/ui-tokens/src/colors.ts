// v1 tokens are kept unchanged so screens not yet migrated to the Faz 5 design
// system (see docs/PROJECT_PLAN.md — Faz 5) keep compiling and rendering as before.
// v2 additions live alongside them; per-screen migration issues switch call sites
// to the new semantic/state tokens and eventually retire the v1-only keys.
export const colors = {
  // v1
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

  // v2 — surfaces
  surfaceGlass: "rgba(255, 255, 255, 0.06)",
  overlay: "rgba(6, 6, 8, 0.72)",

  // v2 — borders
  borderSubtle: "rgba(255, 255, 255, 0.08)",
  borderStrong: "rgba(255, 255, 255, 0.16)",

  // v2 — text
  textTertiary: "#6E6E73",
  textOnAccent: "#0B0B0C",

  // v2 — accent state variants
  accentBlueHover: "#5C9EFF",
  accentBluePressed: "#2E6FD9",
  accentBlueDisabled: "rgba(61, 139, 255, 0.35)",
  accentGoldHover: "#E0C084",
  accentGoldPressed: "#B8934F",
  accentGoldDisabled: "rgba(212, 175, 106, 0.35)",

  // v2 — semantic state variants
  dangerHover: "#FF7A7A",
  dangerPressed: "#E14545",
  successHover: "#57E09C",
  successPressed: "#2BB873",
  warning: "#F5A623",
  warningHover: "#F7B84D",
  warningPressed: "#D6900F",
} as const;

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
