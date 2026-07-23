import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
import { getOrgProfile, type OrgProfile } from "../../../services/orgApi";

interface OrgProfileModalProps {
  visible: boolean;
  orgUserId: string | null;
  onClose: () => void;
}

export function OrgProfileModal({ visible, orgUserId, onClose }: OrgProfileModalProps) {
  const [profile, setProfile] = useState<OrgProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !orgUserId) {
      return;
    }
    setLoading(true);
    setError(null);
    setProfile(null);
    getOrgProfile(orgUserId)
      .then(setProfile)
      .catch((err) => setError(getApiErrorMessage(err, "Kurum profili yüklenemedi")))
      .finally(() => setLoading(false));
  }, [visible, orgUserId]);

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
                </View>
              </View>

              {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

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
  bio: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.md,
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
