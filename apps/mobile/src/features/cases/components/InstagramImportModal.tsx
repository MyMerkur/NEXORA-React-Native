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
import {
  getInstagramStatus,
  listInstagramMedia,
  disconnectInstagram,
  type InstagramMediaItem,
} from "../../../services/instagramApi";
import { InstagramConnectWebView } from "./InstagramConnectWebView";

interface InstagramImportModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (media: { mediaUrl: string; caption: string }) => void;
}

const SHEET_HEIGHT: ViewStyle = { maxHeight: "85%" };

export function InstagramImportModal({ visible, onClose, onSelect }: InstagramImportModalProps) {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [media, setMedia] = useState<InstagramMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setConnecting(false);
    loadStatus();
  }, [visible]);

  async function loadStatus() {
    setLoading(true);
    setError(null);
    try {
      const status = await getInstagramStatus();
      setConnected(status.connected);
      if (status.connected) {
        const items = await listInstagramMedia();
        setMedia(items);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Instagram durumu yüklenemedi"));
    } finally {
      setLoading(false);
    }
  }

  function handleConnectDone(result: "success" | "cancelled") {
    setConnecting(false);
    if (result === "success") {
      loadStatus();
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      await disconnectInstagram();
      setConnected(false);
      setMedia([]);
    } catch (err) {
      setError(getApiErrorMessage(err, "Bağlantı kaldırılamadı"));
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <ModalShell visible={visible} onClose={onClose} variant="sheet" contentStyle={SHEET_HEIGHT}>
          <View style={styles.header}>
            <Text style={styles.title}>Instagram'dan İçe Aktar</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Kapat</Text>
            </TouchableOpacity>
          </View>

          {connecting ? (
            <InstagramConnectWebView onDone={handleConnectDone} />
          ) : loading ? (
            <ActivityIndicator color={colors.accentGold} style={styles.loader} />
          ) : (
            <View style={styles.content}>
              {error ? <Text style={styles.error}>{error}</Text> : null}

              {connected === false ? (
                <TouchableOpacity style={styles.primaryButton} onPress={() => setConnecting(true)}>
                  <Text style={styles.primaryButtonText}>Instagram Hesabını Bağla</Text>
                </TouchableOpacity>
              ) : null}

              {connected === true ? (
                <>
                  <TouchableOpacity onPress={handleDisconnect} disabled={disconnecting}>
                    <Text style={styles.disconnectLink}>
                      {disconnecting ? "Kaldırılıyor…" : "Bağlantıyı Kaldır"}
                    </Text>
                  </TouchableOpacity>
                  <ScrollView contentContainerStyle={styles.mediaGrid}>
                    {media.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.mediaItem}
                        onPress={() => onSelect({ mediaUrl: item.mediaUrl, caption: item.caption })}
                      >
                        <Image source={{ uri: item.mediaUrl }} style={styles.mediaThumbnail} />
                        {item.caption ? (
                          <Text style={styles.mediaCaption} numberOfLines={2}>
                            {item.caption}
                          </Text>
                        ) : null}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              ) : null}
            </View>
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
  primaryButton: {
    backgroundColor: colors.accentBlue,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  disconnectLink: {
    color: colors.danger,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.md,
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  mediaItem: {
    width: 100,
  },
  mediaThumbnail: {
    width: 100,
    height: 100,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceElevated,
  },
  mediaCaption: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
  },
});
