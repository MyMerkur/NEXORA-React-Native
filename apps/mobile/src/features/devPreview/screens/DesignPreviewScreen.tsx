import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { MessageCircle } from "lucide-react-native";
import { colors, fontFamilies, spacing } from "@nexora/ui-tokens";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";
import { Input } from "../../../components/Input";
import { Badge } from "../../../components/Badge";
import { Avatar } from "../../../components/Avatar";
import { EmptyState } from "../../../components/EmptyState";
import { Skeleton, SkeletonRow } from "../../../components/Skeleton";
import { ModalShell } from "../../../components/ModalShell";

// Dev-only visual QA screen for the Faz 5 primitive library (#58) — not part of any
// user-facing flow. Reachable from ProfileScreen's "🎨 Tasarım" button when __DEV__.
export function DesignPreviewScreen() {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [centerVisible, setCenterVisible] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Section title="Button">
        <Row>
          <Button label="Primary" onPress={() => {}} />
          <Button label="Gold" variant="gold" onPress={() => {}} />
          <Button label="Secondary" variant="secondary" onPress={() => {}} />
        </Row>
        <Row>
          <Button label="Ghost" variant="ghost" onPress={() => {}} />
          <Button label="Danger" variant="danger" onPress={() => {}} />
          <Button label="Disabled" onPress={() => {}} disabled />
          <Button label="Loading" onPress={() => {}} loading />
        </Row>
      </Section>

      <Section title="Card">
        <Card variant="flat" style={styles.stackGap}>
          <Text style={styles.cardTitle}>Flat</Text>
        </Card>
        <Card variant="elevated" style={styles.stackGap}>
          <Text style={styles.cardTitle}>Elevated</Text>
        </Card>
        <Card variant="glass" style={styles.stackGap}>
          <Text style={styles.cardTitle}>Glass</Text>
        </Card>
      </Section>

      <Section title="Input">
        <Input label="E-posta" placeholder="ornek@nexora.dev" style={styles.stackGap} />
        <Input label="Şifre" error="Şifre en az 8 karakter olmalı" style={styles.stackGap} />
      </Section>

      <Section title="Badge">
        <Row>
          <Badge label="Taslak" variant="neutral" />
          <Badge label="Aktif" variant="blue" />
          <Badge label="★ Premium" variant="gold" />
          <Badge label="Onaylandı" variant="success" />
          <Badge label="İncelemede" variant="warning" />
          <Badge label="Reddedildi" variant="danger" />
        </Row>
      </Section>

      <Section title="Avatar">
        <Row>
          <Avatar name="Ada Lovelace" size="sm" />
          <Avatar name="Ada Lovelace" size="md" />
          <Avatar name="Nexora Klinik" size="lg" verified />
        </Row>
      </Section>

      <Section title="EmptyState">
        <EmptyState icon={MessageCircle} title="Henüz mesajın yok" description="Eşleştiğinde sohbet burada görünecek." ctaLabel="Keşfet" onCtaPress={() => {}} />
      </Section>

      <Section title="Skeleton">
        <SkeletonRow />
        <View style={styles.stackGap}>
          <Skeleton width="60%" />
        </View>
      </Section>

      <Section title="ModalShell">
        <Row>
          <Button label="Bottom Sheet" variant="secondary" onPress={() => setSheetVisible(true)} />
          <Button label="Center Modal" variant="secondary" onPress={() => setCenterVisible(true)} />
        </Row>
      </Section>

      <ModalShell visible={sheetVisible} onClose={() => setSheetVisible(false)} variant="sheet">
        <Text style={styles.cardTitle}>Başvuru Seçenekleri</Text>
      </ModalShell>
      <ModalShell visible={centerVisible} onClose={() => setCenterVisible(false)} variant="center">
        <Text style={styles.cardTitle}>Sohbeti sonlandır?</Text>
      </ModalShell>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fontFamilies.semibold,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: colors.textTertiary,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    alignItems: "center",
  },
  stackGap: {
    marginTop: spacing.sm,
  },
  cardTitle: {
    fontFamily: fontFamilies.semibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
});
