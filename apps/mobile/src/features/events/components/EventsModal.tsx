import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import { radii, spacing, typography } from "@nexora/ui-tokens";
import { useTheme } from "../../../store/useThemeStore";
import { ModalShell } from "../../../components/ModalShell";
import {
  createEvent,
  listUpcomingEvents,
  listMyOrganizedEvents,
  listMyTickets,
  listEventAttendees,
  type EventItem,
  type MyEventTicket,
  type EventAttendee,
} from "../../../services/eventApi";
import { EventTicketCheckoutWebView } from "./EventTicketCheckoutWebView";
import { TicketCheckInScanner } from "./TicketCheckInScanner";

interface EventsModalProps {
  visible: boolean;
  onClose: () => void;
  isOrganizer: boolean;
}

const SHEET_HEIGHT: ViewStyle = { maxHeight: "85%" };

type EventsTab = "browse" | "mine" | "manage";

function formatDate(value: string) {
  return new Date(value).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" });
}

export function EventsModal({ visible, onClose, isOrganizer }: EventsModalProps) {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<EventsTab>("browse");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [checkoutTarget, setCheckoutTarget] = useState<{ eventId: string; ticketTypeId: string } | null>(null);

  const [myTickets, setMyTickets] = useState<MyEventTicket[]>([]);

  const [myEvents, setMyEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [scannerVisible, setScannerVisible] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newStartsAt, setNewStartsAt] = useState("");
  const [newEndsAt, setNewEndsAt] = useState("");
  const [newTicketName, setNewTicketName] = useState("Standart");
  const [newTicketPrice, setNewTicketPrice] = useState("");
  const [newTicketCapacity, setNewTicketCapacity] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setSelectedEventId(null);
    loadActiveTab(activeTab);
  }, [visible, activeTab]);

  async function loadActiveTab(tab: EventsTab) {
    setLoading(true);
    setError(null);
    try {
      if (tab === "browse") {
        setEvents(await listUpcomingEvents());
      } else if (tab === "mine") {
        setMyTickets(await listMyTickets());
      } else {
        setMyEvents(await listMyOrganizedEvents());
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Yüklenemedi"));
    } finally {
      setLoading(false);
    }
  }

  async function handleShareTicket(verificationUrl: string) {
    await Share.share({ message: verificationUrl });
  }

  async function handleCreateEvent() {
    setCreating(true);
    setError(null);
    try {
      await createEvent({
        title: newTitle,
        description: newDescription || undefined,
        location: newLocation || undefined,
        startsAt: new Date(newStartsAt).toISOString(),
        endsAt: new Date(newEndsAt).toISOString(),
        ticketTypes: [{ name: newTicketName, price: newTicketPrice, capacity: Number(newTicketCapacity) }],
      });
      setNewTitle("");
      setNewDescription("");
      setNewLocation("");
      setNewStartsAt("");
      setNewEndsAt("");
      setNewTicketName("Standart");
      setNewTicketPrice("");
      setNewTicketCapacity("");
      await loadActiveTab("manage");
    } catch (err) {
      setError(getApiErrorMessage(err, "Etkinlik oluşturulamadı"));
    } finally {
      setCreating(false);
    }
  }

  async function handleSelectEventToManage(eventId: string) {
    setSelectedEventId(eventId);
    setLoading(true);
    setError(null);
    try {
      setAttendees(await listEventAttendees(eventId));
    } catch (err) {
      setError(getApiErrorMessage(err, "Katılımcılar yüklenemedi"));
    } finally {
      setLoading(false);
    }
  }

  function handleCheckoutDone(result: "success" | "cancelled") {
    setCheckoutTarget(null);
    if (result === "success") {
      loadActiveTab("mine");
    }
  }

  const isFormValid =
    newTitle.trim().length >= 3 &&
    newStartsAt.length > 0 &&
    newEndsAt.length > 0 &&
    newTicketPrice.trim().length > 0 &&
    Number(newTicketCapacity) > 0;

  const activeTabBorderStyle = { borderBottomColor: colors.accentGold };
  const activeTabTextStyle = { color: colors.accentGold };

  if (checkoutTarget) {
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setCheckoutTarget(null)}>
        <View style={styles.backdrop}>
          <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <EventTicketCheckoutWebView
              eventId={checkoutTarget.eventId}
              ticketTypeId={checkoutTarget.ticketTypeId}
              startingTicketCount={myTickets.length}
              onDone={handleCheckoutDone}
            />
          </View>
        </View>
      </Modal>
    );
  }

  if (scannerVisible) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={() => setScannerVisible(false)}>
        <TicketCheckInScanner onClose={() => setScannerVisible(false)} />
      </Modal>
    );
  }

  return (
    <ModalShell visible={visible} onClose={onClose} variant="sheet" contentStyle={SHEET_HEIGHT}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>🎫 Etkinlikler</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeText, { color: colors.accentGold }]}>Kapat</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "browse" && activeTabBorderStyle]}
              onPress={() => setActiveTab("browse")}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: colors.textSecondary },
                  activeTab === "browse" && styles.tabTextActive,
                  activeTab === "browse" && activeTabTextStyle,
                ]}
              >
                Keşfet
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "mine" && activeTabBorderStyle]}
              onPress={() => setActiveTab("mine")}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: colors.textSecondary },
                  activeTab === "mine" && styles.tabTextActive,
                  activeTab === "mine" && activeTabTextStyle,
                ]}
              >
                Biletlerim
              </Text>
            </TouchableOpacity>
            {isOrganizer ? (
              <TouchableOpacity
                style={[styles.tabButton, activeTab === "manage" && activeTabBorderStyle]}
                onPress={() => setActiveTab("manage")}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: colors.textSecondary },
                    activeTab === "manage" && styles.tabTextActive,
                    activeTab === "manage" && activeTabTextStyle,
                  ]}
                >
                  Yönettiklerim
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

          {loading ? (
            <ActivityIndicator color={colors.accentGold} style={styles.loader} />
          ) : (
            <ScrollView style={styles.content}>
              {activeTab === "browse" ? (
                events.length === 0 ? (
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Yaklaşan etkinlik yok.</Text>
                ) : (
                  events.map((event) => (
                    <View key={event.id} style={[styles.card, { backgroundColor: colors.surfaceElevated }]}>
                      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{event.title}</Text>
                      <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                        {event.organizer.displayName}
                      </Text>
                      <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
                        {formatDate(event.startsAt)}
                      </Text>
                      {event.location ? (
                        <Text style={[styles.cardBody, { color: colors.textSecondary }]}>{event.location}</Text>
                      ) : null}
                      {event.ticketTypes.map((ticket) => (
                        <View key={ticket.id} style={[styles.ticketRow, { borderTopColor: colors.border }]}>
                          <View>
                            <Text style={[styles.ticketName, { color: colors.textPrimary }]}>{ticket.name}</Text>
                            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                              {ticket.price} ₺ · {ticket.capacity - ticket.soldCount} kontenjan kaldı
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={[
                              styles.primaryButton,
                              { backgroundColor: colors.accentBlue },
                              ticket.soldOut && styles.primaryButtonDisabled,
                            ]}
                            onPress={() => setCheckoutTarget({ eventId: event.id, ticketTypeId: ticket.id })}
                            disabled={ticket.soldOut}
                          >
                            <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                              {ticket.soldOut ? "Doldu" : "Satın Al"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  ))
                )
              ) : null}

              {activeTab === "mine" ? (
                myTickets.length === 0 ? (
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Henüz bir biletiniz yok.</Text>
                ) : (
                  myTickets.map((ticket) => (
                    <View key={ticket.id} style={[styles.card, { backgroundColor: colors.surfaceElevated }]}>
                      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{ticket.event.title}</Text>
                      <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                        {ticket.ticketTypeName}
                      </Text>
                      <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
                        {formatDate(ticket.event.startsAt)}
                      </Text>
                      <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                        {ticket.checkedInAt ? "Check-in yapıldı" : "Check-in bekleniyor"}
                      </Text>
                      <View style={styles.certificateBlock}>
                        <Image
                          source={{ uri: ticket.qrCodeDataUrl }}
                          style={[styles.qrImage, { backgroundColor: colors.surface }]}
                        />
                        <TouchableOpacity
                          style={[styles.secondaryButton, { borderColor: colors.accentGold }]}
                          onPress={() => handleShareTicket(ticket.verificationUrl)}
                        >
                          <Text style={[styles.secondaryButtonText, { color: colors.accentGold }]}>Paylaş</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )
              ) : null}

              {activeTab === "manage" && isOrganizer ? (
                selectedEventId ? (
                  <View>
                    <TouchableOpacity onPress={() => setSelectedEventId(null)}>
                      <Text style={[styles.backLink, { color: colors.accentGold }]}>{"< Geri"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.primaryButton, { backgroundColor: colors.accentBlue }]}
                      onPress={() => setScannerVisible(true)}
                    >
                      <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                        Check-in için Kamerayı Aç
                      </Text>
                    </TouchableOpacity>
                    {attendees.length === 0 ? (
                      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Henüz katılımcı yok.</Text>
                    ) : (
                      attendees.map((attendee) => (
                        <View key={attendee.id} style={[styles.card, { backgroundColor: colors.surfaceElevated }]}>
                          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                            {attendee.attendee.displayName}
                          </Text>
                          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                            {attendee.checkedInAt ? "Check-in yapıldı" : "Check-in bekleniyor"}
                          </Text>
                        </View>
                      ))
                    )}
                  </View>
                ) : (
                  <View>
                    <View style={[styles.card, { backgroundColor: colors.surfaceElevated }]}>
                      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>+ Etkinlik Oluştur</Text>
                      <TextInput
                        style={[
                          styles.input,
                          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
                        ]}
                        placeholder="Etkinlik başlığı"
                        placeholderTextColor={colors.textSecondary}
                        value={newTitle}
                        onChangeText={setNewTitle}
                      />
                      <TextInput
                        style={[
                          styles.input,
                          styles.multiline,
                          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
                        ]}
                        placeholder="Açıklama (opsiyonel)"
                        placeholderTextColor={colors.textSecondary}
                        value={newDescription}
                        onChangeText={setNewDescription}
                        multiline
                      />
                      <TextInput
                        style={[
                          styles.input,
                          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
                        ]}
                        placeholder="Konum (opsiyonel)"
                        placeholderTextColor={colors.textSecondary}
                        value={newLocation}
                        onChangeText={setNewLocation}
                      />
                      <TextInput
                        style={[
                          styles.input,
                          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
                        ]}
                        placeholder="Başlangıç (YYYY-AA-GG SS:DD)"
                        placeholderTextColor={colors.textSecondary}
                        value={newStartsAt}
                        onChangeText={setNewStartsAt}
                      />
                      <TextInput
                        style={[
                          styles.input,
                          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
                        ]}
                        placeholder="Bitiş (YYYY-AA-GG SS:DD)"
                        placeholderTextColor={colors.textSecondary}
                        value={newEndsAt}
                        onChangeText={setNewEndsAt}
                      />
                      <TextInput
                        style={[
                          styles.input,
                          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
                        ]}
                        placeholder="Bilet tipi adı"
                        placeholderTextColor={colors.textSecondary}
                        value={newTicketName}
                        onChangeText={setNewTicketName}
                      />
                      <TextInput
                        style={[
                          styles.input,
                          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
                        ]}
                        placeholder="Bilet fiyatı (₺)"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="decimal-pad"
                        value={newTicketPrice}
                        onChangeText={setNewTicketPrice}
                      />
                      <TextInput
                        style={[
                          styles.input,
                          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
                        ]}
                        placeholder="Kontenjan"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="number-pad"
                        value={newTicketCapacity}
                        onChangeText={setNewTicketCapacity}
                      />
                      <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: colors.accentBlue }]}
                        onPress={handleCreateEvent}
                        disabled={!isFormValid || creating}
                      >
                        {creating ? (
                          <ActivityIndicator color={colors.background} />
                        ) : (
                          <Text style={[styles.primaryButtonText, { color: colors.background }]}>Oluştur</Text>
                        )}
                      </TouchableOpacity>
                    </View>

                    {myEvents.map((event) => (
                      <TouchableOpacity
                        key={event.id}
                        style={[styles.card, { backgroundColor: colors.surfaceElevated }]}
                        onPress={() => handleSelectEventToManage(event.id)}
                      >
                        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{event.title}</Text>
                        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                          {formatDate(event.startsAt)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )
              ) : null}
            </ScrollView>
          )}
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
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
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  closeText: {
    fontSize: typography.sizes.sm,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginBottom: spacing.sm,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  tabTextActive: {
    fontWeight: typography.weights.semibold,
  },
  loader: {
    marginVertical: spacing.xl,
  },
  content: {
    maxHeight: "100%",
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
    marginBottom: spacing.sm,
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
  ticketRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  ticketName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
    fontSize: typography.sizes.md,
  },
  multiline: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  primaryButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  secondaryButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  secondaryButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  certificateBlock: {
    marginTop: spacing.sm,
    alignItems: "flex-start",
    gap: spacing.xs,
  },
  qrImage: {
    width: 120,
    height: 120,
    borderRadius: radii.sm,
  },
  backLink: {
    fontSize: typography.sizes.sm,
    marginBottom: spacing.sm,
  },
});
