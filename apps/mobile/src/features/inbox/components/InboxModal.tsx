import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
import { ModalShell } from "../../../components/ModalShell";
import { useAuthStore } from "../../../store/useAuthStore";
import { getSocket } from "../../../services/socket";
import {
  startThread,
  listThreads,
  listMessages,
  sendMessage,
  type ThreadCategory,
  type ThreadContextType,
  type ThreadSummary,
  type MessageItem,
} from "../../../services/inboxApi";

interface InboxModalProps {
  visible: boolean;
  onClose: () => void;
  startTarget?: { userId: string; context?: { type: ThreadContextType; id?: string } } | null;
}

const SHEET_HEIGHT: ViewStyle = { height: "85%" };
const FLEX_FILL: ViewStyle = { flex: 1 };

const CATEGORY_LABELS: Record<"all" | ThreadCategory, string> = {
  all: "Tümü",
  job: "İş",
  case: "Vaka",
  general: "Genel",
};

export function InboxModal({ visible, onClose, startTarget }: InboxModalProps) {
  const [view, setView] = useState<"list" | "thread">("list");
  const [categoryFilter, setCategoryFilter] = useState<"all" | ThreadCategory>("all");
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [activeThread, setActiveThread] = useState<ThreadSummary | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const currentUserId = useAuthStore((state) => state.user?.id);

  const loadThreads = useCallback(() => {
    setLoading(true);
    setError(null);
    listThreads()
      .then((page) => setThreads(page.threads))
      .catch((err) => setError(getApiErrorMessage(err, "Sohbetler yüklenemedi")))
      .finally(() => setLoading(false));
  }, []);

  const openThread = useCallback((thread: ThreadSummary) => {
    setActiveThread(thread);
    setView("thread");
    setLoading(true);
    setError(null);
    listMessages(thread.id)
      .then((page) => setMessages([...page.messages].reverse()))
      .catch((err) => setError(getApiErrorMessage(err, "Mesajlar yüklenemedi")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!visible) {
      setView("list");
      setActiveThread(null);
      setMessages([]);
      return;
    }

    if (startTarget) {
      setLoading(true);
      setError(null);
      startThread(startTarget.userId, startTarget.context)
        .then((thread) => openThread(thread))
        .catch((err) => setError(getApiErrorMessage(err, "Sohbet başlatılamadı")))
        .finally(() => setLoading(false));
      return;
    }

    loadThreads();
  }, [visible, startTarget, loadThreads, openThread]);

  useEffect(() => {
    if (!visible || view !== "thread" || !activeThread) {
      return;
    }

    const socket = getSocket();
    if (!socket) {
      return;
    }

    function handleNewMessage(payload: { threadId: string; message: MessageItem }) {
      if (payload.threadId !== activeThread!.id) {
        return;
      }
      setMessages((current) => [...current, payload.message]);
    }

    socket.on("message:new", handleNewMessage);
    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [visible, view, activeThread]);

  async function handleSend() {
    const body = messageText.trim();
    if (!body || !activeThread || sending) {
      return;
    }
    setSending(true);
    try {
      const message = await sendMessage(activeThread.id, body);
      setMessages((current) => [...current, message]);
      setMessageText("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Mesaj gönderilemedi"));
    } finally {
      setSending(false);
    }
  }

  function handleClose() {
    setMessageText("");
    onClose();
  }

  function handleBack() {
    setView("list");
    setActiveThread(null);
    setMessages([]);
    loadThreads();
  }

  const filteredThreads = threads.filter((thread) => categoryFilter === "all" || thread.category === categoryFilter);

  return (
    <ModalShell visible={visible} onClose={handleClose} variant="sheet" contentStyle={SHEET_HEIGHT}>
      <KeyboardAvoidingView style={FLEX_FILL} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.header}>
            {view === "thread" ? (
              <TouchableOpacity onPress={handleBack}>
                <Text style={styles.closeText}>← Geri</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.title}>Mesajlar</Text>
            )}
            {view === "thread" ? (
              <Text style={styles.title} numberOfLines={1}>
                {activeThread?.participant.displayName}
              </Text>
            ) : null}
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeText}>Kapat</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {view === "list" ? (
            <>
              <View style={styles.filterRow}>
                {(["all", "job", "case", "general"] as const).map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[styles.filterChip, categoryFilter === category && styles.filterChipActive]}
                    onPress={() => setCategoryFilter(category)}
                  >
                    <Text style={[styles.filterChipText, categoryFilter === category && styles.filterChipTextActive]}>
                      {CATEGORY_LABELS[category]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {loading ? (
                <ActivityIndicator color={colors.accentGold} style={styles.loader} />
              ) : (
                <ScrollView>
                  {filteredThreads.length === 0 ? <Text style={styles.emptyText}>Henüz bir sohbetin yok</Text> : null}
                  {filteredThreads.map((thread) => (
                    <TouchableOpacity key={thread.id} style={styles.threadRow} onPress={() => openThread(thread)}>
                      {thread.participant.avatarUrl ? (
                        <Image source={{ uri: thread.participant.avatarUrl }} style={styles.avatar} />
                      ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]} />
                      )}
                      <View style={styles.threadContent}>
                        <View style={styles.threadHeader}>
                          <Text style={styles.threadName} numberOfLines={1}>
                            {thread.participant.displayName}
                          </Text>
                          <Text style={styles.categoryTag}>{CATEGORY_LABELS[thread.category]}</Text>
                        </View>
                        <Text style={styles.threadPreview} numberOfLines={1}>
                          {thread.lastMessagePreview}
                        </Text>
                      </View>
                      {thread.unreadCount > 0 ? (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{thread.unreadCount > 9 ? "9+" : thread.unreadCount}</Text>
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          ) : (
            <>
              {loading ? (
                <ActivityIndicator color={colors.accentGold} style={styles.loader} />
              ) : (
                <ScrollView
                  ref={scrollRef}
                  onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                  style={styles.messagesScroll}
                >
                  {messages.map((message) => (
                    <View
                      key={message.id}
                      style={[
                        styles.bubble,
                        message.senderId === currentUserId ? styles.bubbleOwn : styles.bubbleOther,
                      ]}
                    >
                      <Text style={styles.bubbleText}>{message.body}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}

              <View style={styles.composerRow}>
                <TextInput
                  style={styles.composerInput}
                  placeholder="Bir mesaj yaz..."
                  placeholderTextColor={colors.textSecondary}
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={sending}>
                  <Text style={styles.sendButtonText}>Gönder</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
      </KeyboardAvoidingView>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    flexShrink: 1,
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
  filterRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  filterChip: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.accentGold,
    borderColor: colors.accentGold,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  filterChipTextActive: {
    color: colors.background,
    fontWeight: typography.weights.semibold,
  },
  threadRow: {
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
  threadContent: {
    flex: 1,
  },
  threadHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  threadName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    flexShrink: 1,
  },
  categoryTag: {
    color: colors.textSecondary,
    fontSize: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xs,
  },
  threadPreview: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  badge: {
    marginLeft: spacing.xs,
    minWidth: 18,
    height: 18,
    borderRadius: radii.pill,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: typography.weights.semibold,
  },
  messagesScroll: {
    flex: 1,
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  bubbleOwn: {
    alignSelf: "flex-end",
    backgroundColor: colors.accentBlue,
  },
  bubbleOther: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceElevated,
  },
  bubbleText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
  },
  composerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  composerInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accentGold,
  },
  sendButtonText: {
    color: colors.background,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
});
