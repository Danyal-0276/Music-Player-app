<p align="center">
  <img src="assets/icon.png" alt="Harmonic logo" width="120" />
</p>

<h1 align="center">Harmonic</h1>

<p align="center">
  <strong>Offline-first music player for Android</strong><br />
  Your library stays on your device. No accounts. No streaming. No cloud.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android" />
  <img src="https://img.shields.io/badge/Expo-SDK%2057-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo SDK 57" />
  <img src="https://img.shields.io/badge/React%20Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/offline-first-success?style=flat-square" alt="Offline first" />
  <img src="https://img.shields.io/badge/New%20Architecture-enabled-purple?style=flat-square" alt="New Architecture" />
  <img src="https://img.shields.io/badge/dev%20client-required-orange?style=flat-square" alt="Dev client required" />
  <img src="https://img.shields.io/badge/version-1.0.0-lightgrey?style=flat-square" alt="Version 1.0.0" />
</p>

---

## About

Harmonic is a personal offline music player built with **Expo** and **React Native**. It scans local audio on your phone, caches metadata in SQLite, and plays in the background with notification and lock-screen controls.

Perfect if you want a clean local library experience without accounts or the cloud.

---

## Features

| | Feature | Details |
| :---: | --- | --- |
| 🎵 | **Local library scan** | Reads audio files already on the phone |
| 🔒 | **Background playback** | Notification and lock-screen controls |
| 📚 | **Browse everything** | Songs, artists, albums, playlists, favorites |
| 🔍 | **Search and sort** | Find tracks fast, order the library your way |
| 🎧 | **Now playing** | Full-screen player plus a persistent mini player |
| 🎨 | **Themes** | Light / dark / system, accents, and density |
| 📴 | **Fully offline** | SQLite + MMKV - nothing leaves the device |

---

## Tech stack

<p align="center">
  <img src="https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/React_Native-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Zustand-443E38?style=flat-square&logo=zustand&logoColor=white" alt="Zustand" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/MMKV-FF6F00?style=flat-square" alt="MMKV" />
  <img src="https://img.shields.io/badge/Reanimated-001A72?style=flat-square&logo=react&logoColor=white" alt="Reanimated" />
  <img src="https://img.shields.io/badge/FlashList-96BF48?style=flat-square&logo=shopify&logoColor=white" alt="FlashList" />
</p>

| Layer | Choice |
| --- | --- |
| App framework | Expo SDK 57 + React Native (New Architecture) |
| Navigation | React Navigation (tabs + native stack) |
| Playback | `@rntp/player` (background / media session) |
| Library scan | `expo-media-library` + `@nodefinity/react-native-music-library` |
| Storage | `expo-sqlite`, `react-native-mmkv` |
| State | Zustand |
| UI | Reanimated, FlashList, custom theme tokens |

---

## Requirements

- Node.js 20+
- Android device or emulator (API 24+)
- Android Studio / SDK for native builds
- Expo CLI via `npx` (no global install required)

> **Note:** Harmonic uses a **development build** (`expo-dev-client`), not Expo Go - native modules need a custom binary.

---

## Getting started

```bash
# Install dependencies
npm install

# Generate the Android native project
npx expo prebuild --platform android

# Build and run on a connected device / emulator
npx expo run:android --device
```

### Scripts

| Script | Command | Description |
| --- | --- | --- |
| Start Metro | `npm start` | Dev client bundler |
| Run Android | `npm run android` | Build and launch on device |
| Typecheck | `npm run typecheck` | Run TypeScript checks |

---

## Project structure

```
src/
  components/     Shared UI (SongRow, MiniPlayer, sheets, ...)
  database/       SQLite schema and queries
  navigation/     Tab and stack navigators
  screens/
    library/      Songs, artists, albums, playlists
    player/       Now Playing modal
    settings/     Theme, accent, density
  services/
    audio/        Player and playback service
    musicScanner/
    permissions/
  store/          Zustand stores + MMKV
  theme/          Colors, accents, ThemeProvider
  types/
  utils/
```

---

## Permissions (Android)

| Permission | Why |
| --- | --- |
| `READ_MEDIA_AUDIO` / storage | Scan and play local music |
| `POST_NOTIFICATIONS` | Playback controls in the notification shade |
| `FOREGROUND_SERVICE` / media playback | Keep audio running in the background |
| `WAKE_LOCK` | Reliable playback while the screen is off |

---

## Manual test checklist

- [ ] Grant music access when prompted
- [ ] Confirm songs appear after a library scan
- [ ] Play a track, then minimize the app - audio should continue
- [ ] Use notification / lock-screen play, pause, next, and previous
- [ ] Favorite a song, create a playlist, and change theme or accent in Settings

---

## License

Released under the [MIT License](./LICENSE).