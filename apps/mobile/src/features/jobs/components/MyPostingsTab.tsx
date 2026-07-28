import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { radii, spacing, typography } from "@nexora/ui-tokens";
import { getMyJobs, updateJobStatus, type JobItem } from "../../../services/jobApi";
import { CreateJobModal } from "./CreateJobModal";
import { ApplicantsModal } from "./ApplicantsModal";
import { CandidateSwipeModal } from "../../matching/components/CandidateSwipeModal";
import { useTheme } from "../../../store/useThemeStore";

export function MyPostingsTab() {
  const { colors } = useTheme();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createVisible, setCreateVisible] = useState(false);
  const [applicantsTarget, setApplicantsTarget] = useState<JobItem | null>(null);
  const [candidatesTarget, setCandidatesTarget] = useState<JobItem | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const items = await getMyJobs();
      setJobs(items);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "İlanların yüklenemedi"));
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handleToggleStatus(job: JobItem) {
    setTogglingId(job.id);
    try {
      const nextStatus = job.status === "open" ? "closed" : "open";
      const updated = await updateJobStatus(job.id, nextStatus);
      setJobs((current) => current.map((item) => (item.id === job.id ? updated : item)));
    } catch (err) {
      setError(getApiErrorMessage(err, "Güncellenemedi"));
    } finally {
      setTogglingId(null);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accentGold} />
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: colors.accentBlue }]}
        onPress={() => setCreateVisible(true)}
      >
        <Text style={[styles.createButtonText, { color: colors.background }]}>+ Yeni İlan</Text>
      </TouchableOpacity>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accentGold} />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {error ?? "Henüz ilan yayınlamadın"}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusColorValue = item.status === "open" ? colors.success : colors.textSecondary;
          return (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setApplicantsTarget(item)}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.status, { color: statusColorValue }]}>
                  {item.status === "open" ? "Açık" : "Kapalı"}
                </Text>
              </View>
              {item.location ? (
                <Text style={[styles.location, { color: colors.textSecondary }]}>{item.location}</Text>
              ) : null}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.toggleButton, { borderColor: colors.accentGold }]}
                  onPress={() => handleToggleStatus(item)}
                  disabled={togglingId === item.id}
                >
                  <Text style={[styles.toggleButtonText, { color: colors.accentGold }]}>
                    {item.status === "open" ? "Kapat" : "Yeniden Aç"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, { borderColor: colors.accentGold }]}
                  onPress={() => setCandidatesTarget(item)}
                >
                  <Text style={[styles.toggleButtonText, { color: colors.accentGold }]}>Aday Bul</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <CreateJobModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onCreated={(job) => setJobs((current) => [job, ...current])}
      />
      <ApplicantsModal visible={applicantsTarget !== null} job={applicantsTarget} onClose={() => setApplicantsTarget(null)} />
      <CandidateSwipeModal
        visible={candidatesTarget !== null}
        job={candidatesTarget}
        onClose={() => setCandidatesTarget(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.sizes.md,
  },
  createButton: {
    margin: spacing.md,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  createButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    flexShrink: 1,
  },
  status: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  location: {
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  toggleButton: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
  },
  toggleButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
});
