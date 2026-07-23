import { useState } from "react";
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
import type { MicroCompetencyTag } from "@nexora/shared-constants";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
import { requestAvatarUploadUrl, updateShowcase, type UserProfile } from "../../../services/profileApi";
import { TagPicker } from "../../../components/TagPicker";

interface ShowcaseTabProps {
  profile: UserProfile;
  onUpdated: (profile: UserProfile) => void;
}

export function ShowcaseTab({ profile, onUpdated }: ShowcaseTabProps) {
  const [displayName, setDisplayName] = useState(profile.showcase.displayName);
  const [title, setTitle] = useState(profile.showcase.title);
  const [bio, setBio] = useState(profile.showcase.bio);
  const [workplace, setWorkplace] = useState(profile.showcase.workplace);
  const [city, setCity] = useState(profile.showcase.city);
  const [specialties, setSpecialties] = useState<MicroCompetencyTag[]>(profile.showcase.specialties);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <TextInput
        style={styles.input}
        placeholder="Şehir"
        placeholderTextColor={colors.textSecondary}
        value={city}
        onChangeText={setCity}
      />

      <Text style={styles.label}>Mikro-yetkinlikler</Text>
      <TagPicker selected={specialties} onChange={setSpecialties} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color={colors.background} /> : <Text style={styles.saveButtonText}>Kaydet</Text>}
      </TouchableOpacity>
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
  label: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
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
