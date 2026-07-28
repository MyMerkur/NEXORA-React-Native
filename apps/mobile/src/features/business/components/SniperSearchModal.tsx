import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import type { MicroCompetencyTag } from "@nexora/shared-constants";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
import {
  searchCandidates,
  unlockCandidate,
  getSniperCreditBalance,
  type SniperCandidate,
} from "../../../services/sniperApi";
import { ModalShell } from "../../../components/ModalShell";
import { TagPicker } from "../../../components/TagPicker";
import { InboxModal } from "../../inbox/components/InboxModal";
import { SniperCreditCheckoutWebView } from "./SniperCreditCheckoutWebView";

interface SniperSearchModalProps {
  visible: boolean;
  onClose: () => void;
}

const SHEET_HEIGHT: ViewStyle = { maxHeight: "85%" };

export function SniperSearchModal({ visible, onClose }: SniperSearchModalProps) {
  const [balance, setBalance] = useState(0);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [messagingCandidateId, setMessagingCandidateId] = useState<string | null>(null);

  const [specialties, setSpecialties] = useState<MicroCompetencyTag[]>([]);
  const [city, setCity] = useState("");
  const [minExperienceYears, setMinExperienceYears] = useState("");
  const [maxExperienceYears, setMaxExperienceYears] = useState("");

  const [results, setResults] = useState<SniperCandidate[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setCheckoutVisible(false);
    setMessagingCandidateId(null);
    loadBalance();
  }, [visible]);

  function loadBalance() {
    getSniperCreditBalance()
      .then(({ balance: value }) => setBalance(value))
      .catch(() => undefined);
  }

  async function handleSearch() {
    setLoading(true);
    setSearched(true);
    setError(null);
    try {
      const items = await searchCandidates({
        specialties,
        city: city.trim() || undefined,
        minExperienceYears: minExperienceYears ? Number(minExperienceYears) : undefined,
        maxExperienceYears: maxExperienceYears ? Number(maxExperienceYears) : undefined,
      });
      setResults(items);
    } catch (err) {
      setError(getApiErrorMessage(err, "Arama yapılamadı"));
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlock(candidateId: string) {
    setUnlockingId(candidateId);
    setError(null);
    try {
      const result = await unlockCandidate(candidateId);
      setResults((current) => current.map((item) => (item.candidateId === candidateId ? result.candidate : item)));
      loadBalance();
    } catch (err) {
      setError(getApiErrorMessage(err, "Aday açılamadı"));
    } finally {
      setUnlockingId(null);
    }
  }

  function handleCreditCheckoutDone(result: "success" | "cancelled") {
    setCheckoutVisible(false);
    if (result === "success") {
      loadBalance();
    }
  }

  if (messagingCandidateId) {
    return (
      <InboxModal
        visible={visible}
        onClose={() => setMessagingCandidateId(null)}
        startTarget={{ userId: messagingCandidateId }}
      />
    );
  }

  return (
    <ModalShell visible={visible} onClose={onClose} variant="sheet" contentStyle={SHEET_HEIGHT}>
          <View style={styles.header}>
            <Text style={styles.title}>🎯 Keskin Nişancı</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Kapat</Text>
            </TouchableOpacity>
          </View>

          {checkoutVisible ? (
            <SniperCreditCheckoutWebView startingBalance={balance} onDone={handleCreditCheckoutDone} />
          ) : (
            <ScrollView>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceText}>Kredi bakiyesi: {balance}</Text>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => setCheckoutVisible(true)}>
                  <Text style={styles.secondaryButtonText}>1 Kredi Satın Al</Text>
                </TouchableOpacity>
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Text style={styles.sectionTitle}>Uzmanlık</Text>
              <TagPicker selected={specialties} onChange={setSpecialties} />
              <TextInput
                style={styles.input}
                placeholder="Şehir (opsiyonel)"
                placeholderTextColor={colors.textSecondary}
                value={city}
                onChangeText={setCity}
              />
              <View style={styles.rangeRow}>
                <TextInput
                  style={[styles.input, styles.rangeInput]}
                  placeholder="Min. deneyim (yıl)"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  value={minExperienceYears}
                  onChangeText={setMinExperienceYears}
                />
                <TextInput
                  style={[styles.input, styles.rangeInput]}
                  placeholder="Maks. deneyim (yıl)"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  value={maxExperienceYears}
                  onChangeText={setMaxExperienceYears}
                />
              </View>
              <TouchableOpacity style={styles.primaryButton} onPress={handleSearch} disabled={loading}>
                {loading ? <ActivityIndicator color={colors.background} /> : <Text style={styles.primaryButtonText}>Ara</Text>}
              </TouchableOpacity>

              {searched && !loading ? (
                results.length === 0 ? (
                  <Text style={styles.emptyText}>Kriterlere uyan aday bulunamadı.</Text>
                ) : (
                  results.map((candidate) => (
                    <View key={candidate.candidateId} style={styles.card}>
                      <Text style={styles.cardTitle}>{candidate.unlocked ? candidate.displayName : "Gizli Aday"}</Text>
                      <Text style={styles.cardSubtitle}>
                        {candidate.specialties.join(", ") || "Uzmanlık belirtilmemiş"}
                      </Text>
                      <Text style={styles.cardBody}>
                        {candidate.city || "Şehir belirtilmemiş"}
                        {candidate.experienceYears !== null ? ` · ${candidate.experienceYears} yıl deneyim` : ""}
                      </Text>
                      {candidate.unlocked ? (
                        <TouchableOpacity
                          style={styles.primaryButton}
                          onPress={() => setMessagingCandidateId(candidate.candidateId)}
                        >
                          <Text style={styles.primaryButtonText}>Mesaj Gönder</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.primaryButton}
                          onPress={() => handleUnlock(candidate.candidateId)}
                          disabled={unlockingId === candidate.candidateId}
                        >
                          {unlockingId === candidate.candidateId ? (
                            <ActivityIndicator color={colors.background} />
                          ) : (
                            <Text style={styles.primaryButtonText}>Kredi ile Aç (1 kredi)</Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  ))
                )
              ) : null}
            </ScrollView>
          )}
    </ModalShell>
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
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  balanceText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  secondaryButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.accentGold,
  },
  secondaryButtonText: {
    color: colors.accentGold,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
    fontSize: typography.sizes.md,
  },
  rangeRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  rangeInput: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: colors.accentBlue,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    textAlign: "center",
    marginVertical: spacing.lg,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  cardBody: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
});
