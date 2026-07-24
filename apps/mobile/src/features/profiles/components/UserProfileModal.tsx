import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
import { getPublicProfile, type PublicProfile } from "../../../services/publicProfileApi";
import { requestReference, writeReference } from "../../../services/referenceApi";
import { useAuthStore } from "../../../store/useAuthStore";
import { InboxModal } from "../../inbox/components/InboxModal";

interface UserProfileModalProps {
  visible: boolean;
  userId: string | null;
  onClose: () => void;
}

export function UserProfileModal({ visible, userId, onClose }: UserProfileModalProps) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageVisible, setMessageVisible] = useState(false);
  const [writeFormVisible, setWriteFormVisible] = useState(false);
  const [relationship, setRelationship] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const currentUserId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    if (!visible || !userId) {
      return;
    }
    setLoading(true);
    setError(null);
    setProfile(null);
    setWriteFormVisible(false);
    setFeedback(null);
    getPublicProfile(userId)
      .then(setProfile)
      .catch((err) => setError(getApiErrorMessage(err, "Profil yüklenemedi")))
      .finally(() => setLoading(false));
  }, [visible, userId]);

  async function handleRequestReference() {
    if (!userId) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await requestReference(userId);
      setFeedback("Referans isteği gönderildi");
    } catch (err) {
      setError(getApiErrorMessage(err, "Referans isteği gönderilemedi"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleWriteReference() {
    if (!userId || !body.trim()) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await writeReference(userId, body.trim(), relationship.trim() || undefined);
      setFeedback("Referans yazıldı");
      setWriteFormVisible(false);
      setRelationship("");
      setBody("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Referans yazılamadı"));
    } finally {
      setSubmitting(false);
    }
  }

  const isSelf = profile?.id === currentUserId;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Kullanıcı Profili</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Kapat</Text>
            </TouchableOpacity>
          </View>

          {loading ? <ActivityIndicator color={colors.accentGold} style={styles.loader} /> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

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
                  {profile.title ? <Text style={styles.title}>{profile.title}</Text> : null}
                  {profile.workplace ? <Text style={styles.workplace}>{profile.workplace}</Text> : null}
                  {profile.city ? <Text style={styles.workplace}>{profile.city}</Text> : null}
                </View>
              </View>

              {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

              {!isSelf ? (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => setMessageVisible(true)}>
                    <Text style={styles.actionButtonText}>Mesaj Gönder</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={handleRequestReference} disabled={submitting}>
                    <Text style={styles.actionButtonText}>Referans İste</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setWriteFormVisible((current) => !current)}
                  >
                    <Text style={styles.actionButtonText}>Referans Yaz</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {writeFormVisible ? (
                <View style={styles.writeForm}>
                  <TextInput
                    style={styles.input}
                    placeholder="İlişkiniz (örn. Birlikte çalıştık)"
                    placeholderTextColor={colors.textSecondary}
                    value={relationship}
                    onChangeText={setRelationship}
                  />
                  <TextInput
                    style={[styles.input, styles.multiline]}
                    placeholder="Referans metni"
                    placeholderTextColor={colors.textSecondary}
                    value={body}
                    onChangeText={setBody}
                    multiline
                  />
                  <TouchableOpacity style={styles.submitButton} onPress={handleWriteReference} disabled={submitting}>
                    <Text style={styles.submitButtonText}>Gönder</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              <Text style={styles.sectionTitle}>Referanslar ({profile.references.length})</Text>
              {profile.references.length === 0 ? (
                <Text style={styles.emptyText}>Henüz referans yok</Text>
              ) : (
                profile.references.map((reference) => (
                  <View key={reference.id} style={styles.referenceRow}>
                    <Text style={styles.referenceAuthor}>{reference.counterpart.displayName}</Text>
                    {reference.relationship ? (
                      <Text style={styles.referenceRelationship}>{reference.relationship}</Text>
                    ) : null}
                    <Text style={styles.referenceBody}>{reference.body}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          ) : null}
        </View>
      </View>

      <InboxModal visible={messageVisible} onClose={() => setMessageVisible(false)} startTarget={userId ? { userId } : null} />
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
  feedback: {
    color: colors.success,
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
  title: {
    color: colors.accentGold,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  workplace: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  bio: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionButton: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.accentGold,
  },
  actionButtonText: {
    color: colors.accentGold,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  writeForm: {
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    fontSize: typography.sizes.sm,
  },
  multiline: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  submitButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.accentGold,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  submitButtonText: {
    color: colors.background,
    fontSize: typography.sizes.xs,
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
  referenceRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
  },
  referenceAuthor: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  referenceRelationship: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: 1,
  },
  referenceBody: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
});
