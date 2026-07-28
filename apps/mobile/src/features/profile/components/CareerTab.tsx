import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import type { MicroCompetencyTag } from "@nexora/shared-constants";
import { radii, spacing, typography } from "@nexora/ui-tokens";
import { useTheme } from "../../../store/useThemeStore";
import { updateCareer, type ExperienceEntry, type UserProfile } from "../../../services/profileApi";
import { TagPicker } from "../../../components/TagPicker";

interface CareerTabProps {
  profile: UserProfile;
  onUpdated: (profile: UserProfile) => void;
}

export function CareerTab({ profile, onUpdated }: CareerTabProps) {
  const { colors } = useTheme();
  const textPrimaryStyle = { color: colors.textPrimary };
  const inputStyle = { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary };
  const experienceRowStyle = { backgroundColor: colors.surface, borderColor: colors.border };
  const textSecondaryStyle = { color: colors.textSecondary };
  const dangerTextStyle = { color: colors.danger };
  const addButtonBorderStyle = { borderColor: colors.accentGold };
  const accentGoldTextStyle = { color: colors.accentGold };
  const saveButtonBgStyle = { backgroundColor: colors.accentBlue };
  const saveButtonTextStyle = { color: colors.background };
  const [openToWork, setOpenToWork] = useState(profile.career.openToWork);
  const [hiddenSearch, setHiddenSearch] = useState(profile.career.hiddenSearch);
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
        hiddenSearch,
        desiredPositions,
        experienceYears: experienceYears ? Number(experienceYears) : undefined,
        experience,
      });
      onUpdated(updated);
    } catch (err) {
      setError(getApiErrorMessage(err, "Kaydedilemedi"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.switchRow}>
        <Text style={[styles.label, textPrimaryStyle]}>İş arıyorum</Text>
        <Switch
          value={openToWork}
          onValueChange={setOpenToWork}
          trackColor={{ true: colors.accentGold, false: colors.border }}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={[styles.label, textPrimaryStyle]}>Gizli iş arama modu</Text>
        <Switch
          value={hiddenSearch}
          onValueChange={setHiddenSearch}
          trackColor={{ true: colors.accentGold, false: colors.border }}
        />
      </View>

      <Text style={[styles.label, textPrimaryStyle]}>Aranan pozisyonlar</Text>
      <TagPicker selected={desiredPositions} onChange={setDesiredPositions} />

      <TextInput
        style={[styles.input, inputStyle]}
        placeholder="Deneyim (yıl)"
        placeholderTextColor={colors.textSecondary}
        keyboardType="number-pad"
        value={experienceYears}
        onChangeText={setExperienceYears}
      />

      <Text style={[styles.label, textPrimaryStyle]}>İş deneyimi</Text>
      {experience.map((entry, index) => (
        <View key={`${entry.title}-${entry.startYear}-${index}`} style={[styles.experienceRow, experienceRowStyle]}>
          <View style={styles.experienceInfo}>
            <Text style={[styles.experienceTitle, textPrimaryStyle]}>{entry.title}</Text>
            <Text style={[styles.experienceSubtitle, textSecondaryStyle]}>
              {entry.workplace} · {entry.startYear} - {entry.endYear ?? "devam ediyor"}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleRemoveExperience(index)}>
            <Text style={[styles.removeText, dangerTextStyle]}>Sil</Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.addForm}>
        <TextInput
          style={[styles.input, inputStyle]}
          placeholder="Unvan"
          placeholderTextColor={colors.textSecondary}
          value={newTitle}
          onChangeText={setNewTitle}
        />
        <TextInput
          style={[styles.input, inputStyle]}
          placeholder="İşyeri"
          placeholderTextColor={colors.textSecondary}
          value={newWorkplace}
          onChangeText={setNewWorkplace}
        />
        <View style={styles.yearRow}>
          <TextInput
            style={[styles.input, inputStyle, styles.yearInput]}
            placeholder="Başlangıç yılı"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            value={newStartYear}
            onChangeText={setNewStartYear}
          />
          <TextInput
            style={[styles.input, inputStyle, styles.yearInput]}
            placeholder="Bitiş yılı (boş = devam)"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            value={newEndYear}
            onChangeText={setNewEndYear}
          />
        </View>
        <TouchableOpacity style={[styles.addButton, addButtonBorderStyle]} onPress={handleAddExperience}>
          <Text style={[styles.addButtonText, accentGoldTextStyle]}>Deneyim Ekle</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={[styles.error, dangerTextStyle]}>{error}</Text> : null}

      <TouchableOpacity style={[styles.saveButton, saveButtonBgStyle]} onPress={handleSave} disabled={saving}>
        {saving ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={[styles.saveButtonText, saveButtonTextStyle]}>Kaydet</Text>
        )}
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
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    fontSize: typography.sizes.md,
  },
  experienceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  experienceInfo: {
    flex: 1,
  },
  experienceTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  experienceSubtitle: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  removeText: {
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
  },
  addButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  error: {
    marginTop: spacing.md,
    textAlign: "center",
  },
  saveButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  saveButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
