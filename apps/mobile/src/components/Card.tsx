import { Platform, StyleSheet, View, type StyleProp, type ViewStyle, type ViewProps } from "react-native";
import { colors, elevation, radii, spacing } from "@nexora/ui-tokens";

export type CardVariant = "flat" | "elevated" | "glass";

interface CardProps extends ViewProps {
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
}

// "glass" gives the translucent surface + border from the glassmorphism token; it does not
// apply a real backdrop blur — that needs a native blur dependency (e.g. @react-native-community/blur),
// which isn't added yet. Screens that need the full blurred effect should layer that in when built (Faz 5, #62-#66).
export function Card({ variant = "flat", style, children, ...rest }: CardProps) {
  return (
    <View style={[styles.base, VARIANT_STYLES[variant], style]} {...rest}>
      {children}
    </View>
  );
}

const VARIANT_STYLES = StyleSheet.create({
  flat: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  elevated: {
    backgroundColor: colors.surfaceElevated,
    ...Platform.select<ViewStyle>({
      ios: elevation.medium.ios,
      android: elevation.medium.android,
    }),
  },
  glass: {
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
});

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
});
