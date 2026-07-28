import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, type ViewStyle } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { getApiErrorMessage, uploadFileToPresignedUrl } from "@nexora/api-client";
import { EMPLOYER_ROLES } from "@nexora/shared-constants";
import { radii, spacing, typography } from "@nexora/ui-tokens";
import { useTheme } from "../../../store/useThemeStore";
import { Badge, type BadgeVariant } from "../../../components/Badge";
import { ModalShell } from "../../../components/ModalShell";
import { getMe, type UserProfile } from "../../../services/profileApi";
import {
  requestKycUploadUrl,
  confirmKycUpload,
  listKycDocuments,
  type KycDocumentItem,
  type KycDocumentType,
} from "../../../services/kycApi";

interface KycModalProps {
  visible: boolean;
  onClose: () => void;
}

const SHEET_HEIGHT: ViewStyle = { maxHeight: "85%" };

const DOCUMENT_LABELS: Record<KycDocumentType, string> = {
  kimlik: "Kimlik Belgesi",
  diploma: "Diploma",
  kurumsal_belge: "Kurumsal Belge",
};

const STATUS_LABELS: Record<KycDocumentItem["status"], string> = {
  pending: "İnceleniyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  needs_review: "Manuel İnceleme Bekliyor",
};

const STATUS_VARIANTS: Record<KycDocumentItem["status"], BadgeVariant> = {
  pending: "neutral",
  approved: "success",
  rejected: "danger",
  needs_review: "warning",
};

export function KycModal({ visible, onClose }: KycModalProps) {
  const { colors } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [documents, setDocuments] = useState<KycDocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingType, setUploadingType] = useState<KycDocumentType | null>(null);
  const [claimedFullName, setClaimedFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setUploadingType(null);
    setError(null);
    loadData();
  }, [visible]);

  function loadData() {
    setLoading(true);
    Promise.all([getMe(), listKycDocuments()])
      .then(([userProfile, docs]) => {
        setProfile(userProfile);
        setDocuments(docs);
      })
      .catch((err) => setError(getApiErrorMessage(err, "KYC durumu yüklenemedi")))
      .finally(() => setLoading(false));
  }

  function latestFor(documentType: KycDocumentType): KycDocumentItem | undefined {
    return documents.find((doc) => doc.documentType === documentType);
  }

  async function handleUpload(documentType: KycDocumentType) {
    if (!claimedFullName.trim()) {
      setError("Belgedeki ad soyadı gir");
      return;
    }
    const result = await launchImageLibrary({ mediaType: "photo", quality: 0.8 });
    const asset = result.assets?.[0];
    if (!asset?.uri) {
      return;
    }
    const contentType = asset.type === "image/png" ? "image/png" : "image/jpeg";

    setSubmitting(true);
    setError(null);
    try {
      const { uploadUrl, storageKey } = await requestKycUploadUrl(documentType, contentType);
      await uploadFileToPresignedUrl(uploadUrl, asset.uri, contentType);
      await confirmKycUpload({ documentType, storageKey, contentType, claimedFullName: claimedFullName.trim() });
      setUploadingType(null);
      loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Belge yüklenemedi"));
    } finally {
      setSubmitting(false);
    }
  }

  const isEmployer = profile ? (EMPLOYER_ROLES as readonly string[]).includes(profile.role) : false;
  const applicableTypes: KycDocumentType[] = isEmployer ? ["kimlik", "kurumsal_belge"] : ["kimlik", "diploma"];
  const kimlikApproved = latestFor("kimlik")?.status === "approved";

  return (
    <ModalShell visible={visible} onClose={onClose} variant="sheet" contentStyle={SHEET_HEIGHT}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Kimlik Doğrulama</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={[styles.closeText, { color: colors.accentGold }]}>Kapat</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accentGold} style={styles.loader} />
      ) : (
        <ScrollView>
          {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

          <Text style={[styles.introText, { color: colors.textSecondary }]}>
            Profilini doğrulamak ve platformdaki tüm özelliklere erişmek için belgelerini yükle.
          </Text>

          {applicableTypes.map((documentType) => {
            const latest = latestFor(documentType);
            const isDiplomaBlocked = documentType === "diploma" && !kimlikApproved;
            const isFormOpen = uploadingType === documentType;

            return (
              <View key={documentType} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{DOCUMENT_LABELS[documentType]}</Text>
                  {latest ? <Badge label={STATUS_LABELS[latest.status]} variant={STATUS_VARIANTS[latest.status]} /> : null}
                </View>

                {isDiplomaBlocked ? (
                  <Text style={[styles.hint, { color: colors.textSecondary }]}>
                    Diploma yüklemeden önce kimlik belgen onaylanmalı.
                  </Text>
                ) : !isFormOpen ? (
                  <TouchableOpacity
                    style={[styles.secondaryButton, { borderColor: colors.accentGold }]}
                    onPress={() => {
                      setError(null);
                      setUploadingType(documentType);
                    }}
                  >
                    <Text style={[styles.secondaryButtonText, { color: colors.accentGold }]}>
                      {latest ? "Yeniden Yükle" : "Belge Yükle"}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.uploadForm}>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.textPrimary },
                      ]}
                      placeholder="Belgedeki ad soyad"
                      placeholderTextColor={colors.textSecondary}
                      value={claimedFullName}
                      onChangeText={setClaimedFullName}
                    />
                    <TouchableOpacity
                      style={[styles.primaryButton, { backgroundColor: colors.accentBlue }]}
                      onPress={() => handleUpload(documentType)}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <ActivityIndicator color={colors.background} />
                      ) : (
                        <Text style={[styles.primaryButtonText, { color: colors.background }]}>Fotoğraf Seç ve Yükle</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setUploadingType(null)} disabled={submitting}>
                      <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Vazgeç</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
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
  introText: {
    fontSize: typography.sizes.sm,
    marginBottom: spacing.lg,
  },
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  hint: {
    fontSize: typography.sizes.sm,
  },
  secondaryButton: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  uploadForm: {
    marginTop: spacing.xs,
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    fontSize: typography.sizes.sm,
  },
  primaryButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  primaryButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  cancelText: {
    fontSize: typography.sizes.xs,
    textAlign: "center",
  },
});
