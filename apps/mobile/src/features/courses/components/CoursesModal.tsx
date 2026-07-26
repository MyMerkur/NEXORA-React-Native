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
} from "react-native";
import { getApiErrorMessage } from "@nexora/api-client";
import type { MicroCompetencyTag } from "@nexora/shared-constants";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
import {
  createCourse,
  listCourses,
  listMyCourses,
  enrollInCourse,
  listMyEnrollments,
  listCourseEnrollments,
  completeEnrollment,
  type CourseItem,
  type EnrollmentItem,
  type CourseParticipant,
} from "../../../services/courseApi";
import { TagPicker } from "../../../components/TagPicker";

interface CoursesModalProps {
  visible: boolean;
  onClose: () => void;
  isInstructor: boolean;
}

type CoursesTab = "browse" | "mine" | "manage";

const STATUS_LABELS: Record<"enrolled" | "completed", string> = {
  enrolled: "Devam ediyor",
  completed: "Tamamlandı",
};

export function CoursesModal({ visible, onClose, isInstructor }: CoursesModalProps) {
  const [activeTab, setActiveTab] = useState<CoursesTab>("browse");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);

  const [myCourses, setMyCourses] = useState<CourseItem[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<CourseParticipant[]>([]);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSpecialties, setNewSpecialties] = useState<MicroCompetencyTag[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setSelectedCourseId(null);
    loadActiveTab(activeTab);
  }, [visible, activeTab]);

  async function loadActiveTab(tab: CoursesTab) {
    setLoading(true);
    setError(null);
    try {
      if (tab === "browse") {
        setCourses(await listCourses());
      } else if (tab === "mine") {
        setEnrollments(await listMyEnrollments());
      } else {
        setMyCourses(await listMyCourses());
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Yüklenemedi"));
    } finally {
      setLoading(false);
    }
  }

  async function handleEnroll(courseId: string) {
    setEnrollingCourseId(courseId);
    setError(null);
    try {
      await enrollInCourse(courseId);
      await loadActiveTab("browse");
    } catch (err) {
      setError(getApiErrorMessage(err, "Kursa katılınamadı"));
    } finally {
      setEnrollingCourseId(null);
    }
  }

  async function handleShareCertificate(verificationUrl: string) {
    await Share.share({ message: verificationUrl });
  }

  async function handleCreateCourse() {
    setCreating(true);
    setError(null);
    try {
      await createCourse({
        title: newTitle,
        description: newDescription || undefined,
        specialties: newSpecialties,
      });
      setNewTitle("");
      setNewDescription("");
      setNewSpecialties([]);
      await loadActiveTab("manage");
    } catch (err) {
      setError(getApiErrorMessage(err, "Kurs oluşturulamadı"));
    } finally {
      setCreating(false);
    }
  }

  async function handleSelectCourseToManage(courseId: string) {
    setSelectedCourseId(courseId);
    setLoading(true);
    setError(null);
    try {
      setParticipants(await listCourseEnrollments(courseId));
    } catch (err) {
      setError(getApiErrorMessage(err, "Katılımcılar yüklenemedi"));
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete(enrollmentId: string) {
    if (!selectedCourseId) {
      return;
    }
    setCompletingId(enrollmentId);
    setError(null);
    try {
      await completeEnrollment(selectedCourseId, enrollmentId);
      setParticipants(await listCourseEnrollments(selectedCourseId));
    } catch (err) {
      setError(getApiErrorMessage(err, "Tamamlandı olarak işaretlenemedi"));
    } finally {
      setCompletingId(null);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>🎓 Kurslar</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Kapat</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "browse" && styles.tabButtonActive]}
              onPress={() => setActiveTab("browse")}
            >
              <Text style={[styles.tabText, activeTab === "browse" && styles.tabTextActive]}>Kurslar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "mine" && styles.tabButtonActive]}
              onPress={() => setActiveTab("mine")}
            >
              <Text style={[styles.tabText, activeTab === "mine" && styles.tabTextActive]}>Kayıtlarım</Text>
            </TouchableOpacity>
            {isInstructor ? (
              <TouchableOpacity
                style={[styles.tabButton, activeTab === "manage" && styles.tabButtonActive]}
                onPress={() => setActiveTab("manage")}
              >
                <Text style={[styles.tabText, activeTab === "manage" && styles.tabTextActive]}>Yönettiklerim</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {loading ? (
            <ActivityIndicator color={colors.accentGold} style={styles.loader} />
          ) : (
            <ScrollView style={styles.content}>
              {activeTab === "browse" ? (
                courses.length === 0 ? (
                  <Text style={styles.emptyText}>Henüz kurs yok.</Text>
                ) : (
                  courses.map((course) => (
                    <View key={course.id} style={styles.card}>
                      <Text style={styles.cardTitle}>{course.title}</Text>
                      <Text style={styles.cardSubtitle}>{course.instructor.displayName}</Text>
                      {course.description ? <Text style={styles.cardBody}>{course.description}</Text> : null}
                      <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => handleEnroll(course.id)}
                        disabled={enrollingCourseId === course.id}
                      >
                        {enrollingCourseId === course.id ? (
                          <ActivityIndicator color={colors.background} />
                        ) : (
                          <Text style={styles.primaryButtonText}>Katıl</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  ))
                )
              ) : null}

              {activeTab === "mine" ? (
                enrollments.length === 0 ? (
                  <Text style={styles.emptyText}>Henüz bir kursa kayıtlı değilsiniz.</Text>
                ) : (
                  enrollments.map((enrollment) => (
                    <View key={enrollment.id} style={styles.card}>
                      <Text style={styles.cardTitle}>{enrollment.course.title}</Text>
                      <Text style={styles.cardSubtitle}>{STATUS_LABELS[enrollment.status]}</Text>
                      {enrollment.certificate ? (
                        <View style={styles.certificateBlock}>
                          <Image source={{ uri: enrollment.certificate.qrCodeDataUrl }} style={styles.qrImage} />
                          <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => handleShareCertificate(enrollment.certificate!.verificationUrl)}
                          >
                            <Text style={styles.secondaryButtonText}>Paylaş</Text>
                          </TouchableOpacity>
                        </View>
                      ) : null}
                    </View>
                  ))
                )
              ) : null}

              {activeTab === "manage" && isInstructor ? (
                selectedCourseId ? (
                  <View>
                    <TouchableOpacity onPress={() => setSelectedCourseId(null)}>
                      <Text style={styles.backLink}>{"< Geri"}</Text>
                    </TouchableOpacity>
                    {participants.length === 0 ? (
                      <Text style={styles.emptyText}>Henüz katılımcı yok.</Text>
                    ) : (
                      participants.map((participant) => (
                        <View key={participant.id} style={styles.card}>
                          <Text style={styles.cardTitle}>{participant.participant.displayName}</Text>
                          <Text style={styles.cardSubtitle}>{STATUS_LABELS[participant.status]}</Text>
                          {participant.status === "enrolled" ? (
                            <TouchableOpacity
                              style={styles.primaryButton}
                              onPress={() => handleComplete(participant.id)}
                              disabled={completingId === participant.id}
                            >
                              {completingId === participant.id ? (
                                <ActivityIndicator color={colors.background} />
                              ) : (
                                <Text style={styles.primaryButtonText}>Tamamlandı İşaretle</Text>
                              )}
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      ))
                    )}
                  </View>
                ) : (
                  <View>
                    <View style={styles.card}>
                      <Text style={styles.cardTitle}>+ Kurs Oluştur</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Kurs başlığı"
                        placeholderTextColor={colors.textSecondary}
                        value={newTitle}
                        onChangeText={setNewTitle}
                      />
                      <TextInput
                        style={[styles.input, styles.multiline]}
                        placeholder="Açıklama (opsiyonel)"
                        placeholderTextColor={colors.textSecondary}
                        value={newDescription}
                        onChangeText={setNewDescription}
                        multiline
                      />
                      <TagPicker selected={newSpecialties} onChange={setNewSpecialties} />
                      <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleCreateCourse}
                        disabled={newTitle.length < 3 || creating}
                      >
                        {creating ? (
                          <ActivityIndicator color={colors.background} />
                        ) : (
                          <Text style={styles.primaryButtonText}>Oluştur</Text>
                        )}
                      </TouchableOpacity>
                    </View>

                    {myCourses.map((course) => (
                      <TouchableOpacity
                        key={course.id}
                        style={styles.card}
                        onPress={() => handleSelectCourseToManage(course.id)}
                      >
                        <Text style={styles.cardTitle}>{course.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )
              ) : null}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
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
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  closeText: {
    color: colors.accentGold,
    fontSize: typography.sizes.sm,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
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
    maxHeight: "100%",
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
    marginBottom: spacing.sm,
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
  multiline: {
    minHeight: 60,
    textAlignVertical: "top",
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
  secondaryButton: {
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.accentGold,
    alignSelf: "flex-start",
  },
  secondaryButtonText: {
    color: colors.accentGold,
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
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
  },
  backLink: {
    color: colors.accentGold,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.sm,
  },
});
