import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
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
            <Text style={styles.title}>💼 İşletme</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Kapat</Text>
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
              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Text style={styles.sectionTitle}>Aidiyet İstekleri</Text>
              {affiliationRequests.length === 0 ? (
                <Text style={styles.balanceText}>Bekleyen istek yok.</Text>
              ) : (
                affiliationRequests.map((request) => (
                  <View key={request.id} style={styles.affiliationRequestRow}>
                    <Text style={styles.affiliationRequestName}>{request.applicant.displayName}</Text>
                    <View style={styles.affiliationRequestActions}>
                      <TouchableOpacity
                        style={styles.affiliationApproveButton}
                        onPress={() => handleApproveAffiliation(request.id)}
                        disabled={respondingRequestId === request.id}
                      >
                        <Text style={styles.affiliationApproveButtonText}>Onayla</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.affiliationRejectButton}
                        onPress={() => handleRejectAffiliation(request.id)}
                        disabled={respondingRequestId === request.id}
                      >
                        <Text style={styles.affiliationRejectButtonText}>Reddet</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}

              <Text style={[styles.sectionTitle, styles.sectionSpacing]}>İlan Kredisi</Text>
              <Text style={styles.balanceText}>Bakiye: {balance ?? 0} kredi</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={() => setCreditCheckoutVisible(true)}>
                <Text style={styles.primaryButtonText}>1 Kredi Satın Al</Text>
              </TouchableOpacity>

              <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Keskin Nişancı Kredisi</Text>
              <Text style={styles.balanceText}>Bakiye: {sniperBalance ?? 0} kredi</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={() => setSniperCreditCheckoutVisible(true)}>
                <Text style={styles.primaryButtonText}>1 Kredi Satın Al</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setSniperSearchVisible(true)}>
                <Text style={styles.secondaryButtonText}>Aday Ara</Text>
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
  secondaryButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    alignItems: "center",
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accentGold,
  },
  secondaryButtonText: {
    color: colors.accentGold,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
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
  affiliationRequestRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  affiliationRequestName: {
    color: colors.textPrimary,
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
    backgroundColor: colors.accentBlue,
  },
  affiliationApproveButtonText: {
    color: colors.background,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  affiliationRejectButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  affiliationRejectButtonText: {
    color: colors.danger,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
});
