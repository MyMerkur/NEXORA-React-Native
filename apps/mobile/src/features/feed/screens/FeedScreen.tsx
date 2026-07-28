import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { radii, spacing, typography } from "@nexora/ui-tokens";
import { useTheme } from "../../../store/useThemeStore";
import { getFeed, type CaseItem } from "../../../services/caseApi";
import { useAuthStore } from "../../../store/useAuthStore";
import { InboxModal } from "../../inbox/components/InboxModal";
import { UserProfileModal } from "../../profiles/components/UserProfileModal";

export function FeedScreen() {
  const { colors } = useTheme();
  const containerStyle = { backgroundColor: colors.background };
  const emptyTextStyle = { color: colors.textSecondary };
  const cardStyle = { backgroundColor: colors.surface, borderColor: colors.border };
  const avatarPlaceholderStyle = { backgroundColor: colors.surfaceElevated };
  const authorNameStyle = { color: colors.textPrimary };
  const imageStyle = { backgroundColor: colors.surfaceElevated };
  const titleStyle = { color: colors.textPrimary };
  const descriptionStyle = { color: colors.textSecondary };
  const messageLinkStyle = { color: colors.accentGold };
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageTarget, setMessageTarget] = useState<{ authorId: string; caseId: string } | null>(null);
  const [profileTargetId, setProfileTargetId] = useState<string | null>(null);
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
        style={[styles.container, containerStyle]}
        data={cases}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accentGold} />}
        onEndReachedThreshold={0.4}
        onEndReached={handleLoadMore}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={[styles.emptyText, emptyTextStyle]}>{error ?? "Henüz vaka paylaşılmamış"}</Text>
          </View>
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.footerLoader} color={colors.accentGold} /> : null}
        renderItem={({ item }) => (
          <View style={[styles.card, cardStyle]}>
            <View style={styles.authorRow}>
              {item.author.avatarUrl ? (
                <Image source={{ uri: item.author.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, avatarPlaceholderStyle]} />
              )}
              <TouchableOpacity onPress={() => setProfileTargetId(item.author.id)}>
                <Text style={[styles.authorName, authorNameStyle]}>{item.author.displayName}</Text>
              </TouchableOpacity>
            </View>

            {item.images[0] ? <Image source={{ uri: item.images[0].url }} style={[styles.image, imageStyle]} /> : null}

            <Text style={[styles.title, titleStyle]}>{item.title}</Text>
            {item.description ? (
              <Text style={[styles.description, descriptionStyle]} numberOfLines={3}>
                {item.description}
              </Text>
            ) : null}

            {item.author.id !== currentUserId ? (
              <TouchableOpacity
                onPress={() => setMessageTarget({ authorId: item.author.id, caseId: item.id })}
              >
                <Text style={[styles.messageLink, messageLinkStyle]}>Yazara Mesaj</Text>
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
      <UserProfileModal visible={profileTargetId !== null} userId={profileTargetId} onClose={() => setProfileTargetId(null)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  authorName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  image: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: radii.sm,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.sizes.sm,
  },
  messageLink: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginTop: spacing.sm,
  },
});
