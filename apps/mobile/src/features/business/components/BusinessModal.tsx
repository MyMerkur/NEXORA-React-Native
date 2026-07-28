import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { radii, spacing, typography } from "@nexora/ui-tokens";
import { useTheme } from "../../../store/useThemeStore";
import { ModalShell } from "../../../components/ModalShell";
import { getJobCreditBalance } from "../../../services/jobCreditApi";
import { getSniperCreditBalance } from "../../../services/sniperApi";
import { getSubscriptionStatus, cancelSubscription, type SubscriptionSummary } from "../../../services/subscriptionApi";
import {
  listAffiliationRequests,
  approveAffiliationRequest,
  rejectAffiliationRequest,
  type PendingAffiliationRequest,
} from "../../../services/orgApi";
import { useAuthStore } from "../../../store/useAuthStore";
import { CheckoutWebView } from "../../subscription/components/CheckoutWebView";
import { JobCreditCheckoutWebView } from "./JobCreditCheckoutWebView";
import { SniperCreditCheckoutWebView } from "./SniperCreditCheckoutWebView";
import { SniperSearchModal } from "./SniperSearchModal";

interface BusinessModalProps {
  visible: boolean;
  onClose: () => void;
}

const SHEET_HEIGHT: ViewStyle = { maxHeight: "85%" };

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
  const { colors } = useTheme();
  const [balance, setBalance] = useState<number | null>(null);
  const [sniperBalance, setSniperBalance] = useState<number | null>(null);
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [creditCheckoutVisible, setCreditCheckoutVisible] = useState(false);
  const [sniperCreditCheckoutVisible, setSniperCreditCheckoutVisible] = useState(false);
  const [sniperSearchVisible, setSniperSearchVisible] = useState(false);
  const [subscriptionCheckoutVisible, setSubscriptionCheckoutVisible] = useState(false);
  const [affiliationRequests, setAffiliationRequests] = useState<PendingAffiliationRequest[]>([]);
  const [respondingRequestId, setRespondingRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const orgId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setCreditCheckoutVisible(false);
    setSniperCreditCheckoutVisible(false);
    setSubscriptionCheckoutVisible(false);
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- orgId is stable for the session
  }, [visible]);

  function loadData() {
    if (!orgId) {
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      getJobCreditBalance(),
      getSniperCreditBalance(),
      getSubscriptionStatus(),
      listAffiliationRequests(orgId),
    ])
      .then(([creditResult, sniperCreditResult, subscriptionResult, requests]) => {
        setBalance(creditResult.balance);
        setSniperBalance(sniperCreditResult.balance);
        setSummary(subscriptionResult);
        setAffiliationRequests(requests);
      })
      .catch((err) => setError(getApiErrorMessage(err, "Yüklenemedi")))
      .finally(() => setLoading(false));
  }

  async function handleApproveAffiliation(requestId: string) {
    if (!orgId) {
      return;
    }
    setRespondingRequestId(requestId);
    setError(null);
    try {
      await approveAffiliationRequest(orgId, requestId);
      setAffiliationRequests((current) => current.filter((item) => item.id !== requestId));
    } catch (err) {
      setError(getApiErrorMessage(err, "İstek onaylanamadı"));
    } finally {
      setRespondingRequestId(null);
    }
  }

  async function handleRejectAffiliation(requestId: string) {
    if (!orgId) {
      return;
    }
    setRespondingRequestId(requestId);
    setError(null);
    try {
      await rejectAffiliationRequest(orgId, requestId);
      setAffiliationRequests((current) => current.filter((item) => item.id !== requestId));
    } catch (err) {
      setError(getApiErrorMessage(err, "İstek reddedilemedi"));
    } finally {
      setRespondingRequestId(null);
    }
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

  function handleSniperCreditCheckoutDone(result: "success" | "cancelled") {
    setSniperCreditCheckoutVisible(false);
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
    <>
      <ModalShell visible={visible} onClose={onClose} variant="sheet" contentStyle={SHEET_HEIGHT}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>💼 İşletme</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeText, { color: colors.accentGold }]}>Kapat</Text>
            </TouchableOpacity>
          </View>

          {creditCheckoutVisible ? (
            <JobCreditCheckoutWebView startingBalance={balance ?? 0} onDone={handleCreditCheckoutDone} />
          ) : sniperCreditCheckoutVisible ? (
            <SniperCreditCheckoutWebView startingBalance={sniperBalance ?? 0} onDone={handleSniperCreditCheckoutDone} />
          ) : subscriptionCheckoutVisible ? (
            <CheckoutWebView planCode={PLAN_CODE} onDone={handleSubscriptionCheckoutDone} />
          ) : loading ? (
            <ActivityIndicator color={colors.accentGold} style={styles.loader} />
          ) : (
            <View style={styles.content}>
              {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Aidiyet İstekleri</Text>
              {affiliationRequests.length === 0 ? (
                <Text style={[styles.balanceText, { color: colors.textSecondary }]}>Bekleyen istek yok.</Text>
              ) : (
                affiliationRequests.map((request) => (
                  <View
                    key={request.id}
                    style={[styles.affiliationRequestRow, { borderBottomColor: colors.border }]}
                  >
                    <Text style={[styles.affiliationRequestName, { color: colors.textPrimary }]}>
                      {request.applicant.displayName}
                    </Text>
                    <View style={styles.affiliationRequestActions}>
                      <TouchableOpacity
                        style={[styles.affiliationApproveButton, { backgroundColor: colors.accentBlue }]}
                        onPress={() => handleApproveAffiliation(request.id)}
                        disabled={respondingRequestId === request.id}
                      >
                        <Text style={[styles.affiliationApproveButtonText, { color: colors.background }]}>
                          Onayla
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.affiliationRejectButton, { borderColor: colors.danger }]}
                        onPress={() => handleRejectAffiliation(request.id)}
                        disabled={respondingRequestId === request.id}
                      >
                        <Text style={[styles.affiliationRejectButtonText, { color: colors.danger }]}>Reddet</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}

              <Text style={[styles.sectionTitle, styles.sectionSpacing, { color: colors.textPrimary }]}>
                İlan Kredisi
              </Text>
              <Text style={[styles.balanceText, { color: colors.textSecondary }]}>Bakiye: {balance ?? 0} kredi</Text>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.accentBlue }]}
                onPress={() => setCreditCheckoutVisible(true)}
              >
                <Text style={[styles.primaryButtonText, { color: colors.background }]}>1 Kredi Satın Al</Text>
              </TouchableOpacity>

              <Text style={[styles.sectionTitle, styles.sectionSpacing, { color: colors.textPrimary }]}>
                Keskin Nişancı Kredisi
              </Text>
              <Text style={[styles.balanceText, { color: colors.textSecondary }]}>
                Bakiye: {sniperBalance ?? 0} kredi
              </Text>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.accentBlue }]}
                onPress={() => setSniperCreditCheckoutVisible(true)}
              >
                <Text style={[styles.primaryButtonText, { color: colors.background }]}>1 Kredi Satın Al</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.accentGold }]}
                onPress={() => setSniperSearchVisible(true)}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.accentGold }]}>Aday Ara</Text>
              </TouchableOpacity>

              <Text style={[styles.sectionTitle, styles.sectionSpacing, { color: colors.textPrimary }]}>
                Premium Abonelik
              </Text>
              {summary ? (
                <>
                  <Text style={[styles.statusLabel, { color: colors.textPrimary }]}>
                    {STATUS_LABELS[summary.status]}
                  </Text>
                  {summary.status === "active" && summary.currentPeriodEnd ? (
                    <Text style={[styles.periodText, { color: colors.textSecondary }]}>
                      Yenilenme tarihi: {new Date(summary.currentPeriodEnd).toLocaleDateString("tr-TR")}
                    </Text>
                  ) : null}
                  {summary.status === "active" ? (
                    <TouchableOpacity
                      style={[styles.dangerButton, { borderColor: colors.danger }]}
                      onPress={handleCancelSubscription}
                      disabled={canceling}
                    >
                      {canceling ? (
                        <ActivityIndicator color={colors.danger} />
                      ) : (
                        <Text style={[styles.dangerButtonText, { color: colors.danger }]}>İptal Et</Text>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.primaryButton, { backgroundColor: colors.accentBlue }]}
                      onPress={() => setSubscriptionCheckoutVisible(true)}
                    >
                      <Text style={[styles.primaryButtonText, { color: colors.background }]}>Premium Abone Ol</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : null}
            </View>
          )}
      </ModalShell>
      <SniperSearchModal visible={sniperSearchVisible} onClose={() => setSniperSearchVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  closeText: {
    fontSize: typography.sizes.sm,
  },
  loader: {
    marginVertical: spacing.xl,
  },
  content: {
    paddingBottom: spacing.md,
  },
  error: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  sectionSpacing: {
    marginTop: spacing.lg,
  },
  balanceText: {
    fontSize: typography.sizes.sm,
    marginBottom: spacing.sm,
  },
  statusLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  periodText: {
    fontSize: typography.sizes.sm,
    marginBottom: spacing.md,
  },
  primaryButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  secondaryButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    alignItems: "center",
    marginTop: spacing.sm,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  primaryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  dangerButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.md,
    borderWidth: 1,
  },
  dangerButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  affiliationRequestRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  affiliationRequestName: {
    fontSize: typography.sizes.sm,
    flexShrink: 1,
    marginRight: spacing.sm,
  },
  affiliationRequestActions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  affiliationApproveButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  affiliationApproveButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  affiliationRejectButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
  },
  affiliationRejectButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
});
