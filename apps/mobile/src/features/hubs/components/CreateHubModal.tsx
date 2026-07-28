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
import { useTheme } from "../../../store/useThemeStore";
import { ModalShell } from "../../../components/ModalShell";
import { createHub, type HubType } from "../../../services/hubApi";
import { TagPicker } from "../../../components/TagPicker";

interface CreateHubModalProps {
  visible: boolean;
  onClose: () => void;
  canCreatePaid: boolean;
  onCreated: () => void;
}

const SHEET_HEIGHT: ViewStyle = { maxHeight: "85%" };

export function CreateHubModal({ visible, onClose, canCreatePaid, onCreated }: CreateHubModalProps) {
  const { colors } = useTheme();
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

  const freeActive = type === "free";
  const paidActive = type === "paid";
  const activeTypeButtonStyle = { borderColor: colors.accentGold, backgroundColor: colors.surfaceElevated };
  const inactiveTypeButtonStyle = { borderColor: colors.border };
  const freeTextColor = freeActive ? colors.accentGold : colors.textSecondary;
  const paidTextColor = paidActive ? colors.accentGold : colors.textSecondary;

  return (
    <ModalShell visible={visible} onClose={onClose} variant="sheet" contentStyle={SHEET_HEIGHT}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>+ Hub Oluştur</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeText, { color: colors.accentGold }]}>Kapat</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="Hub adı"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={[
                styles.input,
                styles.multiline,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.textPrimary },
              ]}
              placeholder="Açıklama (opsiyonel)"
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeButton, freeActive ? activeTypeButtonStyle : inactiveTypeButtonStyle]}
                onPress={() => setType("free")}
              >
                <Text style={[styles.typeText, freeActive && styles.typeTextActive, { color: freeTextColor }]}>
                  Ücretsiz
                </Text>
              </TouchableOpacity>
              {canCreatePaid ? (
                <TouchableOpacity
                  style={[styles.typeButton, paidActive ? activeTypeButtonStyle : inactiveTypeButtonStyle]}
                  onPress={() => setType("paid")}
                >
                  <Text style={[styles.typeText, paidActive && styles.typeTextActive, { color: paidTextColor }]}>
                    Ücretli
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {type === "paid" ? (
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="Aylık üyelik ücreti (₺)"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
                value={price}
                onChangeText={setPrice}
              />
            ) : null}

            <TagPicker selected={specialties} onChange={setSpecialties} />

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.accentBlue }]}
              onPress={handleCreate}
              disabled={!canSubmit || creating}
            >
              {creating ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={[styles.primaryButtonText, { color: colors.background }]}>Oluştur</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
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
  content: {
    maxHeight: "100%",
  },
  error: {
    marginBottom: spacing.sm,
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
  },
  typeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  typeTextActive: {
    fontWeight: typography.weights.semibold,
  },
  primaryButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  primaryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
