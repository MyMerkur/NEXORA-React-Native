import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
import { getSubscriptionStatus, cancelSubscription, type SubscriptionSummary } from "../../../services/subscriptionApi";
import { CheckoutWebView } from "./CheckoutWebView";

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

const PLAN_CODE = "teaser_monthly";

const STATUS_LABELS: Record<SubscriptionSummary["status"], string> = {
  none: "Aboneliğiniz yok",
  pending_checkout: "Ödeme bekleniyor",
  active: "Aktif",
  past_due: "Ödeme sorunu",
  canceled: "İptal edildi",
  expired: "Süresi doldu",
};

export function SubscriptionModal({ visible, onClose }: SubscriptionModalProps) {
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setCheckoutVisible(false);
    loadStatus();
  }, [visible]);

  function loadStatus() {
    setLoading(true);
    setError(null);
    getSubscriptionStatus()
      .then(setSummary)
      .catch((err) => setError(getApiErrorMessage(err, "Abonelik durumu yüklenemedi")))
      .finally(() => setLoading(false));
  }

  async function handleCancel() {
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

  function handleCheckoutDone(result: "success" | "cancelled") {
    setCheckoutVisible(false);
    if (result === "success") {
      loadStatus();
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Aboneliğim</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Kapat</Text>
            </TouchableOpacity>
          </View>

          {checkoutVisible ? (
            <CheckoutWebView planCode={PLAN_CODE} onDone={handleCheckoutDone} />
          ) : loading ? (
            <ActivityIndicator color={colors.accentGold} style={styles.loader} />
          ) : (
            <View style={styles.content}>
              {error ? <Text style={styles.error}>{error}</Text> : null}

              {summary ? (
                <>
                  <Text style={styles.statusLabel}>{STATUS_LABELS[summary.status]}</Text>
                  {summary.status === "active" && summary.currentPeriodEnd ? (
                    <Text style={styles.periodText}>
                      Yenilenme tarihi: {new Date(summary.currentPeriodEnd).toLocaleDateString("tr-TR")}
                    </Text>
                  ) : null}

                  {summary.status === "active" ? (
                    <TouchableOpacity style={styles.dangerButton} onPress={handleCancel} disabled={canceling}>
                      {canceling ? (
                        <ActivityIndicator color={colors.danger} />
                      ) : (
                        <Text style={styles.dangerButtonText}>İptal Et</Text>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.primaryButton} onPress={() => setCheckoutVisible(true)}>
                      <Text style={styles.primaryButtonText}>Abone Ol</Text>
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
    marginTop: spacing.md,
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
