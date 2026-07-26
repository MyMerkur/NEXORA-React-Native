import { useState } from "react";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import type { MicroCompetencyTag } from "@nexora/shared-constants";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
import { createHub, type HubType } from "../../../services/hubApi";
import { TagPicker } from "../../../components/TagPicker";

interface CreateHubModalProps {
  visible: boolean;
  onClose: () => void;
  canCreatePaid: boolean;
  onCreated: () => void;
}

export function CreateHubModal({ visible, onClose, canCreatePaid, onCreated }: CreateHubModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<HubType>("free");
  const [price, setPrice] = useState("");
  const [specialties, setSpecialties] = useState<MicroCompetencyTag[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName("");
    setDescription("");
    setType("free");
    setPrice("");
    setSpecialties([]);
    setError(null);
  }

  async function handleCreate() {
    setCreating(true);
    setError(null);
    try {
      await createHub({
        name,
        description: description || undefined,
        type,
        price: type === "paid" ? price : undefined,
        specialties,
      });
      reset();
      onCreated();
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "Hub oluşturulamadı"));
    } finally {
      setCreating(false);
    }
  }

  const canSubmit = name.trim().length > 0 && (type === "free" || price.trim().length > 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>+ Hub Oluştur</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Kapat</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="Hub adı"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Açıklama (opsiyonel)"
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeButton, type === "free" && styles.typeButtonActive]}
                onPress={() => setType("free")}
              >
                <Text style={[styles.typeText, type === "free" && styles.typeTextActive]}>Ücretsiz</Text>
              </TouchableOpacity>
              {canCreatePaid ? (
                <TouchableOpacity
                  style={[styles.typeButton, type === "paid" && styles.typeButtonActive]}
                  onPress={() => setType("paid")}
                >
                  <Text style={[styles.typeText, type === "paid" && styles.typeTextActive]}>Ücretli</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {type === "paid" ? (
              <TextInput
                style={styles.input}
                placeholder="Aylık üyelik ücreti (₺)"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
                value={price}
                onChangeText={setPrice}
              />
            ) : null}

            <TagPicker selected={specialties} onChange={setSpecialties} />

            <TouchableOpacity style={styles.primaryButton} onPress={handleCreate} disabled={!canSubmit || creating}>
              {creating ? <ActivityIndicator color={colors.background} /> : <Text style={styles.primaryButtonText}>Oluştur</Text>}
            </TouchableOpacity>
          </ScrollView>
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
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  closeText: {
    color: colors.accentGold,
    fontSize: typography.sizes.sm,
  },
  content: {
    maxHeight: "100%",
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
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
    minHeight: 60,
    textAlignVertical: "top",
  },
  typeRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  typeButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeButtonActive: {
    borderColor: colors.accentGold,
    backgroundColor: colors.surfaceElevated,
  },
  typeText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  typeTextActive: {
    color: colors.accentGold,
    fontWeight: typography.weights.semibold,
  },
  primaryButton: {
    backgroundColor: colors.accentBlue,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
