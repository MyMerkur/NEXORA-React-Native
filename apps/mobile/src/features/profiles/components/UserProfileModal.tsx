import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
import { getPublicProfile, type PublicProfile } from "../../../services/publicProfileApi";
import { requestReference, writeReference } from "../../../services/referenceApi";
import { useAuthStore } from "../../../store/useAuthStore";
import { InboxModal } from "../../inbox/components/InboxModal";

interface UserProfileModalProps {
  visible: boolean;
  userId: string | null;
  onClose: () => void;
}

const SHEET_HEIGHT: ViewStyle = { maxHeight: "85%" };

export function UserProfileModal({ visible, userId, onClose }: UserProfileModalProps) {
  const { colors } = useTheme();
  const textPrimaryStyle = { color: colors.textPrimary };
  const accentGoldTextStyle = { color: colors.accentGold };
  const dangerTextStyle = { color: colors.danger };
  const successTextStyle = { color: colors.success };
  const avatarPlaceholderStyle = { backgroundColor: colors.surfaceElevated };
  const textSecondaryStyle = { color: colors.textSecondary };
  const actionButtonBorderStyle = { borderColor: colors.accentGold };
  const inputStyle = { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.textPrimary };
  const submitButtonBgStyle = { backgroundColor: colors.accentGold };
  const submitButtonTextStyle = { color: colors.background };
  const referenceRowStyle = { borderTopColor: colors.border };
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
    <>
      <ModalShell visible={visible} onClose={onClose} variant="sheet" contentStyle={SHEET_HEIGHT}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, textPrimaryStyle]}>Kullanıcı Profili</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeText, accentGoldTextStyle]}>Kapat</Text>
            </TouchableOpacity>
          </View>

          {loading ? <ActivityIndicator color={colors.accentGold} style={styles.loader} /> : null}
          {error ? <Text style={[styles.error, dangerTextStyle]}>{error}</Text> : null}
          {feedback ? <Text style={[styles.feedback, successTextStyle]}>{feedback}</Text> : null}

          {profile ? (
            <ScrollView>
              <View style={styles.profileHeader}>
                {profile.avatarUrl ? (
                  <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, avatarPlaceholderStyle]} />
                )}
                <View style={styles.profileHeaderText}>
                  <Text style={[styles.displayName, textPrimaryStyle]}>{profile.displayName}</Text>
                  {profile.title ? <Text style={[styles.title, accentGoldTextStyle]}>{profile.title}</Text> : null}
                  {profile.workplace ? <Text style={[styles.workplace, textSecondaryStyle]}>{profile.workplace}</Text> : null}
                  {profile.city ? <Text style={[styles.workplace, textSecondaryStyle]}>{profile.city}</Text> : null}
                </View>
              </View>

              {profile.bio ? <Text style={[styles.bio, textSecondaryStyle]}>{profile.bio}</Text> : null}

              {!isSelf ? (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={[styles.actionButton, actionButtonBorderStyle]} onPress={() => setMessageVisible(true)}>
                    <Text style={[styles.actionButtonText, accentGoldTextStyle]}>Mesaj Gönder</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, actionButtonBorderStyle]}
                    onPress={handleRequestReference}
                    disabled={submitting}
                  >
                    <Text style={[styles.actionButtonText, accentGoldTextStyle]}>Referans İste</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, actionButtonBorderStyle]}
                    onPress={() => setWriteFormVisible((current) => !current)}
                  >
                    <Text style={[styles.actionButtonText, accentGoldTextStyle]}>Referans Yaz</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {writeFormVisible ? (
                <View style={styles.writeForm}>
                  <TextInput
                    style={[styles.input, inputStyle]}
                    placeholder="İlişkiniz (örn. Birlikte çalıştık)"
                    placeholderTextColor={colors.textSecondary}
                    value={relationship}
                    onChangeText={setRelationship}
                  />
                  <TextInput
                    style={[styles.input, inputStyle, styles.multiline]}
                    placeholder="Referans metni"
                    placeholderTextColor={colors.textSecondary}
                    value={body}
                    onChangeText={setBody}
                    multiline
                  />
                  <TouchableOpacity style={[styles.submitButton, submitButtonBgStyle]} onPress={handleWriteReference} disabled={submitting}>
                    <Text style={[styles.submitButtonText, submitButtonTextStyle]}>Gönder</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              <Text style={[styles.sectionTitle, textPrimaryStyle]}>Referanslar ({profile.references.length})</Text>
              {profile.references.length === 0 ? (
                <Text style={[styles.emptyText, textSecondaryStyle]}>Henüz referans yok</Text>
              ) : (
                profile.references.map((reference) => (
                  <View key={reference.id} style={[styles.referenceRow, referenceRowStyle]}>
                    <Text style={[styles.referenceAuthor, textPrimaryStyle]}>{reference.counterpart.displayName}</Text>
                    {reference.relationship ? (
                      <Text style={[styles.referenceRelationship, textSecondaryStyle]}>{reference.relationship}</Text>
                    ) : null}
                    <Text style={[styles.referenceBody, textSecondaryStyle]}>{reference.body}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          ) : null}
      </ModalShell>

      <InboxModal visible={messageVisible} onClose={() => setMessageVisible(false)} startTarget={userId ? { userId } : null} />
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
  headerTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
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
  feedback: {
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
  profileHeaderText: {
    flex: 1,
  },
  displayName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  title: {
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  workplace: {
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  bio: {
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
  },
  actionButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  writeForm: {
    marginBottom: spacing.md,
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
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
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  submitButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
  },
  referenceRow: {
    borderTopWidth: 1,
    paddingVertical: spacing.sm,
  },
  referenceAuthor: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  referenceRelationship: {
    fontSize: typography.sizes.xs,
    marginTop: 1,
  },
  referenceBody: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
});
