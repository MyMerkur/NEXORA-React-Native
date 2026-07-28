import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, type DimensionValue } from "react-native";
import { radii } from "@nexora/ui-tokens";
import { useTheme } from "../store/useThemeStore";

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: object;
}

// Simple opacity-pulse shimmer built on RN's core Animated API — deliberately not
// react-native-reanimated, since a JS-thread interval timer is fine for a non-gesture,
// non-interactive loop like this one.
export function Skeleton({ width = "100%", height = 14, radius = radii.sm, style }: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.base, { width, height, borderRadius: radius, opacity, backgroundColor: colors.surfaceElevated }, style]}
    />
  );
}

interface SkeletonRowProps {
  avatarSize?: number;
}

export function SkeletonRow({ avatarSize = 44 }: SkeletonRowProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
      <Skeleton width={avatarSize} height={avatarSize} radius={avatarSize / 2} />
      <View style={styles.lines}>
        <Skeleton width="70%" height={11} />
        <Skeleton width="45%" height={11} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {},
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: radii.md + 2,
    padding: 16,
  },
  lines: {
    flex: 1,
    gap: 8,
  },
});
