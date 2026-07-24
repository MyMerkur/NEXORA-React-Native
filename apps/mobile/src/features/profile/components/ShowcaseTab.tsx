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
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { getApiErrorMessage, uploadFileToPresignedUrl } from "@nexora/api-client";
import { EMPLOYER_ROLES, type MicroCompetencyTag } from "@nexora/shared-constants";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
import { requestAvatarUploadUrl, updateShowcase, getMe, type UserProfile } from "../../../services/profileApi";
import { searchOrgs, setAffiliation, type OrgSearchResult } from "../../../services/orgApi";
import {
  getIncomingRequests,
  fulfillRequest,
  getMyReferences,
  setReferenceVisibility,
  type ReferenceItem,
} from "../../../services/referenceApi";
import { acceptInstructorInvite } from "../../../services/instructorInviteApi";
import { TagPicker } from "../../../components/TagPicker";
import { OrgProfileModal } from "../../orgs/components/OrgProfileModal";

interface ShowcaseTabProps {
  profile: UserProfile;
  onUpdated: (profile: UserProfile) => void;
}

export function ShowcaseTab({ profile, onUpdated }: ShowcaseTabProps) {
  const isEmployer = (EMPLOYER_ROLES as readonly string[]).includes(profile.role);
  const [displayName, setDisplayName] = useState(profile.showcase.displayName);
  const [title, setTitle] = useState(profile.showcase.title);
  const [bio, setBio] = useState(profile.showcase.bio);
  const [workplace, setWorkplace] = useState(profile.showcase.workplace);
  const [city, setCity] = useState(profile.showcase.city);
  const [specialties, setSpecialties] = useState<MicroCompetencyTag[]>(profile.showcase.specialties);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [affiliationQuery, setAffiliationQuery] = useState("");
  const [affiliationResults, setAffiliationResults] = useState<OrgSearchResult[]>([]);
  const [affiliationSaving, setAffiliationSaving] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState<ReferenceItem[]>([]);
  const [myReferences, setMyReferences] = useState<ReferenceItem[]>([]);
  const [fulfillingId, setFulfillingId] = useState<string | null>(null);
  const [fulfillRelationship, setFulfillRelationship] = useState("");
  const [fulfillBody, setFulfillBody] = useState("");
  const [referenceSaving, setReferenceSaving] = useState(false);
  const [inviteToken, setInviteToken] = useState("");
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const isInstructor = profile.kycLevel >= 4;

  useEffect(() => {
    if (isEmployer) {
      return;
    }
    getIncomingRequests()
      .then(setIncomingRequests)
      .catch(() => undefined);
    getMyReferences()
      .then(setMyReferences)
      .catch(() => undefined);
  }, [isEmployer]);

  async function handleFulfill(referenceId: string) {
    if (!fulfillBody.trim()) {
      return;
    }
    setReferenceSaving(true);
    setError(null);
    try {
      await fulfillRequest(referenceId, fulfillBody.trim(), fulfillRelationship.trim() || undefined);
      setIncomingRequests((current) => current.filter((item) => item.id !== referenceId));
      setFulfillingId(null);
      setFulfillRelationship("");
      setFulfillBody("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Referans yazılamadı"));
    } finally {
      setReferenceSaving(false);
    }
  }

  async function handleToggleVisibility(reference: ReferenceItem) {
    setReferenceSaving(true);
    setError(null);
    try {
      const updated = await setReferenceVisibility(reference.id, reference.status !== "hidden");
      setMyReferences((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(getApiErrorMessage(err, "Görünürlük güncellenemedi"));
    } finally {
      setReferenceSaving(false);
    }
  }

  async function handleAcceptInvite() {
    if (!inviteToken.trim()) {
      return;
    }
    setInviteSubmitting(true);
    setInviteError(null);
    try {
      await acceptInstructorInvite(inviteToken.trim());
      const refreshed = await getMe();
      onUpdated(refreshed);
      setInviteToken("");
    } catch (err) {
      setInviteError(getApiErrorMessage(err, "Davet kabul edilemedi"));
    } finally {
      setInviteSubmitting(false);
    }
  }

  async function handlePickAvatar() {
    const result = await launchImageLibrary({ mediaType: "photo", quality: 0.8 });
    const asset = result.assets?.[0];
    if (!asset?.uri) {
      return;
    }

    const contentType = asset.type === "image/png" ? "image/png" : "image/jpeg";

    setUploadingAvatar(true);
    setError(null);
    try {
      const { uploadUrl, storageKey } = await requestAvatarUploadUrl(contentType);
      await uploadFileToPresignedUrl(uploadUrl, asset.uri, contentType);
      const updated = await updateShowcase({ avatarKey: storageKey });
      onUpdated(updated);
    } catch (err) {
      setError(getApiErrorMessage(err, "Fotoğraf yüklenemedi"));
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateShowcase({ displayName, title, bio, workplace, city, specialties });
      onUpdated(updated);
    } catch (err) {
      setError(getApiErrorMessage(err, "Kaydedilemedi"));
    } finally {
      setSaving(false);
    }
  }

  async function handleSearchAffiliation(query: string) {
    setAffiliationQuery(query);
    if (query.trim().length < 2) {
      setAffiliationResults([]);
      return;
    }
    try {
      const results = await searchOrgs(query);
      setAffiliationResults(results);
    } catch {
      // sessizce yut, kullanıcı yazmaya devam edebilir
    }
  }

  async function handleSelectAffiliation(orgUserId: string | null) {
    setAffiliationSaving(true);
    setError(null);
    try {
      const updated = await setAffiliation(orgUserId);
      onUpdated(updated);
      setAffiliationQuery("");
      setAffiliationResults([]);
    } catch (err) {
      setError(getApiErrorMessage(err, "Kurum bağlantısı güncellenemedi"));
    } finally {
      setAffiliationSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.avatarWrapper} onPress={handlePickAvatar} disabled={uploadingAvatar}>
        {profile.showcase.avatarUrl ? (
          <Image source={{ uri: profile.showcase.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarPlaceholderText}>Fotoğraf Ekle</Text>
          </View>
        )}
        {uploadingAvatar ? (
          <View style={styles.avatarOverlay}>
            <ActivityIndicator color={colors.textPrimary} />
          </View>
        ) : null}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Ad Soyad"
        placeholderTextColor={colors.textSecondary}
        value={displayName}
        onChangeText={setDisplayName}
      />
      <TextInput
        style={styles.input}
        placeholder="Unvan (örn. Diş Hekimi)"
        placeholderTextColor={colors.textSecondary}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Kısa biyografi"
        placeholderTextColor={colors.textSecondary}
        value={bio}
        onChangeText={setBio}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Çalıştığı yer"
        placeholderTextColor={colors.textSecondary}
        value={workplace}
        onChangeText={setWorkplace}
      />
      {isEmployer ? (
        <>
          <Text style={[styles.verifiedBadge, profile.showcase.isVerifiedOrg ? styles.verifiedTrue : styles.verifiedFalse]}>
            {profile.showcase.isVerifiedOrg ? "✅ Doğrulanmış Kurum" : "⚠️ Doğrulanmamış Kurum"}
          </Text>
          <TouchableOpacity style={styles.previewButton} onPress={() => setPreviewVisible(true)}>
            <Text style={styles.previewButtonText}>Vitrinimi Görüntüle</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.affiliationSection}>
          <Text style={styles.label}>Bağlı olduğun kurum (opsiyonel)</Text>
          {profile.showcase.affiliatedOrg ? (
            <View style={styles.affiliationChip}>
              <Text style={styles.affiliationChipText}>{profile.showcase.affiliatedOrg.displayName}</Text>
              <TouchableOpacity onPress={() => handleSelectAffiliation(null)} disabled={affiliationSaving}>
                <Text style={styles.affiliationChipRemove}>×</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Kurumunu Nexora'da bul"
                placeholderTextColor={colors.textSecondary}
                value={affiliationQuery}
                onChangeText={handleSearchAffiliation}
              />
              {affiliationResults.map((org) => (
                <TouchableOpacity
                  key={org.id}
                  style={styles.affiliationResultRow}
                  onPress={() => handleSelectAffiliation(org.id)}
                  disabled={affiliationSaving}
                >
                  <Text style={styles.affiliationResultText}>{org.displayName}</Text>
                  {org.workplace ? <Text style={styles.affiliationResultSubtext}>{org.workplace}</Text> : null}
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      )}
      <TextInput
        style={styles.input}
        placeholder="Şehir"
        placeholderTextColor={colors.textSecondary}
        value={city}
        onChangeText={setCity}
      />

      <Text style={styles.label}>Mikro-yetkinlikler</Text>
      <TagPicker selected={specialties} onChange={setSpecialties} />

      {!isEmployer && isInstructor ? <Text style={styles.instructorBadge}>🎓 Eğitmen</Text> : null}

      {!isEmployer && !isInstructor ? (
        <View style={styles.inviteSection}>
          <Text style={styles.label}>Eğitmen daveti var mı?</Text>
          <TextInput
            style={styles.input}
            placeholder="Davet kodu"
            placeholderTextColor={colors.textSecondary}
            value={inviteToken}
            onChangeText={setInviteToken}
            autoCapitalize="none"
          />
          {inviteError ? <Text style={styles.error}>{inviteError}</Text> : null}
          <TouchableOpacity style={styles.previewButton} onPress={handleAcceptInvite} disabled={inviteSubmitting}>
            <Text style={styles.previewButtonText}>Kabul Et</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!isEmployer ? (
        <View style={styles.referencesSection}>
          <Text style={styles.label}>Referanslarım</Text>

          {incomingRequests.length > 0 ? (
            <>
              <Text style={styles.referencesSubLabel}>Bekleyen istekler</Text>
              {incomingRequests.map((request) => (
                <View key={request.id}>
                  <View style={styles.referenceRow}>
                    <Text style={styles.referenceName}>{request.counterpart.displayName}</Text>
                    {fulfillingId !== request.id ? (
                      <TouchableOpacity onPress={() => setFulfillingId(request.id)}>
                        <Text style={styles.referenceAction}>Yaz</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  {fulfillingId === request.id ? (
                    <View style={styles.fulfillForm}>
                      <TextInput
                        style={styles.input}
                        placeholder="İlişkiniz (opsiyonel)"
                        placeholderTextColor={colors.textSecondary}
                        value={fulfillRelationship}
                        onChangeText={setFulfillRelationship}
                      />
                      <TextInput
                        style={[styles.input, styles.multiline]}
                        placeholder="Referans metni"
                        placeholderTextColor={colors.textSecondary}
                        value={fulfillBody}
                        onChangeText={setFulfillBody}
                        multiline
                      />
                      <TouchableOpacity
                        style={styles.previewButton}
                        onPress={() => handleFulfill(request.id)}
                        disabled={referenceSaving}
                      >
                        <Text style={styles.previewButtonText}>Gönder</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              ))}
            </>
          ) : null}

          <Text style={styles.referencesSubLabel}>Yazılmış referanslarım ({myReferences.length})</Text>
          {myReferences.length === 0 ? (
            <Text style={styles.referencesEmptyText}>Henüz bir referansın yok</Text>
          ) : (
            myReferences.map((reference) => (
              <View key={reference.id} style={styles.referenceRow}>
                <View style={styles.referenceInfo}>
                  <Text style={styles.referenceName}>{reference.counterpart.displayName}</Text>
                  <Text style={styles.referenceBody}>{reference.body}</Text>
                </View>
                <TouchableOpacity onPress={() => handleToggleVisibility(reference)} disabled={referenceSaving}>
                  <Text style={styles.referenceAction}>{reference.status === "hidden" ? "Göster" : "Gizle"}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color={colors.background} /> : <Text style={styles.saveButtonText}>Kaydet</Text>}
      </TouchableOpacity>

      <OrgProfileModal visible={previewVisible} orgUserId={profile.id} onClose={() => setPreviewVisible(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  avatarWrapper: {
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: radii.pill,
  },
  avatarPlaceholder: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    textAlign: "center",
    paddingHorizontal: spacing.xs,
  },
  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radii.pill,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    fontSize: typography.sizes.md,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  verifiedBadge: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.md,
  },
  verifiedTrue: {
    color: colors.success,
  },
  verifiedFalse: {
    color: colors.textSecondary,
  },
  previewButton: {
    alignSelf: "flex-start",
    marginBottom: spacing.md,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.accentGold,
  },
  previewButtonText: {
    color: colors.accentGold,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  affiliationSection: {
    marginBottom: spacing.md,
  },
  affiliationChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  affiliationChipText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    marginRight: spacing.xs,
  },
  affiliationChipRemove: {
    color: colors.danger,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  affiliationResultRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  affiliationResultText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
  },
  affiliationResultSubtext: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
  },
  label: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  instructorBadge: {
    color: colors.accentGold,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.md,
  },
  inviteSection: {
    marginTop: spacing.md,
  },
  referencesSection: {
    marginTop: spacing.lg,
  },
  referencesSubLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  referencesEmptyText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  referenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
  },
  referenceInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  referenceName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  referenceBody: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  referenceAction: {
    color: colors.accentGold,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  fulfillForm: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.md,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: colors.accentBlue,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  saveButtonText: {
    color: colors.background,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
