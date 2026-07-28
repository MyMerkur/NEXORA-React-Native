import { useState } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors, fontFamilies, radii, spacing } from "@nexora/ui-tokens";

interface InputProps extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({ label, hint, error, editable = true, onFocus, onBlur, style, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);

  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        {...rest}
        editable={editable}
        placeholderTextColor={colors.textTertiary}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.box,
          focused && styles.boxFocused,
          hasError && styles.boxError,
          !editable && styles.boxDisabled,
          style,
        ]}
      />
      {error ? <Text style={styles.hintError}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs + 2,
  },
  label: {
    fontFamily: fontFamilies.semibold,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  box: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
  },
  boxFocused: {
    borderColor: colors.accentBlue,
  },
  boxError: {
    borderColor: colors.danger,
  },
  boxDisabled: {
    color: colors.textTertiary,
    backgroundColor: colors.surfaceElevated,
  },
  hint: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  hintError: {
    fontSize: 12,
    color: colors.danger,
  },
});
