import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { radii, spacing, typography } from "@nexora/ui-tokens";
import { useTheme } from "../../../store/useThemeStore";
import { ModalShell } from "../../../components/ModalShell";
import {
  getHub,
  joinFreeHub,
  leaveHub,
  listHubPosts,
  createHubPost,
  type HubItem,
  type HubPostItem,
} from "../../../services/hubApi";
import { HubMembershipCheckoutWebView } from "./HubMembershipCheckoutWebView";

interface HubDetailModalProps {
  hubId: string | null;
  onClose: () => void;
  onMembershipChanged?: () => void;
}

const SHEET_HEIGHT: ViewStyle = { maxHeight: "85%" };

export function HubDetailModal({ hubId, onClose, onMembershipChanged }: HubDetailModalProps) {
  const { colors } = useTheme();
  const [hub, setHub] = useState<HubItem | null>(null);
  const [posts, setPosts] = useState<HubPostItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [posting, setPosting] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hubId) {
      return;
    }
    setCheckoutVisible(false);
    setNewPostText("");
    loadHub(hubId);
  }, [hubId]);

  async function loadHub(id: string) {
    setLoading(true);
    setError(null);
    try {
      const result = await getHub(id);
      setHub(result);
      if (result.isMember) {
        const feed = await listHubPosts(id);
        setPosts(feed.posts);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Hub yüklenemedi"));
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!hubId) {
      return;
    }
    setJoining(true);
    setError(null);
    try {
      await joinFreeHub(hubId);
      await loadHub(hubId);
      onMembershipChanged?.();
    } catch (err) {
      setError(getApiErrorMessage(err, "Hub'a katılınamadı"));
    } finally {
      setJoining(false);
    }
  }

  async function handleLeave() {
    if (!hubId) {
      return;
    }
    setLeaving(true);
    setError(null);
    try {
      await leaveHub(hubId);
      await loadHub(hubId);
      onMembershipChanged?.();
    } catch (err) {
      setError(getApiErrorMessage(err, "Hub'dan ayrılınamadı"));
    } finally {
      setLeaving(false);
    }
  }

  function handleCheckoutDone(result: "success" | "cancelled") {
    setCheckoutVisible(false);
    if (result === "success" && hubId) {
      loadHub(hubId);
      onMembershipChanged?.();
    }
  }

  async function handlePost() {
    if (!hubId || newPostText.trim().length === 0) {
      return;
    }
    setPosting(true);
    setError(null);
    try {
      const created = await createHubPost(hubId, newPostText.trim());
      setPosts((current) => [created, ...current]);
      setNewPostText("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Gönderi paylaşılamadı"));
    } finally {
      setPosting(false);
    }
  }

  return (
    <ModalShell visible={hubId !== null} onClose={onClose} variant="sheet" contentStyle={SHEET_HEIGHT}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{hub?.name ?? "Hub"}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeText, { color: colors.accentGold }]}>Kapat</Text>
            </TouchableOpacity>
          </View>

          {checkoutVisible && hubId ? (
            <HubMembershipCheckoutWebView hubId={hubId} onDone={handleCheckoutDone} />
          ) : loading ? (
            <ActivityIndicator color={colors.accentGold} style={styles.loader} />
          ) : hub ? (
            <ScrollView style={styles.content}>
              {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
              {hub.description ? (
                <Text style={[styles.description, { color: colors.textSecondary }]}>{hub.description}</Text>
              ) : null}
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {hub.memberCount} üye · {hub.type === "paid" ? `₺${hub.price}/ay` : "Ücretsiz"}
              </Text>

              {!hub.isMember ? (
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: colors.accentBlue }]}
                  onPress={hub.type === "free" ? handleJoin : () => setCheckoutVisible(true)}
                  disabled={joining}
                >
                  {joining ? (
                    <ActivityIndicator color={colors.background} />
                  ) : (
                    <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                      {hub.type === "free" ? "Katıl" : `Üye Ol (₺${hub.price}/ay)`}
                    </Text>
                  )}
                </TouchableOpacity>
              ) : (
                <>
                  {!hub.isOwner ? (
                    <TouchableOpacity
                      style={[styles.dangerButton, { borderColor: colors.danger }]}
                      onPress={handleLeave}
                      disabled={leaving}
                    >
                      {leaving ? (
                        <ActivityIndicator color={colors.danger} />
                      ) : (
                        <Text style={[styles.dangerButtonText, { color: colors.danger }]}>Hub'dan Ayrıl</Text>
                      )}
                    </TouchableOpacity>
                  ) : null}

                  <View style={styles.postForm}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.multiline,
                        { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.textPrimary },
                      ]}
                      placeholder="Hub'da bir şeyler paylaş…"
                      placeholderTextColor={colors.textSecondary}
                      value={newPostText}
                      onChangeText={setNewPostText}
                      multiline
                    />
                    <TouchableOpacity
                      style={[styles.primaryButton, { backgroundColor: colors.accentBlue }]}
                      onPress={handlePost}
                      disabled={posting || newPostText.trim().length === 0}
                    >
                      {posting ? (
                        <ActivityIndicator color={colors.background} />
                      ) : (
                        <Text style={[styles.primaryButtonText, { color: colors.background }]}>Paylaş</Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  {posts.length === 0 ? (
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Henüz gönderi yok.</Text>
                  ) : (
                    posts.map((post) => (
                      <View key={post.id} style={[styles.card, { backgroundColor: colors.surfaceElevated }]}>
                        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                          {post.author.displayName}
                        </Text>
                        <Text style={[styles.cardBody, { color: colors.textPrimary }]}>{post.text}</Text>
                      </View>
                    ))
                  )}
                </>
              )}
            </ScrollView>
          ) : null}
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    flexShrink: 1,
  },
  closeText: {
    fontSize: typography.sizes.sm,
  },
  loader: {
    marginVertical: spacing.xl,
  },
  content: {
    maxHeight: "100%",
  },
  error: {
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.sizes.sm,
    marginBottom: spacing.sm,
  },
  metaText: {
    fontSize: typography.sizes.xs,
    marginBottom: spacing.md,
  },
  primaryButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  dangerButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    alignItems: "center",
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  dangerButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  postForm: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.md,
  },
  multiline: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    textAlign: "center",
    marginVertical: spacing.lg,
  },
  card: {
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardSubtitle: {
    fontSize: typography.sizes.xs,
    marginBottom: spacing.xs,
  },
  cardBody: {
    fontSize: typography.sizes.sm,
  },
});
