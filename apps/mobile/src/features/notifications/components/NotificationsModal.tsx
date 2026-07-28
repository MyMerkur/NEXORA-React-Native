import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
import { ModalShell } from "../../../components/ModalShell";
import { getNotifications, markNotificationRead, type NotificationItem } from "../../../services/notificationApi";

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

const SHEET_HEIGHT: ViewStyle = { maxHeight: "80%" };

export function NotificationsModal({ visible, onClose }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setLoading(true);
    setError(null);
    getNotifications()
      .then(setNotifications)
      .catch((err) => setError(getApiErrorMessage(err, "Bildirimler yüklenemedi")))
      .finally(() => setLoading(false));
  }, [visible]);

  async function handlePress(notification: NotificationItem) {
    if (notification.read) {
      return;
    }
    setNotifications((current) => current.map((item) => (item.id === notification.id ? { ...item, read: true } : item)));
    try {
      await markNotificationRead(notification.id);
    } catch {
      // sessizce yut, bir sonraki açılışta liste yeniden yüklenir
    }
  }

  return (
    <ModalShell visible={visible} onClose={onClose} variant="sheet" contentStyle={SHEET_HEIGHT}>
          <View style={styles.header}>
            <Text style={styles.title}>Bildirimler</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Kapat</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.accentGold} style={styles.loader} />
          ) : (
            <ScrollView>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              {notifications.length === 0 ? <Text style={styles.emptyText}>Henüz bildirimin yok</Text> : null}
              {notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={styles.row}
                  onPress={() => handlePress(notification)}
                  disabled={notification.read}
                >
                  <View style={styles.rowContent}>
                    <View style={styles.rowHeader}>
                      {!notification.read ? <View style={styles.unreadDot} /> : null}
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                    </View>
                    {notification.body ? <Text style={styles.notificationBody}>{notification.body}</Text> : null}
                  </View>
                </TouchableOpacity>
              ))}
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
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.md,
  },
  rowContent: {
    flex: 1,
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.accentGold,
    marginRight: spacing.xs,
  },
  notificationTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    flexShrink: 1,
  },
  notificationBody: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
});
