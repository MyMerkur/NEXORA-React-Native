import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import { getApiErrorMessage } from "@nexora/api-client";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
import { getConnectAuthorizeUrl, getInstagramStatus } from "../../../services/instagramApi";

interface InstagramConnectWebViewProps {
  onDone: (result: "success" | "cancelled") => void;
}

export function InstagramConnectWebView({ onDone }: InstagramConnectWebViewProps) {
  const [authorizeUrl, setAuthorizeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getConnectAuthorizeUrl()
      .then(setAuthorizeUrl)
      .catch((err) => setError(getApiErrorMessage(err, "Instagram bağlantısı başlatılamadı")))
      .finally(() => setLoading(false));
  }, []);

  async function confirmConnection() {
    setConfirming(true);
    try {
      const status = await getInstagramStatus();
      if (status.connected) {
        onDone("success");
        return;
      }
      setError("Bağlantı doğrulanamadı, lütfen tekrar dene");
    } catch (err) {
      setError(getApiErrorMessage(err, "Bağlantı doğrulanamadı"));
    } finally {
      setConfirming(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accentGold} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => onDone("cancelled")}>
          <Text style={styles.primaryButtonText}>Kapat</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (confirming) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accentGold} />
        <Text style={styles.confirmingText}>Bağlantı doğrulanıyor…</Text>
      </View>
    );
  }

  if (!authorizeUrl) {
    return null;
  }

  return (
    <View style={styles.webviewContainer}>
      <WebView
        source={{ uri: authorizeUrl }}
        onNavigationStateChange={(navState) => {
          if (navState.url.includes("/instagram/oauth/callback")) {
            confirmConnection();
          }
        }}
      />
      <TouchableOpacity style={styles.cancelLink} onPress={() => onDone("cancelled")}>
        <Text style={styles.cancelLinkText}>Vazgeç</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.accentBlue,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  confirmingText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: spacing.md,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  webviewContainer: {
    height: 480,
  },
  cancelLink: {
    alignItems: "center",
    marginVertical: spacing.md,
  },
  cancelLinkText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
});
