import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
import { getFeed, type CaseItem } from "../../../services/caseApi";
import { useAuthStore } from "../../../store/useAuthStore";
import { InboxModal } from "../../inbox/components/InboxModal";

export function FeedScreen() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageTarget, setMessageTarget] = useState<{ authorId: string; caseId: string } | null>(null);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await getFeed();
      setCases(page.cases);
      setNextCursor(page.nextCursor);
    } catch (err) {
      setError(getApiErrorMessage(err, "Ana akış yüklenemedi"));
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
      const page = await getFeed();
      setCases(page.cases);
      setNextCursor(page.nextCursor);
    } catch (err) {
      setError(getApiErrorMessage(err, "Ana akış yüklenemedi"));
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
      const page = await getFeed(nextCursor);
      setCases((current) => [...current, ...page.cases]);
      setNextCursor(page.nextCursor);
    } catch {
      // Sessizce yut: kullanıcı listeyi kaydırmaya devam edebilsin, aşağı çekip yenileyerek tekrar deneyebilir
    } finally {
      setLoadingMore(false);
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
      <FlatList
        style={styles.container}
        data={cases}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accentGold} />}
        onEndReachedThreshold={0.4}
        onEndReached={handleLoadMore}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>{error ?? "Henüz vaka paylaşılmamış"}</Text>
          </View>
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.footerLoader} color={colors.accentGold} /> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.authorRow}>
              {item.author.avatarUrl ? (
                <Image source={{ uri: item.author.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]} />
              )}
              <Text style={styles.authorName}>{item.author.displayName}</Text>
            </View>

            {item.images[0] ? <Image source={{ uri: item.images[0].url }} style={styles.image} /> : null}

            <Text style={styles.title}>{item.title}</Text>
            {item.description ? (
              <Text style={styles.description} numberOfLines={3}>
                {item.description}
              </Text>
            ) : null}

            {item.author.id !== currentUserId ? (
              <TouchableOpacity
                onPress={() => setMessageTarget({ authorId: item.author.id, caseId: item.id })}
              >
                <Text style={styles.messageLink}>Yazara Mesaj</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      />

      <InboxModal
        visible={messageTarget !== null}
        onClose={() => setMessageTarget(null)}
        startTarget={
          messageTarget ? { userId: messageTarget.authorId, context: { type: "case", id: messageTarget.caseId } } : null
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  footerLoader: {
    marginVertical: spacing.lg,
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
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    marginRight: spacing.sm,
  },
  avatarPlaceholder: {
    backgroundColor: colors.surfaceElevated,
  },
  authorName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  image: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: radii.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.surfaceElevated,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  messageLink: {
    color: colors.accentGold,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginTop: spacing.sm,
  },
});
