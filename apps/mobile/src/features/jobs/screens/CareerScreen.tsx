import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EMPLOYER_ROLES } from "@nexora/shared-constants";
import { colors, spacing, typography } from "@nexora/ui-tokens";
import { useAuthStore } from "../../../store/useAuthStore";
import { JobListTab } from "../components/JobListTab";
import { MyApplicationsTab } from "../components/MyApplicationsTab";
import { MyPostingsTab } from "../components/MyPostingsTab";
import { JobSwipeTab } from "../../matching/components/JobSwipeTab";
import { MatchesModal } from "../../matching/components/MatchesModal";

type CareerTab = "jobs" | "discover" | "applications" | "postings";

export function CareerScreen() {
  const role = useAuthStore((state) => state.user?.role);
  const isEmployer = role ? (EMPLOYER_ROLES as readonly string[]).includes(role) : false;
  const [activeTab, setActiveTab] = useState<CareerTab>("jobs");
  const [matchesVisible, setMatchesVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.matchesButton} onPress={() => setMatchesVisible(true)}>
        <Text style={styles.matchesButtonText}>🎯 Eşleşmelerim</Text>
      </TouchableOpacity>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "jobs" && styles.tabButtonActive]}
          onPress={() => setActiveTab("jobs")}
        >
          <Text style={[styles.tabText, activeTab === "jobs" && styles.tabTextActive]}>İlanlar</Text>
        </TouchableOpacity>
        {!isEmployer ? (
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "discover" && styles.tabButtonActive]}
            onPress={() => setActiveTab("discover")}
          >
            <Text style={[styles.tabText, activeTab === "discover" && styles.tabTextActive]}>Keşfet</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "applications" && styles.tabButtonActive]}
          onPress={() => setActiveTab("applications")}
        >
          <Text style={[styles.tabText, activeTab === "applications" && styles.tabTextActive]}>Başvurularım</Text>
        </TouchableOpacity>
        {isEmployer ? (
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "postings" && styles.tabButtonActive]}
            onPress={() => setActiveTab("postings")}
          >
            <Text style={[styles.tabText, activeTab === "postings" && styles.tabTextActive]}>İlanlarım</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {activeTab === "jobs" ? <JobListTab /> : null}
      {activeTab === "discover" && !isEmployer ? <JobSwipeTab /> : null}
      {activeTab === "applications" ? <MyApplicationsTab /> : null}
      {activeTab === "postings" && isEmployer ? <MyPostingsTab /> : null}

      <MatchesModal visible={matchesVisible} onClose={() => setMatchesVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  matchesButton: {
    alignSelf: "flex-end",
    margin: spacing.md,
    marginBottom: 0,
  },
  matchesButtonText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
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
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  tabTextActive: {
    color: colors.accentGold,
    fontWeight: typography.weights.semibold,
  },
});
