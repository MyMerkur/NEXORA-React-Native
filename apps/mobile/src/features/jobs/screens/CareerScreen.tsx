import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EMPLOYER_ROLES } from "@nexora/shared-constants";
import { colors, spacing, typography } from "@nexora/ui-tokens";
import { useAuthStore } from "../../../store/useAuthStore";
import { JobListTab } from "../components/JobListTab";
import { MyApplicationsTab } from "../components/MyApplicationsTab";
import { MyPostingsTab } from "../components/MyPostingsTab";

type CareerTab = "jobs" | "applications" | "postings";

export function CareerScreen() {
  const role = useAuthStore((state) => state.user?.role);
  const isEmployer = role ? (EMPLOYER_ROLES as readonly string[]).includes(role) : false;
  const [activeTab, setActiveTab] = useState<CareerTab>("jobs");

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "jobs" && styles.tabButtonActive]}
          onPress={() => setActiveTab("jobs")}
        >
          <Text style={[styles.tabText, activeTab === "jobs" && styles.tabTextActive]}>İlanlar</Text>
        </TouchableOpacity>
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
      {activeTab === "applications" ? <MyApplicationsTab /> : null}
      {activeTab === "postings" && isEmployer ? <MyPostingsTab /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
