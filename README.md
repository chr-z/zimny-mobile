# ZIMNY — magazine app (iOS + Android)

[![App Store](https://img.shields.io/badge/App_Store-live-0D96F6?style=for-the-badge&logo=appstore&logoColor=white)](https://apps.apple.com/us/app/zimny/id6804807761)
[![Google Play](https://img.shields.io/badge/Google_Play-live-01875F?style=for-the-badge&logo=googleplay&logoColor=white)](https://play.google.com/store/apps/details?id=com.zimny.app)

React Native app for a print + digital magazine, live in both stores: content reader,
linear "TV" stream synced across devices, push notifications and a trilingual
editorial flow on top of a headless WordPress backend.

> **About this repository** — this is a **code sample** of the production app.
> Client-specific configuration, credentials, store assets and the server-side
> plugins were removed, and the history was reset to a single commit. The app ships
> in both stores via the private repository; the links above are the live artifact.

## What it does

- **Content reader** — infinite scroll feed, magazine sections, article view with rich media, offline reading
- **Linear stream** — a "live TV" channel whose position is anchored to the server clock, with synchronized seek across devices
- **Push notifications** — FCM v1 on Android and APNs on iOS, segmented by language, with deep links into the app
- **Trilingual** — PT / EN / ES, translated server-side and selected by language header
- **Offline-first** — cached content, image persistence and graceful degradation
- **Store releases** — EAS build + submit automation, over-the-air updates, review round-trips

## Stack

| Layer | Choice |
|---|---|
| Runtime | Expo SDK 57 · React Native 0.86 · React 19 |
| Language | TypeScript (strict) |
| Navigation | expo-router (file-based) |
| UI | NativeWind (Tailwind for RN), Reanimated, FlashList, expo-video |
| State | Zustand stores + hooks layer |
| i18n | PT/EN/ES dictionaries + server-side translation by language header |
| Backend | headless WordPress REST (custom endpoints and plugins) |
| Push | expo-notifications + FCM v1 + APNs |
| Release | EAS build/submit, version source `remote`, `autoIncrement` on production |

## Architecture

```
app/                     expo-router routes (drawer layout, screens, modals)
  (drawer)/              main navigation group
src/
  components/            reusable UI (cards, carousels, players, skeletons)
  hooks/                 data + device hooks (feed, player, push, i18n)
  services/              API clients (WordPress REST, YouTube, Instagram, push)
  store/                 Zustand stores
  i18n/                  pt / en / es dictionaries
  constants/             theme, config, feature flags
assets/                  fonts, images, intro video
store-assets/            store icon + privacy page + listing metadata
```

Data flow: `services/*` → normalized models → `store/*` → `hooks/*` → screens. Network
failures fall back to the persistent cache so the reader keeps working offline.

## Running it locally

```bash
npm install
cp .env.example .env      # fill in your own backend + keys
npx expo start
```

You need your own WordPress (or any REST) endpoint and your own Firebase project to
build a working client — the values in `.env.example` are placeholders.

## What was removed from this sample

| Removed | Why |
|---|---|
| `wordpress/` (plugins + REST extensions) | server-side code owned by the client |
| `plans/` (roadmap, marketing, ad system) | internal client strategy |
| `google-services.json`, credentials paths | client project credentials |
| `eas.json` submit identifiers | App Store Connect / Play service account references |
| release binaries (`*.aab`) | build artifacts do not belong in git |
| hardcoded API keys | replaced by `EXPO_PUBLIC_*` environment variables |

---

**Christian Eliel** — Mobile & Full Stack Developer
[LinkedIn](https://www.linkedin.com/in/christianmaciel/) · christian@chr-z.dev · [github.com/chr-z](https://github.com/chr-z)
