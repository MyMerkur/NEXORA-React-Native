import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
import { getMe, type UserProfile } from "../../../services/profileApi";
import { discoverHubs, listMyHubs, listManagedHubs, type HubItem } from "../../../services/hubApi";
import { HubDetailModal } from "../components/HubDetailModal";
import { CreateHubModal } from "../components/CreateHubModal";

type HubsTab = "discover" | "mine" | "managed";

const PAID_HUB_CREATION_KYC_LEVEL = 4;

export function HubsScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<HubsTab>("discover");
  const [hubs, setHubs] = useState<HubItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedHubId, setSelectedHubId] = useState<string | null>(null);
  const [createVisible, setCreateVisible] = useState(false);

  useEffect(() => {
    getMe()
      .then(setProfile)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    loadTab(activeTab);
  }, [activeTab]);

  async function loadTab(tab: HubsTab) {
    setLoading(true);
    setError(null);
    try {
      if (tab === "discover") {
        const result = await discoverHubs();
        setHubs(result.hubs);
      } else if (tab === "mine") {
        setHubs(await listMyHubs());
      } else {
        setHubs(await listManagedHubs());
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Hublar yüklenemedi"));
    } finally {
      setLoading(false);
    }
  }

  function handleMembershipChanged() {
    loadTab(activeTab);
  }

  function handleCreated() {
    setActiveTab("managed");
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hubs</Text>
        {profile && profile.kycLevel >= 1 ? (
          <TouchableOpacity style={styles.createButton} onPress={() => setCreateVisible(true)}>
            <Text style={styles.createButtonText}>+ Hub Oluştur</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "discover" && styles.tabButtonActive]}
          onPress={() => setActiveTab("discover")}
        >
          <Text style={[styles.tabText, activeTab === "discover" && styles.tabTextActive]}>Keşfet</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "mine" && styles.tabButtonActive]}
          onPress={() => setActiveTab("mine")}
        >
          <Text style={[styles.tabText, activeTab === "mine" && styles.tabTextActive]}>Hublarım</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "managed" && styles.tabButtonActive]}
          onPress={() => setActiveTab("managed")}
        >
          <Text style={[styles.tabText, activeTab === "managed" && styles.tabTextActive]}>Yönettiklerim</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator color={colors.accentGold} style={styles.loader} />
      ) : (
        <ScrollView style={styles.content}>
          {hubs.length === 0 ? (
            <Text style={styles.emptyText}>Henüz Hub yok.</Text>
          ) : (
            hubs.map((hub) => (
              <TouchableOpacity key={hub.id} style={styles.card} onPress={() => setSelectedHubId(hub.id)}>
                <Text style={styles.cardTitle}>{hub.name}</Text>
                {hub.description ? <Text style={styles.cardBody}>{hub.description}</Text> : null}
                <Text style={styles.cardMeta}>
                  {hub.memberCount} üye · {hub.type === "paid" ? `₺${hub.price}/ay` : "Ücretsiz"}
                  {hub.isMember ? " · Üyesiniz" : ""}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      <HubDetailModal
        hubId={selectedHubId}
        onClose={() => setSelectedHubId(null)}
        onMembershipChanged={handleMembershipChanged}
      />
      <CreateHubModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        canCreatePaid={(profile?.kycLevel ?? 0) >= PAID_HUB_CREATION_KYC_LEVEL}
        onCreated={handleCreated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: spacing.md,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  createButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.accentGold,
  },
  createButtonText: {
    color: colors.accentGold,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginHorizontal: spacing.md,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: colors.accentGold,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  tabTextActive: {
    color: colors.accentGold,
    fontWeight: typography.weights.semibold,
  },
  loader: {
    marginVertical: spacing.xl,
  },
  content: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  error: {
    color: colors.danger,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    textAlign: "center",
    marginVertical: spacing.lg,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  cardBody: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  cardMeta: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
  },
});
