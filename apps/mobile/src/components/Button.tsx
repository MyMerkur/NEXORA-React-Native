import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";
import { colors, fontFamilies, radii, spacing } from "@nexora/ui-tokens";

export type ButtonVariant = "primary" | "gold" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const SIZE_STYLES: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; fontSize: number; radius: number }> = {
  sm: { paddingVertical: 9, paddingHorizontal: spacing.md, fontSize: 13, radius: radii.sm },
  md: { paddingVertical: 13, paddingHorizontal: spacing.lg, fontSize: 14, radius: radii.md },
  lg: { paddingVertical: 16, paddingHorizontal: spacing.xl, fontSize: 15, radius: radii.md + 2 },
};

const VARIANT_COLORS: Record<
  ButtonVariant,
  { background: string; backgroundPressed: string; backgroundDisabled: string; text: string; border?: string }
> = {
  primary: {
    background: colors.accentBlue,
    backgroundPressed: colors.accentBluePressed,
    backgroundDisabled: colors.accentBlueDisabled,
    text: "#FFFFFF",
  },
  gold: {
    background: colors.accentGold,
    backgroundPressed: colors.accentGoldPressed,
    backgroundDisabled: colors.accentGoldDisabled,
    text: colors.textOnAccent,
  },
  secondary: {
    background: "transparent",
    backgroundPressed: colors.surfaceElevated,
    backgroundDisabled: "transparent",
    text: colors.textPrimary,
    border: colors.borderSubtle,
  },
  ghost: {
    background: "transparent",
    backgroundPressed: "rgba(61, 139, 255, 0.08)",
    backgroundDisabled: "transparent",
    text: colors.accentBlue,
  },
  danger: {
    background: "transparent",
    backgroundPressed: "rgba(255, 92, 92, 0.08)",
    backgroundDisabled: "transparent",
    text: colors.danger,
    border: "rgba(255, 92, 92, 0.35)",
  },
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const sizeStyle = SIZE_STYLES[size];
  const variantColors = VARIANT_COLORS[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          borderRadius: sizeStyle.radius,
          backgroundColor: isDisabled
            ? variantColors.backgroundDisabled
            : pressed
              ? variantColors.backgroundPressed
              : variantColors.background,
          borderWidth: variantColors.border ? 1.5 : 0,
          borderColor: variantColors.border,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantColors.text} />
      ) : (
        <Text
          style={[
            styles.label,
            { fontSize: sizeStyle.fontSize, color: variantColors.text },
            isDisabled && styles.labelDisabled,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
  },
  label: {
    fontFamily: fontFamilies.semibold,
  },
  labelDisabled: {
    opacity: 0.5,
  },
});
