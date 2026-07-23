import { useRef, type ReactNode } from "react";
import { Animated, PanResponder, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";

interface SwipeCardProps {
  children: ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const SWIPE_THRESHOLD = 120;
const EXIT_DISTANCE = 500;

export function SwipeCard({ children, onSwipeLeft, onSwipeRight }: SwipeCardProps) {
  const pan = useRef(new Animated.ValueXY()).current;

  function forceSwipe(direction: "left" | "right") {
    Animated.timing(pan, {
      toValue: { x: direction === "right" ? EXIT_DISTANCE : -EXIT_DISTANCE, y: 0 },
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      pan.setValue({ x: 0, y: 0 });
      if (direction === "right") {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    });
  }

  function resetPosition() {
    Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 8,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe("right");
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe("left");
        } else {
          resetPosition();
        }
      },
    }),
  ).current;

  const rotate = pan.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ["-12deg", "0deg", "12deg"],
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.card, { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }] }]}
      >
        {children}
      </Animated.View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.rejectButton} onPress={() => forceSwipe("left")}>
          <Text style={styles.rejectButtonText}>Geç</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptButton} onPress={() => forceSwipe("right")}>
          <Text style={styles.acceptButtonText}>İlgileniyorum</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: spacing.lg,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  rejectButton: {
    flex: 1,
    alignItems: "center",
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  rejectButtonText: {
    color: colors.danger,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  acceptButton: {
    flex: 1,
    alignItems: "center",
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    backgroundColor: colors.accentGold,
  },
  acceptButtonText: {
    color: colors.background,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
