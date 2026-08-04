import { Pressable, StyleSheet, Text } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from "react-native-reanimated";
import { fontFamilies } from "@nexora/ui-tokens";
import { useTheme } from "../store/useThemeStore";

interface HeartButtonProps {
  liked: boolean;
  count: number;
  onToggle: () => void;
  size?: number;
}

// Heart path is copied verbatim from the design spec's HEART_SVG (§7.11) — not a
// lucide icon, this exact silhouette is the approved one.
const HEART_PATH =
  "M12 21s-7.5-4.6-10-9.3C.4 8 2 4 6 4c2.2 0 3.7 1.3 4.6 2.6C11.4 5.3 12.9 4 15 4c4 0 5.6 4 4 7.7C19.5 16.4 12 21 12 21z";

// Spring pop (spec §6.2): scale 1 → 1.35 → 1 on tap, snappier than the shared spring
// token (damping 6/stiffness 300) so the "like" feels immediate rather than floaty.
export function HeartButton({ liked, count, onToggle, size = 16 }: HeartButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  function handlePress() {
    scale.value = withSequence(
      withSpring(1.35, { damping: 6, stiffness: 300 }),
      withSpring(1, { damping: 6, stiffness: 300 }),
    );
    onToggle();
  }

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const color = liked ? colors.danger : colors.textTertiary;

  return (
    <Pressable style={styles.row} onPress={handlePress} hitSlop={8}>
      <Animated.View style={iconStyle}>
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d={HEART_PATH} fill={liked ? color : "none"} stroke={color} strokeWidth={liked ? 0 : 1.75} />
        </Svg>
      </Animated.View>
      <Text style={[styles.count, { color: colors.textTertiary }]}>{count}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  count: {
    fontFamily: fontFamilies.medium,
    fontSize: 10.5,
  },
});
