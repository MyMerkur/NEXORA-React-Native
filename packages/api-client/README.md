# api-client

axios tabanlı ortak istemci. `createApiClient({ baseURL, getAccessToken })` bir axios instance döner; `getAccessToken` verilirse her istekte `Authorization: Bearer` header'ı otomatik eklenir.

Mobil ve (ileride) web tarafından ortak kullanılır. Tam refresh-token interceptor akışı (401 üzerine otomatik yenileme) Faz 1'de auth modülüyle birlikte eklenecek — şimdilik bilinçli olarak minimal tutuldu.
