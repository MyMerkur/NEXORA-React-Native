import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
import { ModalShell } from "../../../components/ModalShell";
import { getMatches, type MatchItem } from "../../../services/matchingApi";
import type { ThreadContextType } from "../../../services/inboxApi";
import { InboxModal } from "../../inbox/components/InboxModal";
import { UserProfileModal } from "../../profiles/components/UserProfileModal";
import { OrgProfileModal } from "../../orgs/components/OrgProfileModal";

interface MatchesModalProps {
  visible: boolean;
  onClose: () => void;
}

const SHEET_HEIGHT: ViewStyle = { maxHeight: "80%" };

export function MatchesModal({ visible, onClose }: MatchesModalProps) {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatTarget, setChatTarget] = useState<{ userId: string; context: { type: ThreadContextType; id: string } } | null>(
    null,
  );
  const [profileTarget, setProfileTarget] = useState<{ id: string; role: "candidate" | "employer" } | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setLoading(true);
    setError(null);
    getMatches()
      .then(setMatches)
      .catch((err) => setError(getApiErrorMessage(err, "Eşleşmeler yüklenemedi")))
      .finally(() => setLoading(false));
  }, [visible]);

  return (
    <>
      <ModalShell visible={visible} onClose={onClose} variant="sheet" contentStyle={SHEET_HEIGHT}>
          <View style={styles.header}>
            <Text style={styles.title}>Eşleşmelerim</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Kapat</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.accentGold} style={styles.loader} />
          ) : (
            <ScrollView>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              {matches.length === 0 ? <Text style={styles.emptyText}>Henüz bir eşleşmen yok</Text> : null}
              {matches.map((match) => (
                <View key={match.id} style={styles.row}>
                  {match.counterpart.avatarUrl ? (
                    <Image source={{ uri: match.counterpart.avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]} />
                  )}
                  <View style={styles.rowContent}>
                    <TouchableOpacity
                      onPress={() => setProfileTarget({ id: match.counterpart.id, role: match.counterpartRole })}
                    >
                      <Text style={styles.name}>{match.counterpart.displayName}</Text>
                    </TouchableOpacity>
                    <Text style={styles.jobTitle}>{match.job.title}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      setChatTarget({ userId: match.counterpart.id, context: { type: "job", id: match.job.id } })
                    }
                  >
                    <Text style={styles.chatLink}>Sohbeti Aç</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
      </ModalShell>

      <InboxModal visible={chatTarget !== null} onClose={() => setChatTarget(null)} startTarget={chatTarget} />
      <UserProfileModal
        visible={profileTarget?.role === "candidate"}
        userId={profileTarget?.role === "candidate" ? profileTarget.id : null}
        onClose={() => setProfileTarget(null)}
      />
      <OrgProfileModal
        visible={profileTarget?.role === "employer"}
        orgUserId={profileTarget?.role === "employer" ? profileTarget.id : null}
        onClose={() => setProfileTarget(null)}
      />
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
  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    marginVertical: spacing.lg,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    marginRight: spacing.sm,
  },
  avatarPlaceholder: {
    backgroundColor: colors.surfaceElevated,
  },
  rowContent: {
    flex: 1,
  },
  name: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  jobTitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  chatLink: {
    color: colors.accentGold,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
});
