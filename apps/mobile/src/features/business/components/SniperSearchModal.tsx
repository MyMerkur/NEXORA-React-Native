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
import { radii, spacing, typography } from "@nexora/ui-tokens";
import { useTheme } from "../../../store/useThemeStore";
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
  const { colors } = useTheme();
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
            <Text style={[styles.title, { color: colors.textPrimary }]}>🎯 Keskin Nişancı</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeText, { color: colors.accentGold }]}>Kapat</Text>
            </TouchableOpacity>
          </View>

          {checkoutVisible ? (
            <SniperCreditCheckoutWebView startingBalance={balance} onDone={handleCreditCheckoutDone} />
          ) : (
            <ScrollView>
              <View style={styles.balanceRow}>
                <Text style={[styles.balanceText, { color: colors.textPrimary }]}>Kredi bakiyesi: {balance}</Text>
                <TouchableOpacity
                  style={[styles.secondaryButton, { borderColor: colors.accentGold }]}
                  onPress={() => setCheckoutVisible(true)}
                >
                  <Text style={[styles.secondaryButtonText, { color: colors.accentGold }]}>1 Kredi Satın Al</Text>
                </TouchableOpacity>
              </View>

              {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Uzmanlık</Text>
              <TagPicker selected={specialties} onChange={setSpecialties} />
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="Şehir (opsiyonel)"
                placeholderTextColor={colors.textSecondary}
                value={city}
                onChangeText={setCity}
              />
              <View style={styles.rangeRow}>
                <TextInput
                  style={[
                    styles.input,
                    styles.rangeInput,
                    { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                  placeholder="Min. deneyim (yıl)"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  value={minExperienceYears}
                  onChangeText={setMinExperienceYears}
                />
                <TextInput
                  style={[
                    styles.input,
                    styles.rangeInput,
                    { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                  placeholder="Maks. deneyim (yıl)"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  value={maxExperienceYears}
                  onChangeText={setMaxExperienceYears}
                />
              </View>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.accentBlue }]}
                onPress={handleSearch}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={[styles.primaryButtonText, { color: colors.background }]}>Ara</Text>
                )}
              </TouchableOpacity>

              {searched && !loading ? (
                results.length === 0 ? (
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Kriterlere uyan aday bulunamadı.
                  </Text>
                ) : (
                  results.map((candidate) => (
                    <View
                      key={candidate.candidateId}
                      style={[styles.card, { backgroundColor: colors.surfaceElevated }]}
                    >
                      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                        {candidate.unlocked ? candidate.displayName : "Gizli Aday"}
                      </Text>
                      <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                        {candidate.specialties.join(", ") || "Uzmanlık belirtilmemiş"}
                      </Text>
                      <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
                        {candidate.city || "Şehir belirtilmemiş"}
                        {candidate.experienceYears !== null ? ` · ${candidate.experienceYears} yıl deneyim` : ""}
                      </Text>
                      {candidate.unlocked ? (
                        <TouchableOpacity
                          style={[styles.primaryButton, { backgroundColor: colors.accentBlue }]}
                          onPress={() => setMessagingCandidateId(candidate.candidateId)}
                        >
                          <Text style={[styles.primaryButtonText, { color: colors.background }]}>Mesaj Gönder</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[styles.primaryButton, { backgroundColor: colors.accentBlue }]}
                          onPress={() => handleUnlock(candidate.candidateId)}
                          disabled={unlockingId === candidate.candidateId}
                        >
                          {unlockingId === candidate.candidateId ? (
                            <ActivityIndicator color={colors.background} />
                          ) : (
                            <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                              Kredi ile Aç (1 kredi)
                            </Text>
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
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  closeText: {
    fontSize: typography.sizes.sm,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  balanceText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  secondaryButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
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
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    textAlign: "center",
    marginVertical: spacing.lg,
  },
  error: {
    marginBottom: spacing.sm,
  },
  card: {
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  cardSubtitle: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  cardBody: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
});
