import { useState } from "react";
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
import type { MicroCompetencyTag } from "@nexora/shared-constants";
import { radii, spacing, typography } from "@nexora/ui-tokens";
import { ModalShell } from "../../../components/ModalShell";
import { createJob, type JobItem } from "../../../services/jobApi";
import { TagPicker } from "../../../components/TagPicker";
import { useTheme } from "../../../store/useThemeStore";

interface CreateJobModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: (job: JobItem) => void;
}

const SHEET_HEIGHT: ViewStyle = { maxHeight: "85%" };

export function CreateJobModal({ visible, onClose, onCreated }: CreateJobModalProps) {
  const { colors } = useTheme();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [specialties, setSpecialties] = useState<MicroCompetencyTag[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const job = await createJob({
        title,
        description: description || undefined,
        location: location || undefined,
        specialties,
      });
      setTitle("");
      setDescription("");
      setLocation("");
      setSpecialties([]);
      onCreated(job);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "İlan oluşturulamadı"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell visible={visible} onClose={onClose} variant="sheet" contentStyle={SHEET_HEIGHT}>
          <ScrollView>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Yeni İlan</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.textPrimary },
              ]}
              placeholder="Pozisyon başlığı"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[
                styles.input,
                styles.multiline,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.textPrimary },
              ]}
              placeholder="Açıklama"
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
            />
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.textPrimary },
              ]}
              placeholder="Konum"
              placeholderTextColor={colors.textSecondary}
              value={location}
              onChangeText={setLocation}
            />
            <Text style={[styles.label, { color: colors.textPrimary }]}>Aranan yetkinlikler</Text>
            <TagPicker selected={specialties} onChange={setSpecialties} />

            {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.border }]}
                onPress={onClose}
                disabled={submitting}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.accentBlue }]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={[styles.primaryButtonText, { color: colors.background }]}>Yayınla</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.md,
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    fontSize: typography.sizes.md,
  },
  multiline: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  error: {
    marginTop: spacing.sm,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  primaryButton: {
    flex: 1,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
