import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import type { MicroCompetencyTag } from "@nexora/shared-constants";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
import { updateCareer, type ExperienceEntry, type UserProfile } from "../../../services/profileApi";
import { TagPicker } from "./TagPicker";

interface CareerTabProps {
  profile: UserProfile;
  onUpdated: (profile: UserProfile) => void;
}

export function CareerTab({ profile, onUpdated }: CareerTabProps) {
  const [openToWork, setOpenToWork] = useState(profile.career.openToWork);
  const [desiredPositions, setDesiredPositions] = useState<MicroCompetencyTag[]>(profile.career.desiredPositions);
  const [experienceYears, setExperienceYears] = useState(
    profile.career.experienceYears != null ? String(profile.career.experienceYears) : "",
  );
  const [experience, setExperience] = useState<ExperienceEntry[]>(profile.career.experience);
  const [newTitle, setNewTitle] = useState("");
  const [newWorkplace, setNewWorkplace] = useState("");
  const [newStartYear, setNewStartYear] = useState("");
  const [newEndYear, setNewEndYear] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAddExperience() {
    const startYear = Number(newStartYear);
    if (!newTitle.trim() || !newWorkplace.trim() || !startYear) {
      return;
    }
    const endYear = newEndYear ? Number(newEndYear) : null;
    setExperience([...experience, { title: newTitle.trim(), workplace: newWorkplace.trim(), startYear, endYear }]);
    setNewTitle("");
    setNewWorkplace("");
    setNewStartYear("");
    setNewEndYear("");
  }

  function handleRemoveExperience(index: number) {
    setExperience(experience.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateCareer({
        openToWork,
        desiredPositions,
        experienceYears: experienceYears ? Number(experienceYears) : undefined,
        experience,
      });
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.switchRow}>
        <Text style={styles.label}>İş arıyorum</Text>
        <Switch
          value={openToWork}
          onValueChange={setOpenToWork}
          trackColor={{ true: colors.accentGold, false: colors.border }}
        />
      </View>

      <Text style={styles.label}>Aranan pozisyonlar</Text>
      <TagPicker selected={desiredPositions} onChange={setDesiredPositions} />

      <TextInput
        style={styles.input}
        placeholder="Deneyim (yıl)"
        placeholderTextColor={colors.textSecondary}
        keyboardType="number-pad"
        value={experienceYears}
        onChangeText={setExperienceYears}
      />

      <Text style={styles.label}>İş deneyimi</Text>
      {experience.map((entry, index) => (
        <View key={`${entry.title}-${entry.startYear}-${index}`} style={styles.experienceRow}>
          <View style={styles.experienceInfo}>
            <Text style={styles.experienceTitle}>{entry.title}</Text>
            <Text style={styles.experienceSubtitle}>
              {entry.workplace} · {entry.startYear} - {entry.endYear ?? "devam ediyor"}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleRemoveExperience(index)}>
            <Text style={styles.removeText}>Sil</Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.addForm}>
        <TextInput
          style={styles.input}
          placeholder="Unvan"
          placeholderTextColor={colors.textSecondary}
          value={newTitle}
          onChangeText={setNewTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="İşyeri"
          placeholderTextColor={colors.textSecondary}
          value={newWorkplace}
          onChangeText={setNewWorkplace}
        />
        <View style={styles.yearRow}>
          <TextInput
            style={[styles.input, styles.yearInput]}
            placeholder="Başlangıç yılı"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            value={newStartYear}
            onChangeText={setNewStartYear}
          />
          <TextInput
            style={[styles.input, styles.yearInput]}
            placeholder="Bitiş yılı (boş = devam)"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            value={newEndYear}
            onChangeText={setNewEndYear}
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddExperience}>
          <Text style={styles.addButtonText}>Deneyim Ekle</Text>
        </TouchableOpacity>
      </View>

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
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
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
  experienceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  experienceInfo: {
    flex: 1,
  },
  experienceTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  experienceSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  removeText: {
    color: colors.danger,
    fontSize: typography.sizes.sm,
  },
  addForm: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  yearRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  yearInput: {
    flex: 1,
  },
  addButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.accentGold,
  },
  addButtonText: {
    color: colors.accentGold,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
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
