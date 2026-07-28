import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
import { ModalShell } from "../../../components/ModalShell";

interface ApplyModalProps {
  visible: boolean;
  jobTitle: string;
  onClose: () => void;
  onSubmit: (message?: string) => Promise<void>;
}

export function ApplyModal({ visible, jobTitle, onClose, onSubmit }: ApplyModalProps) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(message || undefined);
      setMessage("");
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "Başvuru gönderilemedi"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell visible={visible} onClose={onClose} variant="sheet">
          <Text style={styles.title}>{jobTitle}</Text>
          <TextInput
            style={styles.input}
            placeholder="Kısa bir mesaj (opsiyonel)"
            placeholderTextColor={colors.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose} disabled={submitting}>
              <Text style={styles.secondaryButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.primaryButtonText}>Başvur</Text>
              )}
            </TouchableOpacity>
          </View>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
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
    minHeight: 80,
    textAlignVertical: "top",
    fontSize: typography.sizes.md,
  },
  error: {
    color: colors.danger,
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
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.accentBlue,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
