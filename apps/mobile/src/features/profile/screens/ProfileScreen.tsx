import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
import { getMe, type UserProfile } from "../../../services/profileApi";
import { getUnreadCount } from "../../../services/notificationApi";
import { ShowcaseTab } from "../components/ShowcaseTab";
import { CareerTab } from "../components/CareerTab";
import { NotificationsModal } from "../../notifications/components/NotificationsModal";

type ProfileTab = "showcase" | "career";

export function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("showcase");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getMe()
      .then(setProfile)
      .catch((err) => setError(getApiErrorMessage(err, "Profil yüklenemedi")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getUnreadCount()
      .then(setUnreadCount)
      .catch(() => undefined);
  }, [notificationsVisible]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accentGold} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? "Profil yüklenemedi"}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.notificationsButton} onPress={() => setNotificationsVisible(true)}>
        <Text style={styles.notificationsButtonText}>🔔 Bildirimler</Text>
        {unreadCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
          </View>
        ) : null}
      </TouchableOpacity>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "showcase" && styles.tabButtonActive]}
          onPress={() => setActiveTab("showcase")}
        >
          <Text style={[styles.tabText, activeTab === "showcase" && styles.tabTextActive]}>Vitrin</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "career" && styles.tabButtonActive]}
          onPress={() => setActiveTab("career")}
        >
          <Text style={[styles.tabText, activeTab === "career" && styles.tabTextActive]}>Kariyer</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "showcase" ? (
        <ShowcaseTab profile={profile} onUpdated={setProfile} />
      ) : (
        <CareerTab profile={profile} onUpdated={setProfile} />
      )}

      <NotificationsModal visible={notificationsVisible} onClose={() => setNotificationsVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: colors.danger,
  },
  notificationsButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    margin: spacing.md,
    marginBottom: 0,
  },
  notificationsButtonText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  badge: {
    marginLeft: spacing.xs,
    minWidth: 18,
    height: 18,
    borderRadius: radii.pill,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: typography.weights.semibold,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: colors.accentGold,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  tabTextActive: {
    color: colors.accentGold,
    fontWeight: typography.weights.semibold,
  },
});
