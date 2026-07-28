import { Image, StyleSheet, Text, View } from "react-native";
import { BadgeCheck } from "lucide-react-native";
import { colors, fontFamilies } from "@nexora/ui-tokens";

export type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: AvatarSize;
  verified?: boolean;
}

const SIZE_PX: Record<AvatarSize, number> = { sm: 32, md: 48, lg: 72 };
const FONT_SIZE: Record<AvatarSize, number> = { sm: 12, md: 16, lg: 24 };
const BADGE_SIZE: Record<AvatarSize, number> = { sm: 14, md: 18, lg: 24 };

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

export function Avatar({ name, imageUrl, size = "md", verified = false }: AvatarProps) {
  const dimension = SIZE_PX[size];
  const badgeSize = BADGE_SIZE[size];

  return (
    <View style={{ width: dimension, height: dimension }}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.circle, { width: dimension, height: dimension }]}
          accessibilityLabel={name}
        />
      ) : (
        <View style={[styles.circle, styles.fallback, { width: dimension, height: dimension }]}>
          <Text style={[styles.initials, { fontSize: FONT_SIZE[size] }]}>{getInitials(name)}</Text>
        </View>
      )}
      {verified ? (
        <View style={[styles.badge, { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2 }]}>
          <BadgeCheck size={badgeSize - 4} color={colors.textOnAccent} strokeWidth={2} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderRadius: 999,
  },
  fallback: {
    backgroundColor: colors.accentBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontFamily: fontFamilies.semibold,
    color: "#FFFFFF",
  },
  badge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: colors.accentGold,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
