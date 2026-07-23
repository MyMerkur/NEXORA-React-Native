# NEXORA

Diş hekimliği ve sağlık sektörü profesyonelleri için kariyer, vaka paylaşımı ve topluluk platformu.

Sektörde çalışan hekim, asistan, teknisyen, klinik ve firmaların bir araya geldiği; vaka paylaşabildiği, iş ilanı/başvuru süreçlerini yürütebildiği ve birbiriyle güvenilir bir şekilde etkileşime geçebildiği bir uygulama olarak tasarlandı. Kimlik/diploma doğrulamasına dayalı kademeli bir güven sistemi (KYC seviyeleri) üzerine kurulu; yani platformdaki her kullanıcı aynı yetkiye sahip değil, unvanlar ve yetkinlikler doğrulama seviyesine göre kilitleniyor.

Strateji mobile-first: önce backend ve mobil uygulama birlikte ilerliyor, web arayüzü mobil lansmandan sonra ayrı bir fazda ele alınacak.

## Neden bu şekilde kurgulandı

- **Bare React Native** tercih edildi (Expo değil) — native modüllere (kamera, OCR dosya seçici, push bildirim) daha rahat erişim gerektiği için.
- **MongoDB Atlas** kullanılıyor, VPS üzerindeki mevcut Mongo kurulumu sadece yerel/yedek amaçlı; dev/staging/prod hepsi Atlas'ta ayrı cluster'larda.
- Backend klasik **MVC + Service + Repository** katmanlarıyla kurgulandı; controller'lar ince tutuluyor, iş mantığı service katmanında, veritabanı sorguları repository katmanında.
- Backend, mobil ve (ileride) web arasında paylaşılan tipler/validasyon/sabitler için ayrı paketler var, böylece aynı iş kuralı iki yerde ayrı ayrı yazılmıyor.

Detaylı faz planı, mimari kararlar ve gerekçeleri için: [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md). Yeni bir çalışma oturumuna başlarken önce o dosyaya, sonra GitHub Projects board'una ("Nexora Roadmap") bakmak en doğrusu.

## Klasör yapısı

```
nexora/
├── apps/
│   ├── server/      # Express + TypeScript backend — auth, MVC/Service/Repository
│   ├── mobile/       # React Native (Bare, TypeScript) — henüz iskelet aşamasında
│   └── web/            # Next.js — Faz 6'ya kadar placeholder, mobil lansmandan sonra kurulacak
├── packages/
│   ├── shared-types/        # User, Case, Job, Application... ortak TS tipleri
│   ├── shared-validation/    # Zod şemaları (backend + mobil aynı şemayı kullanır)
│   ├── shared-constants/      # Roller, KYC seviyeleri, rozet tipleri
│   ├── api-client/              # JWT refresh interceptor'lı ortak API istemcisi
│   └── ui-tokens/                # Dark & Gold tema — renk, tipografi, spacing
├── infra/
│   ├── docker/         # Yerel Redis vb. için docker-compose (henüz boş)
│   ├── pm2/              # Staging/prod PM2 ecosystem tanımı (henüz boş)
│   └── github-actions/    # CI/CD workflow'ları (henüz boş)
└── docs/
    └── PROJECT_PLAN.md
```

## Teknoloji tercihleri

| Katman | Seçim |
|---|---|
| Backend | Node.js + Express, TypeScript |
| Veritabanı | MongoDB Atlas + Mongoose |
| Kimlik doğrulama | JWT (kısa ömürlü access + uzun ömürlü refresh token) |
| Mobil | React Native (Bare Workflow), TypeScript |
| State (mobil) | Zustand + React Query |
| Paket yönetimi | pnpm workspaces |
| Build orkestrasyon | Turborepo |
| Test | Jest + Supertest (backend, mongodb-memory-server ile izole), RN Testing Library (mobil) |
| İzleme | Sentry (planlanan) |

## Geliştirme ortamı

Repo kökünde:

```bash
pnpm install
```

Ortam değişkenleri için `.env.example` dosyasını referans alıp kendi `.env` dosyanı repo kökünde oluştur (gerçek `.env` asla commit edilmez, `.gitignore` içinde). En azından `ATLAS_URI_DEV`, `JWT_ACCESS_SECRET` ve `JWT_REFRESH_SECRET` doldurulmalı.

Backend'i ayağa kaldırmak için:

```bash
pnpm --filter @nexora/server dev      # http://localhost:4000
pnpm --filter @nexora/server test     # mongodb-memory-server ile izole testler
pnpm --filter @nexora/server typecheck
pnpm --filter @nexora/server lint
```

Mobil tarafta Bare React Native kullanıldığı için Expo Go ile anlık önizleme yok — iOS için Xcode + CocoaPods, Android için Android Studio + JDK kurulu olması gerekiyor. Mobil iskelet henüz eklenmedi, ilerleyen bir aşamada bu bölüm güncellenecek.

## Branch stratejisi

- `main` → production
- `develop` → staging
- `feature/<faz>-<kısa-açıklama>`, `fix/<kısa-açıklama>` → günlük geliştirme dalları

`main` ve `develop` dallarına doğrudan push kapalı, her değişiklik pull request ile giriyor. Commit mesajları [Conventional Commits](https://www.conventionalcommits.org/) formatında (`feat:`, `fix:`, `chore:`, `docs:` ...).

## Durum

Şu an Faz 0'dayız (temel altyapı). İlerlemeyi [GitHub Projects — Nexora Roadmap](https://github.com/users/MyMerkur/projects/2) board'undan takip edebilirsin; her faz ayrı bir milestone olarak tanımlı.
