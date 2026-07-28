import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { radii, spacing, typography } from "@nexora/ui-tokens";
import { ModalShell } from "../../../components/ModalShell";
import { getCandidateSwipeFeed, swipeCandidate, type SwipeCandidateCard } from "../../../services/matchingApi";
import type { JobItem } from "../../../services/jobApi";
import type { ThreadContextType } from "../../../services/inboxApi";
import { SwipeCard } from "./SwipeCard";
import { InboxModal } from "../../inbox/components/InboxModal";
import { useTheme } from "../../../store/useThemeStore";

interface CandidateSwipeModalProps {
  visible: boolean;
  job: JobItem | null;
  onClose: () => void;
}

const SHEET_HEIGHT: ViewStyle = { height: "80%" };

export function CandidateSwipeModal({ visible, job, onClose }: CandidateSwipeModalProps) {
  const { colors } = useTheme();
  const [deck, setDeck] = useState<SwipeCandidateCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatTarget, setChatTarget] = useState<{ userId: string; context: { type: ThreadContextType; id: string } } | null>(
    null,
  );

  const load = useCallback(() => {
    if (!job) {
      return;
    }
    setLoading(true);
    setError(null);
    getCandidateSwipeFeed(job.id)
      .then(setDeck)
      .catch((err) => setError(getApiErrorMessage(err, "Adaylar yüklenemedi")))
      .finally(() => setLoading(false));
  }, [job]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    load();
  }, [visible, load]);

  async function handleSwipe(candidate: SwipeCandidateCard, direction: "left" | "right") {
    if (!job) {
      return;
    }
    setDeck((current) => current.filter((item) => item.id !== candidate.id));
    try {
      const result = await swipeCandidate(job.id, candidate.id, direction);
      if (result.matched) {
        Alert.alert("🎉 Eşleşme!", `${candidate.displayName} ile "${job.title}" ilanı üzerinden eşleştiniz.`, [
          { text: "Kapat", style: "cancel" },
          {
            text: "Sohbeti Aç",
            onPress: () => setChatTarget({ userId: candidate.id, context: { type: "job", id: job.id } }),
          },
        ]);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Swipe işlemi başarısız oldu"));
    }
  }

  const current = deck[0];

  return (
    <>
      <ModalShell visible={visible} onClose={onClose} variant="sheet" contentStyle={SHEET_HEIGHT}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
              {job?.title ?? ""} — Adaylar
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeText, { color: colors.accentGold }]}>Kapat</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

          {loading ? (
            <ActivityIndicator color={colors.accentGold} style={styles.loader} />
          ) : current ? (
            <View style={styles.deckArea}>
              <SwipeCard
                key={current.id}
                onSwipeLeft={() => handleSwipe(current, "left")}
                onSwipeRight={() => handleSwipe(current, "right")}
              >
                {current.avatarUrl ? (
                  <Image source={{ uri: current.avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: colors.surfaceElevated }]} />
                )}
                <Text style={[styles.candidateName, { color: colors.textPrimary }]}>{current.displayName}</Text>
                {current.experienceYears != null ? (
                  <Text style={[styles.experience, { color: colors.textSecondary }]}>
                    {current.experienceYears} yıl deneyim
                  </Text>
                ) : null}
                {current.desiredPositions.length > 0 ? (
                  <View style={styles.tagRow}>
                    {current.desiredPositions.map((tag) => (
                      <View key={tag} style={[styles.tag, { borderColor: colors.border }]}>
                        <Text style={[styles.tagText, { color: colors.textSecondary }]}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </SwipeCard>
            </View>
          ) : (
            <View style={styles.centered}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Şu an gösterilecek yeni aday yok</Text>
              <TouchableOpacity style={[styles.refreshButton, { borderColor: colors.accentGold }]} onPress={load}>
                <Text style={[styles.refreshButtonText, { color: colors.accentGold }]}>Yenile</Text>
              </TouchableOpacity>
            </View>
          )}
      </ModalShell>

      <InboxModal visible={chatTarget !== null} onClose={() => setChatTarget(null)} startTarget={chatTarget} />
    </>
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
  error: {
    marginBottom: spacing.sm,
  },
  deckArea: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: typography.sizes.md,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  refreshButton: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  refreshButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radii.pill,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  candidateName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    textAlign: "center",
  },
  experience: {
    fontSize: typography.sizes.sm,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.md,
    justifyContent: "center",
  },
  tag: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
  },
  tagText: {
    fontSize: typography.sizes.xs,
  },
});
