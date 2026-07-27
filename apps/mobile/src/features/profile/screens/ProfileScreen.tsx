import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { EMPLOYER_ROLES } from "@nexora/shared-constants";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
import { getMe, type UserProfile } from "../../../services/profileApi";
import { getUnreadCount } from "../../../services/notificationApi";
import { getUnreadThreadCount } from "../../../services/inboxApi";
import { ShowcaseTab } from "../components/ShowcaseTab";
import { CareerTab } from "../components/CareerTab";
import { NotificationsModal } from "../../notifications/components/NotificationsModal";
import { InboxModal } from "../../inbox/components/InboxModal";
import { SubscriptionModal } from "../../subscription/components/SubscriptionModal";
import { CoursesModal } from "../../courses/components/CoursesModal";
import { BusinessModal } from "../../business/components/BusinessModal";
import { EventsModal } from "../../events/components/EventsModal";

type ProfileTab = "showcase" | "career";

export function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("showcase");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [inboxVisible, setInboxVisible] = useState(false);
  const [unreadThreadCount, setUnreadThreadCount] = useState(0);
  const [subscriptionVisible, setSubscriptionVisible] = useState(false);
  const [coursesVisible, setCoursesVisible] = useState(false);
  const [businessVisible, setBusinessVisible] = useState(false);
  const [eventsVisible, setEventsVisible] = useState(false);

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

  useEffect(() => {
    getUnreadThreadCount()
      .then(setUnreadThreadCount)
      .catch(() => undefined);
  }, [inboxVisible]);

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
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.notificationsButton} onPress={() => setInboxVisible(true)}>
          <Text style={styles.notificationsButtonText}>💬 Mesajlar</Text>
          {unreadThreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadThreadCount > 9 ? "9+" : unreadThreadCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationsButton} onPress={() => setNotificationsVisible(true)}>
          <Text style={styles.notificationsButtonText}>🔔 Bildirimler</Text>
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationsButton} onPress={() => setSubscriptionVisible(true)}>
          <Text style={styles.notificationsButtonText}>💳 Aboneliğim</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationsButton} onPress={() => setCoursesVisible(true)}>
          <Text style={styles.notificationsButtonText}>🎓 Kurslar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationsButton} onPress={() => setEventsVisible(true)}>
          <Text style={styles.notificationsButtonText}>🎫 Etkinlikler</Text>
        </TouchableOpacity>
        {(EMPLOYER_ROLES as readonly string[]).includes(profile.role) ? (
          <TouchableOpacity style={styles.notificationsButton} onPress={() => setBusinessVisible(true)}>
            <Text style={styles.notificationsButtonText}>💼 İşletme</Text>
          </TouchableOpacity>
        ) : null}
      </View>

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
      <InboxModal visible={inboxVisible} onClose={() => setInboxVisible(false)} />
      <SubscriptionModal visible={subscriptionVisible} onClose={() => setSubscriptionVisible(false)} />
      <CoursesModal
        visible={coursesVisible}
        onClose={() => setCoursesVisible(false)}
        isInstructor={profile.kycLevel >= 4}
      />
      <BusinessModal visible={businessVisible} onClose={() => setBusinessVisible(false)} />
      <EventsModal
        visible={eventsVisible}
        onClose={() => setEventsVisible(false)}
        isOrganizer={(EMPLOYER_ROLES as readonly string[]).includes(profile.role) && profile.kycLevel >= 3}
      />
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.md,
    margin: spacing.md,
    marginBottom: 0,
  },
  notificationsButton: {
    flexDirection: "row",
    alignItems: "center",
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
