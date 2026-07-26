import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
import { getJobCreditBalance } from "../../../services/jobCreditApi";
import { getSubscriptionStatus, cancelSubscription, type SubscriptionSummary } from "../../../services/subscriptionApi";
import { CheckoutWebView } from "../../subscription/components/CheckoutWebView";
import { JobCreditCheckoutWebView } from "./JobCreditCheckoutWebView";

interface BusinessModalProps {
  visible: boolean;
  onClose: () => void;
}

const PLAN_CODE = "clinic_premium_monthly";

const STATUS_LABELS: Record<SubscriptionSummary["status"], string> = {
  none: "Aboneliğiniz yok",
  pending_checkout: "Ödeme bekleniyor",
  active: "Aktif",
  past_due: "Ödeme sorunu",
  canceled: "İptal edildi",
  expired: "Süresi doldu",
};

export function BusinessModal({ visible, onClose }: BusinessModalProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [creditCheckoutVisible, setCreditCheckoutVisible] = useState(false);
  const [subscriptionCheckoutVisible, setSubscriptionCheckoutVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setCreditCheckoutVisible(false);
    setSubscriptionCheckoutVisible(false);
    loadData();
  }, [visible]);

  function loadData() {
    setLoading(true);
    setError(null);
    Promise.all([getJobCreditBalance(), getSubscriptionStatus()])
      .then(([creditResult, subscriptionResult]) => {
        setBalance(creditResult.balance);
        setSummary(subscriptionResult);
      })
      .catch((err) => setError(getApiErrorMessage(err, "Yüklenemedi")))
      .finally(() => setLoading(false));
  }

  async function handleCancelSubscription() {
    setCanceling(true);
    setError(null);
    try {
      const updated = await cancelSubscription();
      setSummary(updated);
    } catch (err) {
      setError(getApiErrorMessage(err, "Abonelik iptal edilemedi"));
    } finally {
      setCanceling(false);
    }
  }

  function handleCreditCheckoutDone(result: "success" | "cancelled") {
    setCreditCheckoutVisible(false);
    if (result === "success") {
      loadData();
    }
  }

  function handleSubscriptionCheckoutDone(result: "success" | "cancelled") {
    setSubscriptionCheckoutVisible(false);
    if (result === "success") {
      loadData();
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>💼 İşletme</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Kapat</Text>
            </TouchableOpacity>
          </View>

          {creditCheckoutVisible ? (
            <JobCreditCheckoutWebView startingBalance={balance ?? 0} onDone={handleCreditCheckoutDone} />
          ) : subscriptionCheckoutVisible ? (
            <CheckoutWebView planCode={PLAN_CODE} onDone={handleSubscriptionCheckoutDone} />
          ) : loading ? (
            <ActivityIndicator color={colors.accentGold} style={styles.loader} />
          ) : (
            <View style={styles.content}>
              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Text style={styles.sectionTitle}>İlan Kredisi</Text>
              <Text style={styles.balanceText}>Bakiye: {balance ?? 0} kredi</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={() => setCreditCheckoutVisible(true)}>
                <Text style={styles.primaryButtonText}>1 Kredi Satın Al</Text>
              </TouchableOpacity>

              <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Premium Abonelik</Text>
              {summary ? (
                <>
                  <Text style={styles.statusLabel}>{STATUS_LABELS[summary.status]}</Text>
                  {summary.status === "active" && summary.currentPeriodEnd ? (
                    <Text style={styles.periodText}>
                      Yenilenme tarihi: {new Date(summary.currentPeriodEnd).toLocaleDateString("tr-TR")}
                    </Text>
                  ) : null}
                  {summary.status === "active" ? (
                    <TouchableOpacity style={styles.dangerButton} onPress={handleCancelSubscription} disabled={canceling}>
                      {canceling ? (
                        <ActivityIndicator color={colors.danger} />
                      ) : (
                        <Text style={styles.dangerButtonText}>İptal Et</Text>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.primaryButton} onPress={() => setSubscriptionCheckoutVisible(true)}>
                      <Text style={styles.primaryButtonText}>Premium Abone Ol</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : null}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  closeText: {
    color: colors.accentGold,
    fontSize: typography.sizes.sm,
  },
  loader: {
    marginVertical: spacing.xl,
  },
  content: {
    paddingBottom: spacing.md,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  sectionSpacing: {
    marginTop: spacing.lg,
  },
  balanceText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.sm,
  },
  statusLabel: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  periodText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.accentBlue,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  dangerButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  dangerButtonText: {
    color: colors.danger,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
