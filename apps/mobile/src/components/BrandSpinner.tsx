import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useTheme } from "../store/useThemeStore";

interface BrandSpinnerProps {
  size?: number;
}

// Branded loading indicator (spec §6.2, "özel yenile ikonu") — the brand mark shape
// (spec §1's `.mark` square) spinning, used anywhere the app is waiting on a server
// round-trip that isn't a content list (payment session creation, polling for
// confirmation). Not a generic ActivityIndicator, and not the one-shot manual-refresh
// animation the spec describes for a tap-to-refresh icon — this loops continuously
// for as long as the caller keeps it mounted.
export function BrandSpinner({ size = 22 }: BrandSpinnerProps) {
  const { colors } = useTheme();
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(720, { duration: 700, easing: Easing.out(Easing.cubic) }), -1, false);
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[
          { width: size, height: size, borderRadius: size * 0.26, backgroundColor: colors.accentGoldStrong },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
