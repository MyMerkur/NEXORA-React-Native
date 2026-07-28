import type { ComponentType } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, fontFamilies, radii, spacing } from "@nexora/ui-tokens";
import { Button } from "./Button";

// lucide-react-native doesn't export its `LucideProps` type publicly, so this
// mirrors the subset of it every icon actually needs here.
interface IconComponentProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

interface EmptyStateProps {
  icon: ComponentType<IconComponentProps>;
  title: string;
  description?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
}

export function EmptyState({ icon: Icon, title, description, ctaLabel, onCtaPress }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon size={26} color={colors.textTertiary} strokeWidth={1.6} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {ctaLabel && onCtaPress ? (
        <Button label={ctaLabel} onPress={onCtaPress} size="sm" style={styles.cta} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: spacing.xxl + 8,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.lg,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md + 2,
  },
  title: {
    fontFamily: fontFamilies.semibold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  description: {
    fontSize: 13.5,
    lineHeight: 19,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.md + 2,
  },
  cta: {
    marginTop: spacing.xs,
  },
});
