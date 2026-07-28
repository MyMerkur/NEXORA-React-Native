import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { radii, spacing, typography } from "@nexora/ui-tokens";
import { useTheme } from "../../../store/useThemeStore";
import { login, register } from "../../../services/authApi";
import { useAuthStore } from "../../../store/useAuthStore";
import { ROLE_LABELS, CANDIDATE_ROLE_LIST, EMPLOYER_ROLE_LIST, type UserRole } from "../roleLabels";

type Mode = "login" | "registerRole" | "registerCredentials";
type RoleCategory = "candidate" | "employer";

const PASSWORD_HINT = "En az 8 karakter; en az bir büyük harf, bir küçük harf ve bir rakam içermeli";

export function LoginScreen() {
  const { colors } = useTheme();
  const setSession = useAuthStore((state) => state.setSession);

  const [mode, setMode] = useState<Mode>("login");
  const [category, setCategory] = useState<RoleCategory>("candidate");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetToLogin() {
    setMode("login");
    setSelectedRole(null);
    setPasswordConfirm("");
    setError(null);
  }

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
    if (!selectedRole) {
      return;
    }
    if (password !== passwordConfirm) {
      setError("Şifreler eşleşmiyor");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await register(email, password, selectedRole);
      setSession(result);
    } catch (err) {
      setError(getApiErrorMessage(err, "Kayıt başarısız"));
    } finally {
      setLoading(false);
    }
  }

  const roleList = category === "candidate" ? CANDIDATE_ROLE_LIST : EMPLOYER_ROLE_LIST;

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.accentGold }]}>NEXORA</Text>

      {mode === "login" ? (
        <>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Giriş yap</Text>

          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="E-posta"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="Şifre"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.accentBlue }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={[styles.primaryButtonText, { color: colors.background }]}>Giriş Yap</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              setError(null);
              setMode("registerRole");
            }}
          >
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>
              Hesabın yok mu? <Text style={{ color: colors.accentGold }}>Kayıt Ol</Text>
            </Text>
          </TouchableOpacity>
        </>
      ) : null}

      {mode === "registerRole" ? (
        <>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Nasıl katılmak istersin?</Text>

          <View style={styles.categoryRow}>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                { borderColor: colors.border },
                category === "candidate" && { borderColor: colors.accentGold, backgroundColor: colors.surfaceElevated },
              ]}
              onPress={() => {
                setCategory("candidate");
                setSelectedRole(null);
              }}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  { color: colors.textSecondary },
                  category === "candidate" && { color: colors.accentGold, fontWeight: typography.weights.semibold },
                ]}
              >
                Adayım
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                { borderColor: colors.border },
                category === "employer" && { borderColor: colors.accentGold, backgroundColor: colors.surfaceElevated },
              ]}
              onPress={() => {
                setCategory("employer");
                setSelectedRole(null);
              }}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  { color: colors.textSecondary },
                  category === "employer" && { color: colors.accentGold, fontWeight: typography.weights.semibold },
                ]}
              >
                Kurumum
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.roleWrap}>
            {roleList.map((role) => {
              const isSelected = selectedRole === role;
              return (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleChip,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                    isSelected && { borderColor: colors.accentGold, backgroundColor: colors.surfaceElevated },
                  ]}
                  onPress={() => setSelectedRole(role)}
                >
                  <Text
                    style={[
                      styles.roleChipText,
                      { color: colors.textSecondary },
                      isSelected && { color: colors.accentGold, fontWeight: typography.weights.semibold },
                    ]}
                  >
                    {ROLE_LABELS[role]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: colors.accentBlue },
              !selectedRole && { backgroundColor: colors.surfaceElevated },
            ]}
            onPress={() => setMode("registerCredentials")}
            disabled={!selectedRole}
          >
            <Text
              style={[
                styles.primaryButtonText,
                { color: colors.background },
                !selectedRole && { color: colors.textSecondary },
              ]}
            >
              Devam Et
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={resetToLogin}>
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>Girişe dön</Text>
          </TouchableOpacity>
        </>
      ) : null}

      {mode === "registerCredentials" && selectedRole ? (
        <>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Kayıt ol · <Text style={{ color: colors.accentGold }}>{ROLE_LABELS[selectedRole]}</Text>
          </Text>

          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="E-posta"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="Şifre"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="Şifre (tekrar)"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
          />
          <Text style={[styles.hint, { color: colors.textSecondary }]}>{PASSWORD_HINT}</Text>

          {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.accentBlue }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={[styles.primaryButtonText, { color: colors.background }]}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              setError(null);
              setMode("registerRole");
            }}
          >
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>Rolü değiştir</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
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
  linkButton: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  linkText: {
    fontSize: typography.sizes.sm,
  },
  categoryRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: typography.sizes.sm,
  },
  roleWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  roleChip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  roleChipText: {
    fontSize: typography.sizes.sm,
  },
});
