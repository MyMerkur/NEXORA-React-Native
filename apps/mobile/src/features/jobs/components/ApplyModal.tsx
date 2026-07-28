import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { radii, spacing, typography } from "@nexora/ui-tokens";
import { ModalShell } from "../../../components/ModalShell";
import { useTheme } from "../../../store/useThemeStore";

interface ApplyModalProps {
  visible: boolean;
  jobTitle: string;
  onClose: () => void;
  onSubmit: (message?: string) => Promise<void>;
}

export function ApplyModal({ visible, jobTitle, onClose, onSubmit }: ApplyModalProps) {
  const { colors } = useTheme();
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
          <Text style={[styles.title, { color: colors.textPrimary }]}>{jobTitle}</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.textPrimary },
            ]}
            placeholder="Kısa bir mesaj (opsiyonel)"
            placeholderTextColor={colors.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline
          />
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
                <Text style={[styles.primaryButtonText, { color: colors.background }]}>Başvur</Text>
              )}
            </TouchableOpacity>
          </View>
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
    minHeight: 80,
    textAlignVertical: "top",
    fontSize: typography.sizes.md,
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
