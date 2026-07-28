import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import axios from "axios";
import { getApiErrorMessage } from "@nexora/api-client";
import { radii, spacing, typography } from "@nexora/ui-tokens";
import { useTheme } from "../../../store/useThemeStore";
import { startTicketCheckout, listMyTickets } from "../../../services/eventApi";
import type { BillingInfoInput } from "../../../services/subscriptionApi";

interface EventTicketCheckoutWebViewProps {
  eventId: string;
  ticketTypeId: string;
  startingTicketCount: number;
  onDone: (result: "success" | "cancelled") => void;
}

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 15;

export function EventTicketCheckoutWebView({
  eventId,
  ticketTypeId,
  startingTicketCount,
  onDone,
}: EventTicketCheckoutWebViewProps) {
  const { colors } = useTheme();
  const [checkoutFormContent, setCheckoutFormContent] = useState<string | null>(null);
  const [needsBillingInfo, setNeedsBillingInfo] = useState(false);
  const [billingInfo, setBillingInfo] = useState<BillingInfoInput>({});
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    attemptCheckout({});
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only; eventId/ticketTypeId are stable for this modal's lifetime
  }, []);

  async function attemptCheckout(fields: BillingInfoInput) {
    setLoading(true);
    setError(null);
    try {
      const session = await startTicketCheckout(eventId, ticketTypeId, fields);
      setCheckoutFormContent(session.checkoutFormContent);
      setNeedsBillingInfo(false);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setNeedsBillingInfo(true);
      } else {
        setError(getApiErrorMessage(err, "Bilet satın alma başlatılamadı"));
      }
    } finally {
      setLoading(false);
    }
  }

  async function pollForCompletion() {
    setConfirming(true);
    for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt += 1) {
      await new Promise<void>((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      try {
        const tickets = await listMyTickets();
        if (tickets.length > startingTicketCount) {
          onDone("success");
          return;
        }
      } catch {
        // sessizce yut, sıradaki denemede tekrar sorulacak
      }
    }
    setConfirming(false);
    setError("Ödeme durumu doğrulanamadı, lütfen tekrar deneyin");
  }

  if (needsBillingInfo) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Fatura Bilgileri</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Bu bilgiler bir kere istenir, sonraki satın alımlarda tekrar sorulmaz.
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="TC Kimlik No"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          maxLength={11}
          value={billingInfo.identityNumber ?? ""}
          onChangeText={(value) => setBillingInfo((current) => ({ ...current, identityNumber: value }))}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="Telefon"
          placeholderTextColor={colors.textSecondary}
          keyboardType="phone-pad"
          value={billingInfo.phone ?? ""}
          onChangeText={(value) => setBillingInfo((current) => ({ ...current, phone: value }))}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="Adres"
          placeholderTextColor={colors.textSecondary}
          value={billingInfo.address ?? ""}
          onChangeText={(value) => setBillingInfo((current) => ({ ...current, address: value }))}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="Şehir"
          placeholderTextColor={colors.textSecondary}
          value={billingInfo.city ?? ""}
          onChangeText={(value) => setBillingInfo((current) => ({ ...current, city: value }))}
        />
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.accentBlue }]}
          onPress={() => attemptCheckout(billingInfo)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={[styles.primaryButtonText, { color: colors.background }]}>Devam Et</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accentGold} />
      </View>
    );
  }

  if (confirming) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accentGold} />
        <Text style={[styles.confirmingText, { color: colors.textSecondary }]}>Ödeme sonucu doğrulanıyor…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.accentBlue }]} onPress={() => onDone("cancelled")}>
          <Text style={[styles.primaryButtonText, { color: colors.background }]}>Kapat</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!checkoutFormContent) {
    return null;
  }

  return (
    <View style={styles.webviewContainer}>
      <WebView
        source={{ html: checkoutFormContent }}
        onNavigationStateChange={(navState) => {
          if (navState.url.includes("/payments/iyzico/event-ticket-callback")) {
            pollForCompletion();
          }
        }}
      />
      <TouchableOpacity
        style={[styles.manualConfirmButton, { backgroundColor: colors.accentBlue }]}
        onPress={pollForCompletion}
      >
        <Text style={[styles.manualConfirmButtonText, { color: colors.background }]}>Ödemeyi tamamladım</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelLink} onPress={() => onDone("cancelled")}>
        <Text style={[styles.cancelLinkText, { color: colors.textSecondary }]}>Vazgeç</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    marginBottom: spacing.md,
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    fontSize: typography.sizes.md,
  },
  primaryButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  confirmingText: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.md,
  },
  error: {
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  webviewContainer: {
    height: 480,
  },
  manualConfirmButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    alignItems: "center",
    margin: spacing.md,
  },
  manualConfirmButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  cancelLink: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  cancelLinkText: {
    fontSize: typography.sizes.sm,
  },
});
