# infra/github-actions

GitHub Actions sadece `.github/workflows/` altındaki dosyaları çalıştırdığı için gerçek workflow dosyaları orada tutuluyor (`ci.yml` eklendi; `deploy-staging.yml` ve `deploy-production.yml` VPS kurulumu netleşince eklenecek). Bu klasör kod tekrarına yol açmamak için sadece referans amaçlı — `docs/PROJECT_PLAN.md`'deki (Bölüm 3.5) altyapı planına karşılık geliyor, ayrı bir kopya barındırmıyor.
