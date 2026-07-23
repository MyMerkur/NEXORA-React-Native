# NEXORA

Diş hekimliği / sağlık sektörü profesyonelleri için kariyer, vaka paylaşımı ve topluluk platformu.

## Proje Planı

Uygulama fazları, mimari kararlar ve yol haritası için [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md) dosyasına bakın. Her çalışma oturumuna başlamadan önce bu dosyanın okunması önerilir.

## Monorepo Yapısı

```
nexora/
├── apps/
│   ├── server/     # Node.js + Express backend (TypeScript, MVC)
│   ├── mobile/      # React Native (Bare, TypeScript)
│   └── web/          # Next.js web uygulaması (Faz 6)
├── packages/
│   ├── shared-types/       # Ortak TypeScript tipleri
│   ├── shared-validation/   # Zod şemaları
│   ├── shared-constants/     # Roller, KYC seviyeleri, rozet tipleri
│   ├── api-client/             # Ortak API istemci katmanı
│   └── ui-tokens/                # Dark & Gold tema tokenleri
├── infra/
│   ├── docker/        # Yerel geliştirme ortamı (Redis vb.)
│   ├── pm2/             # PM2 ecosystem tanımları (staging/prod)
│   └── github-actions/   # CI/CD workflow dosyaları
└── docs/
    └── PROJECT_PLAN.md
```

## Araçlar

- **Paket yönetimi:** pnpm workspaces
- **Build orkestrasyon:** Turborepo
- **Dil:** TypeScript (tüm paketler ve uygulamalarda ortak)

## Geliştirme Ortamı Kurulumu

> Bu bölüm, ilgili uygulamalar (`apps/server`, `apps/mobile`) eklendikçe genişletilecektir.

1. `pnpm install`
2. Ortam değişkenleri için `.env.example` dosyasını referans alarak kendi `.env` dosyanızı oluşturun (gerçek `.env` dosyaları asla commit edilmez).
