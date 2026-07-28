import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { radii, spacing, typography } from "@nexora/ui-tokens";
import { useTheme } from "../../../store/useThemeStore";
import { login, register } from "../../../services/authApi";
import { useAuthStore } from "../../../store/useAuthStore";

export function LoginScreen() {
  const { colors } = useTheme();
  const containerStyle = { backgroundColor: colors.background };
  const titleStyle = { color: colors.accentGold };
  const subtitleStyle = { color: colors.textSecondary };
  const inputStyle = { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary };
  const hintStyle = { color: colors.textSecondary };
  const errorStyle = { color: colors.danger };
  const primaryButtonStyle = { backgroundColor: colors.accentBlue };
  const primaryButtonTextStyle = { color: colors.background };
  const secondaryButtonStyle = { borderColor: colors.accentGold };
  const secondaryButtonTextStyle = { color: colors.accentGold };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setSession = useAuthStore((state) => state.setSession);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    try {
      const result = await login(email, password);
      setSession(result);
    } catch (err) {
      setError(getApiErrorMessage(err, "Giriş başarısız"));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    setLoading(true);
    setError(null);
    try {
      const result = await register(email, password, "hekim");
      setSession(result);
    } catch (err) {
      setError(getApiErrorMessage(err, "Kayıt başarısız"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.title, titleStyle]}>NEXORA</Text>
      <Text style={[styles.subtitle, subtitleStyle]}>Giriş yap veya kayıt ol</Text>

      <TextInput
        style={[styles.input, inputStyle]}
        placeholder="E-posta"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={[styles.input, inputStyle]}
        placeholder="Şifre"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Text style={[styles.hint, hintStyle]}>En az 8 karakter; en az bir büyük harf, bir küçük harf ve bir rakam içermeli</Text>

      {error ? <Text style={[styles.error, errorStyle]}>{error}</Text> : null}

      <TouchableOpacity style={[styles.primaryButton, primaryButtonStyle]} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={[styles.primaryButtonText, primaryButtonTextStyle]}>Giriş Yap</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.secondaryButton, secondaryButtonStyle]} onPress={handleRegister} disabled={loading}>
        <Text style={[styles.secondaryButtonText, secondaryButtonTextStyle]}>Kayıt Ol</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    fontSize: typography.sizes.md,
  },
  hint: {
    fontSize: typography.sizes.xs,
    marginBottom: spacing.md,
  },
  error: {
    marginBottom: spacing.md,
    textAlign: "center",
  },
  primaryButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  primaryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  secondaryButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
