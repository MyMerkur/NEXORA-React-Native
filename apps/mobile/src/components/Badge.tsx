import { StyleSheet, Text, View } from "react-native";
import { colors, fontFamilies, radii, spacing } from "@nexora/ui-tokens";

export type BadgeVariant = "neutral" | "blue" | "gold" | "success" | "warning" | "danger";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const VARIANT_STYLES: Record<BadgeVariant, { background: string; text: string }> = {
  neutral: { background: colors.surfaceElevated, text: colors.textSecondary },
  blue: { background: "rgba(61, 139, 255, 0.14)", text: colors.accentBlue },
  gold: { background: "rgba(212, 175, 106, 0.16)", text: colors.accentGold },
  success: { background: "rgba(61, 214, 140, 0.14)", text: colors.success },
  warning: { background: "rgba(245, 166, 35, 0.14)", text: colors.warning },
  danger: { background: "rgba(255, 92, 92, 0.14)", text: colors.danger },
};

export function Badge({ label, variant = "neutral" }: BadgeProps) {
  const variantColors = VARIANT_STYLES[variant];
  return (
    <View style={[styles.badge, { backgroundColor: variantColors.background }]}>
      <Text style={[styles.label, { color: variantColors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm + 4,
  },
  label: {
    fontFamily: fontFamilies.semibold,
    fontSize: 12,
  },
});
