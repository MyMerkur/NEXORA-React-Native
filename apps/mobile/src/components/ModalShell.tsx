import type { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { radii, spacing } from "@nexora/ui-tokens";
import { useTheme } from "../store/useThemeStore";

export type ModalShellVariant = "sheet" | "center";

interface ModalShellProps {
  visible: boolean;
  onClose: () => void;
  variant?: ModalShellVariant;
  children: ReactNode;
  // Applied to the inner sheet/center surface — mainly for a max/fixed height on
  // taller sheets (thread lists, forms). Most callers don't need this.
  contentStyle?: StyleProp<ViewStyle>;
}

// Wraps RN's core `Modal` with the shared visual shell (backdrop, handle bar, card
// surface). Faz 5 ADR (#59): screens keep driving visibility with local `useState`
// (not a React Navigation modal route) — lower risk for a 17-screen rollout, no
// deep-linking/back-gesture needs identified for these flows. Revisit only if a
// concrete need for either surfaces later.
export function ModalShell({ visible, onClose, variant = "sheet", children, contentStyle }: ModalShellProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType={variant === "sheet" ? "slide" : "fade"} onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable style={variant === "sheet" ? styles.sheetWrap : styles.centerWrap} onPress={(e) => e.stopPropagation()}>
          <View
            style={[
              variant === "sheet" ? styles.sheet : styles.center,
              { backgroundColor: colors.surfaceElevated },
              contentStyle,
            ]}
          >
            {variant === "sheet" ? <View style={[styles.handle, { backgroundColor: colors.textTertiary }]} /> : null}
            {children}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetWrap: {
    width: "100%",
  },
  sheet: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingTop: spacing.sm + 4,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    opacity: 0.5,
    alignSelf: "center",
    marginBottom: spacing.md + 2,
  },
  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  center: {
    width: "100%",
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
});
