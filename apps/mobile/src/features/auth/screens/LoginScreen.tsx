import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
import { login, register } from "../../../services/authApi";
import { useAuthStore } from "../../../store/useAuthStore";

export function LoginScreen() {
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
    <View style={styles.container}>
      <Text style={styles.title}>NEXORA</Text>
      <Text style={styles.subtitle}>Giriş yap veya kayıt ol</Text>

      <TextInput
        style={styles.input}
        placeholder="E-posta"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Text style={styles.hint}>En az 8 karakter; en az bir büyük harf, bir küçük harf ve bir rakam içermeli</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.background} /> : <Text style={styles.primaryButtonText}>Giriş Yap</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleRegister} disabled={loading}>
        <Text style={styles.secondaryButtonText}>Kayıt Ol</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  title: {
    color: colors.accentGold,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    textAlign: "center",
    marginBottom: spacing.xl,
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
  hint: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginBottom: spacing.md,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: colors.accentBlue,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  secondaryButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.accentGold,
  },
  secondaryButtonText: {
    color: colors.accentGold,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
