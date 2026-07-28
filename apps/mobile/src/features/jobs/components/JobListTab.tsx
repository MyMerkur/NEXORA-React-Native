import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { radii, spacing, typography } from "@nexora/ui-tokens";
import { applyToJob, getJobs, type JobItem } from "../../../services/jobApi";
import { ApplyModal } from "./ApplyModal";
import { OrgProfileModal } from "../../orgs/components/OrgProfileModal";
import { useTheme } from "../../../store/useThemeStore";

export function JobListTab() {
  const { colors } = useTheme();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applyTarget, setApplyTarget] = useState<JobItem | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [orgTarget, setOrgTarget] = useState<string | null>(null);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await getJobs();
      setJobs(page.jobs);
      setNextCursor(page.nextCursor);
    } catch (err) {
      setError(getApiErrorMessage(err, "İlanlar yüklenemedi"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const page = await getJobs();
      setJobs(page.jobs);
      setNextCursor(page.nextCursor);
    } catch (err) {
      setError(getApiErrorMessage(err, "İlanlar yüklenemedi"));
    } finally {
      setRefreshing(false);
    }
  }

  async function handleLoadMore() {
    if (!nextCursor || loadingMore) {
      return;
    }
    setLoadingMore(true);
    try {
      const page = await getJobs(nextCursor);
      setJobs((current) => [...current, ...page.jobs]);
      setNextCursor(page.nextCursor);
    } catch {
      // sessizce yut, kullanıcı aşağı çekip tekrar deneyebilir
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleApply(message?: string) {
    if (!applyTarget) {
      return;
    }
    await applyToJob(applyTarget.id, message);
    setAppliedIds((current) => new Set(current).add(applyTarget.id));
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
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accentGold} />}
        onEndReachedThreshold={0.4}
        onEndReached={handleLoadMore}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{error ?? "Şu anda açık ilan yok"}</Text>
          </View>
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.footerLoader} color={colors.accentGold} /> : null}
        renderItem={({ item }) => {
          const alreadyApplied = appliedIds.has(item.id);
          const applyButtonBackground = alreadyApplied ? colors.surfaceElevated : colors.accentBlue;
          return (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TouchableOpacity onPress={() => setOrgTarget(item.employer.id)}>
                <Text style={[styles.employerName, { color: colors.textSecondary }]}>{item.employer.displayName}</Text>
              </TouchableOpacity>
              <Text style={[styles.title, { color: colors.textPrimary }]}>{item.title}</Text>
              {item.location ? (
                <Text style={[styles.location, { color: colors.textSecondary }]}>{item.location}</Text>
              ) : null}
              {item.description ? (
                <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={3}>
                  {item.description}
                </Text>
              ) : null}
              {item.specialties.length > 0 ? (
                <View style={styles.tagRow}>
                  {item.specialties.map((tag) => (
                    <View key={tag} style={[styles.tag, { borderColor: colors.border }]}>
                      <Text style={[styles.tagText, { color: colors.textSecondary }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              <TouchableOpacity
                style={[styles.applyButton, { backgroundColor: applyButtonBackground }]}
                onPress={() => setApplyTarget(item)}
                disabled={alreadyApplied}
              >
                <Text style={[styles.applyButtonText, { color: colors.background }]}>
                  {alreadyApplied ? "Başvuruldu" : "Başvur"}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
      <ApplyModal
        visible={applyTarget !== null}
        jobTitle={applyTarget?.title ?? ""}
        onClose={() => setApplyTarget(null)}
        onSubmit={handleApply}
      />
      <OrgProfileModal visible={orgTarget !== null} orgUserId={orgTarget} onClose={() => setOrgTarget(null)} />
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
  footerLoader: {
    marginVertical: spacing.lg,
  },
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    margin: spacing.md,
    marginBottom: 0,
    padding: spacing.md,
  },
  employerName: {
    fontSize: typography.sizes.xs,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  location: {
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  description: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tag: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: typography.sizes.xs,
  },
  applyButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    alignItems: "center",
    marginTop: spacing.md,
  },
  applyButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
});
