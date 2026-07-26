import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from "react-native-vision-camera";
import { getApiErrorMessage } from "@nexora/api-client";
import { colors, radii, spacing, typography } from "@nexora/ui-tokens";
import { checkInTicket, type CheckInResult } from "../../../services/eventApi";

interface TicketCheckInScannerProps {
  onClose: () => void;
}

// QR content is a verification URL once PUBLIC_APP_BASE_URL is set (post-VPS), or a bare code
// today — extract the trailing path segment either way so check-in keeps working after that change.
function extractVerificationCode(scannedValue: string): string {
  try {
    const url = new URL(scannedValue);
    const segments = url.pathname.split("/").filter(Boolean);
    return segments[segments.length - 1] ?? scannedValue;
  } catch {
    return scannedValue;
  }
}

export function TicketCheckInScanner({ onClose }: TicketCheckInScannerProps) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastCodeRef = useRef<string | null>(null);

  const handleScan = useCallback(async (code: string) => {
    if (lastCodeRef.current === code) {
      return;
    }
    lastCodeRef.current = code;
    setProcessing(true);
    setError(null);
    setResult(null);
    try {
      const response = await checkInTicket(extractVerificationCode(code));
      setResult(response);
    } catch (err) {
      setError(getApiErrorMessage(err, "Bilet doğrulanamadı"));
    } finally {
      setProcessing(false);
    }
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: (codes) => {
      const value = codes[0]?.value;
      if (value) {
        handleScan(value);
      }
    },
  });

  function handleScanNext() {
    lastCodeRef.current = null;
    setResult(null);
    setError(null);
  }

  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>Check-in için kamera izni gerekiyor.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>İzin Ver</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelLink} onPress={onClose}>
          <Text style={styles.cancelLinkText}>Kapat</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>Kamera bulunamadı.</Text>
        <TouchableOpacity style={styles.cancelLink} onPress={onClose}>
          <Text style={styles.cancelLinkText}>Kapat</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={!result && !processing}
          codeScanner={codeScanner}
        />
        {processing ? (
          <View style={styles.overlay}>
            <ActivityIndicator color={colors.accentGold} />
          </View>
        ) : null}
      </View>

      <View style={styles.resultPanel}>
        {result ? (
          <View>
            <Text style={result.alreadyCheckedIn ? styles.warningText : styles.successText}>
              {result.alreadyCheckedIn ? "Bu bilet zaten check-in yapılmış" : "Check-in başarılı"}
            </Text>
            <Text style={styles.attendeeText}>{result.attendeeName}</Text>
            <Text style={styles.eventText}>{result.eventTitle}</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleScanNext}>
              <Text style={styles.primaryButtonText}>Sıradaki Bileti Okut</Text>
            </TouchableOpacity>
          </View>
        ) : error ? (
          <View>
            <Text style={styles.error}>{error}</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleScanNext}>
              <Text style={styles.primaryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.hintText}>Bilet QR kodunu kameraya gösterin</Text>
        )}
        <TouchableOpacity style={styles.cancelLink} onPress={onClose}>
          <Text style={styles.cancelLinkText}>Kapat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cameraContainer: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  permissionText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  resultPanel: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  hintText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    textAlign: "center",
  },
  successText: {
    color: colors.accentGold,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  warningText: {
    color: colors.danger,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  attendeeText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    marginTop: spacing.xs,
  },
  eventText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  error: {
    color: colors.danger,
    fontSize: typography.sizes.sm,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: colors.accentBlue,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    alignItems: "center",
    marginTop: spacing.md,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  cancelLink: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  cancelLinkText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
});
