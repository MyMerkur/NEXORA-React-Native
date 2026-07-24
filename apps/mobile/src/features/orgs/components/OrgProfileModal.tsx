import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { EMPLOYER_ROLES } from "@nexora/shared-constants";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
import { getOrgProfile, rateOrg, getOrgReviews, type OrgProfile, type OrgReview } from "../../../services/orgApi";
import { useAuthStore } from "../../../store/useAuthStore";
import { InboxModal } from "../../inbox/components/InboxModal";

interface OrgProfileModalProps {
  visible: boolean;
  orgUserId: string | null;
  onClose: () => void;
}

export function OrgProfileModal({ visible, orgUserId, onClose }: OrgProfileModalProps) {
  const [profile, setProfile] = useState<OrgProfile | null>(null);
  const [reviews, setReviews] = useState<OrgReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageVisible, setMessageVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingSaving, setRatingSaving] = useState(false);
  const currentUser = useAuthStore((state) => state.user);
  const canRate = orgUserId !== currentUser?.id && currentUser ? !(EMPLOYER_ROLES as readonly string[]).includes(currentUser.role) : false;

  useEffect(() => {
    if (!visible || !orgUserId) {
      return;
    }
    setLoading(true);
    setError(null);
    setProfile(null);
    setSelectedRating(0);
    getOrgProfile(orgUserId)
      .then(setProfile)
      .catch((err) => setError(getApiErrorMessage(err, "Kurum profili yüklenemedi")))
      .finally(() => setLoading(false));
    getOrgReviews(orgUserId)
      .then(setReviews)
      .catch(() => undefined);
  }, [visible, orgUserId]);

  async function handleRate(rating: number) {
    if (!orgUserId) {
      return;
    }
    setSelectedRating(rating);
    setRatingSaving(true);
    setError(null);
    try {
      await rateOrg(orgUserId, rating);
      const [updatedProfile, updatedReviews] = await Promise.all([getOrgProfile(orgUserId), getOrgReviews(orgUserId)]);
      setProfile(updatedProfile);
      setReviews(updatedReviews);
    } catch (err) {
      setError(getApiErrorMessage(err, "Değerlendirme kaydedilemedi"));
    } finally {
      setRatingSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Kurum Vitrini</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Kapat</Text>
            </TouchableOpacity>
          </View>

          {loading ? <ActivityIndicator color={colors.accentGold} style={styles.loader} /> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {profile ? (
            <ScrollView>
              <View style={styles.profileHeader}>
                {profile.avatarUrl ? (
                  <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]} />
                )}
                <View style={styles.profileHeaderText}>
                  <Text style={styles.displayName}>{profile.displayName}</Text>
                  {profile.workplace ? <Text style={styles.workplace}>{profile.workplace}</Text> : null}
                  <Text
                    style={[styles.verifiedBadge, profile.isVerifiedOrg ? styles.verifiedTrue : styles.verifiedFalse]}
                  >
                    {profile.isVerifiedOrg ? "✅ Doğrulanmış Kurum" : "⚠️ Doğrulanmamış Kurum"}
                  </Text>
                  <Text style={styles.ratingSummary}>
                    {profile.rating.count > 0
                      ? `⭐ ${profile.rating.average} (${profile.rating.count} değerlendirme)`
                      : "Henüz değerlendirme yok"}
                  </Text>
                </View>
              </View>

              {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

              {profile.id !== currentUser?.id ? (
                <TouchableOpacity style={styles.messageButton} onPress={() => setMessageVisible(true)}>
                  <Text style={styles.messageButtonText}>Mesaj Gönder</Text>
                </TouchableOpacity>
              ) : null}

              {canRate ? (
                <View style={styles.rateSection}>
                  <Text style={styles.sectionTitle}>Değerlendir</Text>
                  <View style={styles.starRow}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <TouchableOpacity key={value} onPress={() => handleRate(value)} disabled={ratingSaving}>
                        <Text style={styles.star}>{value <= selectedRating ? "★" : "☆"}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : null}

              <Text style={styles.sectionTitle}>Değerlendirmeler ({reviews.length})</Text>
              {reviews.length === 0 ? (
                <Text style={styles.emptyText}>Henüz değerlendirme yok</Text>
              ) : (
                reviews.map((review) => (
                  <View key={review.id} style={styles.reviewRow}>
                    <Text style={styles.reviewAuthor}>
                      {review.author.displayName} — {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </Text>
                    {review.comment ? <Text style={styles.reviewComment}>{review.comment}</Text> : null}
                  </View>
                ))
              )}

              <Text style={styles.sectionTitle}>Ekip ({profile.team.length})</Text>
              {profile.team.length === 0 ? (
                <Text style={styles.emptyText}>Henüz ekip üyesi eklenmemiş</Text>
              ) : (
                profile.team.map((member) => (
                  <View key={member.id} style={styles.teamRow}>
                    {member.avatarUrl ? (
                      <Image source={{ uri: member.avatarUrl }} style={styles.teamAvatar} />
                    ) : (
                      <View style={[styles.teamAvatar, styles.avatarPlaceholder]} />
                    )}
                    <Text style={styles.teamName}>{member.displayName}</Text>
                  </View>
                ))
              )}

              <Text style={styles.sectionTitle}>Açık İlanlar ({profile.openJobs.length})</Text>
              {profile.openJobs.length === 0 ? (
                <Text style={styles.emptyText}>Açık ilan yok</Text>
              ) : (
                profile.openJobs.map((job) => (
                  <View key={job.id} style={styles.jobRow}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    {job.location ? <Text style={styles.jobLocation}>{job.location}</Text> : null}
                  </View>
                ))
              )}

              <Text style={styles.sectionTitle}>Vakalar ({profile.recentCases.length})</Text>
              {profile.recentCases.length === 0 ? (
                <Text style={styles.emptyText}>Henüz paylaşılan vaka yok</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.caseRow}>
                  {profile.recentCases.map((item) => (
                    <View key={item.id} style={styles.caseCard}>
                      {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} style={styles.caseImage} />
                      ) : (
                        <View style={[styles.caseImage, styles.avatarPlaceholder]} />
                      )}
                      <Text style={styles.caseTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </ScrollView>
          ) : null}
        </View>
      </View>

      <InboxModal
        visible={messageVisible}
        onClose={() => setMessageVisible(false)}
        startTarget={profile ? { userId: profile.id, context: { type: "org", id: profile.id } } : null}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  closeText: {
    color: colors.accentGold,
    fontSize: typography.sizes.sm,
  },
  loader: {
    marginVertical: spacing.xl,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    marginRight: spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: colors.surfaceElevated,
  },
  profileHeaderText: {
    flex: 1,
  },
  displayName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  workplace: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  verifiedBadge: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.xs,
  },
  verifiedTrue: {
    color: colors.success,
  },
  verifiedFalse: {
    color: colors.textSecondary,
  },
  ratingSummary: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
  },
  rateSection: {
    marginBottom: spacing.sm,
  },
  starRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  star: {
    color: colors.accentGold,
    fontSize: typography.sizes.xl,
  },
  reviewRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
  },
  reviewAuthor: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  reviewComment: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  bio: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.md,
  },
  messageButton: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.accentGold,
    marginBottom: spacing.md,
  },
  messageButtonText: {
    color: colors.background,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  teamAvatar: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    marginRight: spacing.sm,
  },
  teamName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
  },
  jobRow: {
    paddingVertical: spacing.xs,
  },
  jobTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  jobLocation: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
  },
  caseRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  caseCard: {
    width: 100,
  },
  caseImage: {
    width: 100,
    height: 75,
    borderRadius: radii.sm,
    marginBottom: spacing.xs,
  },
  caseTitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
  },
});
