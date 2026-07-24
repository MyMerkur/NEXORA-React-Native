import { useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { getApiErrorMessage, uploadFileToPresignedUrl } from "@nexora/api-client";
import type { MicroCompetencyTag } from "@nexora/shared-constants";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
import {
  createCase,
  requestImageUploadUrl,
  generateCaseDraft,
  type CaseImageInput,
  type CaseStage,
} from "../../../services/caseApi";
import { TagPicker } from "../../../components/TagPicker";

const STAGES: { key: CaseStage; label: string }[] = [
  { key: "before", label: "Öncesi" },
  { key: "during", label: "Orta" },
  { key: "after", label: "Sonrası" },
];

export function CreateCaseScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [specialties, setSpecialties] = useState<MicroCompetencyTag[]>([]);
  const [images, setImages] = useState<(CaseImageInput & { previewUri: string })[]>([]);
  const [uploadingStage, setUploadingStage] = useState<CaseStage | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [captionText, setCaptionText] = useState("");
  const [draftSourceImages, setDraftSourceImages] = useState<(CaseImageInput & { previewUri: string })[]>([]);
  const [uploadingDraftImage, setUploadingDraftImage] = useState(false);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  async function handleAddDraftSourceImage() {
    const result = await launchImageLibrary({ mediaType: "photo", quality: 0.8 });
    const asset = result.assets?.[0];
    if (!asset?.uri) {
      return;
    }

    const contentType = asset.type === "image/png" ? "image/png" : "image/jpeg";

    setUploadingDraftImage(true);
    setDraftError(null);
    try {
      const { uploadUrl, storageKey } = await requestImageUploadUrl(contentType);
      await uploadFileToPresignedUrl(uploadUrl, asset.uri, contentType);
      setDraftSourceImages((current) => [...current, { storageKey, stage: "before", previewUri: asset.uri! }]);
    } catch (err) {
      setDraftError(getApiErrorMessage(err, "Fotoğraf yüklenemedi"));
    } finally {
      setUploadingDraftImage(false);
    }
  }

  function handleRemoveDraftSourceImage(index: number) {
    setDraftSourceImages((current) => current.filter((_, i) => i !== index));
  }

  async function handleGenerateDraft() {
    setGeneratingDraft(true);
    setDraftError(null);
    try {
      const draft = await generateCaseDraft({
        storageKeys: draftSourceImages.map((image) => image.storageKey),
        captionText: captionText || undefined,
      });
      setTitle(draft.title);
      setDescription(draft.description);
      setSpecialties(draft.specialties);
      setImages((current) => [...current, ...draftSourceImages]);
      setDraftSourceImages([]);
      setCaptionText("");
      setSuccessMessage("Taslak oluşturuldu, düzenleyip paylaşabilirsin.");
    } catch (err) {
      setDraftError(getApiErrorMessage(err, "Taslak oluşturulamadı"));
    } finally {
      setGeneratingDraft(false);
    }
  }

  async function handleAddImage(stage: CaseStage) {
    const result = await launchImageLibrary({ mediaType: "photo", quality: 0.8 });
    const asset = result.assets?.[0];
    if (!asset?.uri) {
      return;
    }

    const contentType = asset.type === "image/png" ? "image/png" : "image/jpeg";

    setUploadingStage(stage);
    setError(null);
    try {
      const { uploadUrl, storageKey } = await requestImageUploadUrl(contentType);
      await uploadFileToPresignedUrl(uploadUrl, asset.uri, contentType);
      setImages((current) => [...current, { storageKey, stage, previewUri: asset.uri! }]);
    } catch (err) {
      setError(getApiErrorMessage(err, "Fotoğraf yüklenemedi"));
    } finally {
      setUploadingStage(null);
    }
  }

  function handleRemoveImage(index: number) {
    setImages((current) => current.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await createCase({
        title,
        description: description || undefined,
        specialties,
        images: images.map(({ storageKey, stage }) => ({ storageKey, stage })),
      });
      setTitle("");
      setDescription("");
      setSpecialties([]);
      setImages([]);
      setSuccessMessage("Vaka paylaşıldı. Ana akıştan görebilirsin.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Vaka paylaşılamadı"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.aiDraftSection}>
        <Text style={styles.label}>🤖 Instagram Gönderisinden Taslak Oluştur (Eğitmen)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Instagram açıklaması (opsiyonel)"
          placeholderTextColor={colors.textSecondary}
          value={captionText}
          onChangeText={setCaptionText}
          multiline
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailRow}>
          {draftSourceImages.map((image, index) => (
            <View key={image.storageKey} style={styles.thumbnailWrapper}>
              <Image source={{ uri: image.previewUri }} style={styles.thumbnail} />
              <TouchableOpacity style={styles.removeBadge} onPress={() => handleRemoveDraftSourceImage(index)}>
                <Text style={styles.removeBadgeText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addThumbnailButton}
            onPress={handleAddDraftSourceImage}
            disabled={uploadingDraftImage}
          >
            {uploadingDraftImage ? (
              <ActivityIndicator color={colors.textSecondary} />
            ) : (
              <Text style={styles.addThumbnailText}>+ Ekle</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
        {draftError ? <Text style={styles.error}>{draftError}</Text> : null}
        <TouchableOpacity
          style={[styles.submitButton, styles.draftButton]}
          onPress={handleGenerateDraft}
          disabled={draftSourceImages.length === 0 || generatingDraft}
        >
          {generatingDraft ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.submitButtonText}>Taslak Oluştur</Text>
          )}
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Vaka başlığı"
        placeholderTextColor={colors.textSecondary}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Açıklama"
        placeholderTextColor={colors.textSecondary}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>İlgili yetkinlikler</Text>
      <TagPicker selected={specialties} onChange={setSpecialties} />

      {STAGES.map((stage) => (
        <View key={stage.key} style={styles.stageSection}>
          <Text style={styles.label}>{stage.label}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailRow}>
            {images
              .map((image, index) => ({ image, index }))
              .filter(({ image }) => image.stage === stage.key)
              .map(({ image, index }) => (
                <View key={image.storageKey} style={styles.thumbnailWrapper}>
                  <Image source={{ uri: image.previewUri }} style={styles.thumbnail} />
                  <TouchableOpacity style={styles.removeBadge} onPress={() => handleRemoveImage(index)}>
                    <Text style={styles.removeBadgeText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            <TouchableOpacity
              style={styles.addThumbnailButton}
              onPress={() => handleAddImage(stage.key)}
              disabled={uploadingStage !== null}
            >
              {uploadingStage === stage.key ? (
                <ActivityIndicator color={colors.textSecondary} />
              ) : (
                <Text style={styles.addThumbnailText}>+ Ekle</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      ))}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color={colors.background} /> : <Text style={styles.submitButtonText}>Paylaş</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  aiDraftSection: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  draftButton: {
    marginTop: spacing.sm,
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
  stageSection: {
    marginTop: spacing.md,
  },
  thumbnailRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  thumbnailWrapper: {
    position: "relative",
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceElevated,
  },
  removeBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: radii.pill,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  removeBadgeText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.sizes.sm,
  },
  addThumbnailButton: {
    width: 72,
    height: 72,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  addThumbnailText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.lg,
    textAlign: "center",
  },
  success: {
    color: colors.success,
    marginTop: spacing.lg,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: colors.accentBlue,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  submitButtonText: {
    color: colors.background,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
