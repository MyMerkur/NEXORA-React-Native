import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MICRO_COMPETENCY_TAGS, type MicroCompetencyTag } from "@nexora/shared-constants";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";

const MAX_TAGS = 8;

interface TagPickerProps {
  selected: MicroCompetencyTag[];
  onChange: (tags: MicroCompetencyTag[]) => void;
}

export function TagPicker({ selected, onChange }: TagPickerProps) {
  function toggleTag(tag: MicroCompetencyTag) {
    if (selected.includes(tag)) {
      onChange(selected.filter((item) => item !== tag));
      return;
    }
    if (selected.length >= MAX_TAGS) {
      return;
    }
    onChange([...selected, tag]);
  }

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {MICRO_COMPETENCY_TAGS.map((tag) => {
          const isSelected = selected.includes(tag);
          return (
            <TouchableOpacity
              key={tag}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => toggleTag(tag)}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{tag}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <Text style={styles.hint}>
        {selected.length}/{MAX_TAGS} etiket seçildi
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.accentGold,
    backgroundColor: colors.surfaceElevated,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  chipTextSelected: {
    color: colors.accentGold,
    fontWeight: typography.weights.semibold,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
  },
});
