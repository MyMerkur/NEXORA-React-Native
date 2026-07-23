import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing, typography } from "@nexora/ui-tokens";
import { getMe, type UserProfile } from "../../../services/profileApi";
import { ShowcaseTab } from "../components/ShowcaseTab";
import { CareerTab } from "../components/CareerTab";

type ProfileTab = "showcase" | "career";

export function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("showcase");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMe()
      .then(setProfile)
      .catch((err) => setError(err instanceof Error ? err.message : "Profil yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

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
