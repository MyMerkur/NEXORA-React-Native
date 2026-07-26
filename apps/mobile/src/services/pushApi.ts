import { apiClient } from "./authApi";

export type DevicePlatform = "ios" | "android";

// Gerçek FCM token alma / izin isteme kodu bu dosyada YOK — projede henüz bir Firebase projesi
// yok (google-services.json / GoogleService-Info.plist yok), native SDK kurulumu ayrı bir takip
// işi. Bu fonksiyon backend'in device-token endpoint'ini çağırmaya hazır, sadece bir token
// üretecek gerçek kaynak (Firebase Messaging) henüz bağlı değil.
export async function registerDeviceToken(token: string, platform: DevicePlatform): Promise<void> {
  await apiClient.post("/api/v1/notifications/device-token", { token, platform });
}
