import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
import { getMyApplications, type MyApplicationItem } from "../../../services/jobApi";
import { statusColor, statusLabel } from "../statusStyles";
import { InboxModal } from "../../inbox/components/InboxModal";

export function MyApplicationsTab() {
  const [applications, setApplications] = useState<MyApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageTarget, setMessageTarget] = useState<{ employerId: string; jobId: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const items = await getMyApplications();
      setApplications(items);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Başvurular yüklenemedi"));
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
        data={applications}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accentGold} />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>{error ?? "Henüz başvurun yok"}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.job.title}</Text>
            {item.message ? <Text style={styles.message}>{item.message}</Text> : null}
            <Text style={[styles.status, { color: statusColor(item.status) }]}>{statusLabel(item.status)}</Text>
            <TouchableOpacity
              onPress={() => setMessageTarget({ employerId: item.job.employerId, jobId: item.job.id })}
            >
              <Text style={styles.messageLink}>İşverene Mesaj Gönder</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <InboxModal
        visible={messageTarget !== null}
        onClose={() => setMessageTarget(null)}
        startTarget={
          messageTarget
            ? { userId: messageTarget.employerId, context: { type: "job", id: messageTarget.jobId } }
            : null
        }
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
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    margin: spacing.md,
    marginBottom: 0,
    padding: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  message: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  status: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.sm,
  },
  messageLink: {
    color: colors.accentGold,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginTop: spacing.xs,
  },
});
