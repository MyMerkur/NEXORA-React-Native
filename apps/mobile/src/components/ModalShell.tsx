import type { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { colors, radii, spacing } from "@nexora/ui-tokens";

export type ModalShellVariant = "sheet" | "center";

interface ModalShellProps {
  visible: boolean;
  onClose: () => void;
  variant?: ModalShellVariant;
  children: ReactNode;
}

// Wraps RN's core `Modal` with the shared visual shell (backdrop, handle bar, card
// surface). Whether screens keep driving this with local `useState` or move to a
// React Navigation modal group is the navigation-architecture decision in Faz 5, #59 —
// this component only standardizes what the shell looks like either way.
export function ModalShell({ visible, onClose, variant = "sheet", children }: ModalShellProps) {
  return (
    <Modal visible={visible} transparent animationType={variant === "sheet" ? "slide" : "fade"} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={variant === "sheet" ? styles.sheetWrap : styles.centerWrap} onPress={(e) => e.stopPropagation()}>
          <View style={variant === "sheet" ? styles.sheet : styles.center}>
            {variant === "sheet" ? <View style={styles.handle} /> : null}
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
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  sheetWrap: {
    width: "100%",
  },
  sheet: {
    backgroundColor: colors.surfaceElevated,
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
    backgroundColor: colors.textTertiary,
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
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
});
