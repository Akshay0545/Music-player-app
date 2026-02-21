# Music Player (React Native – Expo)

A music streaming app using the [JioSaavn API](https://saavn.sumit.co/), built with React Native (Expo) and TypeScript.

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app on your device (for development), or Android Studio / Xcode for builds

### Install and run

```bash
npm install
npm start
```

Then scan the QR code with Expo Go (Android) or the Camera app (iOS), or press `a` for Android emulator / `i` for iOS simulator.

### Build APK (EAS Build)

```bash
npx eas-cli login
npx eas build -p android --profile preview
```

Or use a local development build:

```bash
npx expo prebuild
npx expo run:android
```

## Architecture

- **Navigation:** React Navigation v6 (native stack). No Expo Router. Screens: Home, Queue, Player. Mini Player is a persistent bottom bar over the stack.
- **State:** Zustand store (`src/store/playerStore.ts`) holds queue, current index, play state, position, duration, shuffle, and repeat mode. Single source of truth for Mini and Full Player.
- **Audio:** One `expo-av` Sound instance, driven by `src/hooks/useAudioPlayer.ts`. The hook subscribes to the store and reacts to track/index and play state; it updates position/duration back into the store and handles track end (next / repeat one / repeat all).
- **API:** `src/api/client.ts` calls `https://saavn.sumit.co` (search/songs). Adapters in `src/api/adapters.ts` normalize response shapes (e.g. `link` vs `url`) into app types.
- **Persistence:** AsyncStorage for queue and current index (`src/utils/storage.ts`). Queue is restored on app launch. Download paths (id → local URI) are stored separately and merged into queue items on hydrate.
- **Offline:** Download uses `expo-file-system`; local URIs are stored and preferred at playback time. Player screen has a “Download for offline” button.

## Trade-offs

- **expo-av vs react-native-track-player:** expo-av is used for simplicity and compatibility with Expo managed workflow. It supports background playback via `setAudioModeAsync` (e.g. `staysActiveInBackground: true`). For lock-screen controls and more advanced queue/background behavior, `react-native-track-player` would be a better fit but typically requires a dev client or eject.
- **AsyncStorage vs MMKV:** AsyncStorage is used for queue and settings. MMKV would give faster and more robust persistence; the store’s `persistQueue`/`hydrate` and storage API can be swapped to MMKV without changing screen logic.
- **No mock data:** All song data comes from the JioSaavn API; no mock or fallback data.

## Features

- **Home:** Song list (initial search “hindi”), search input, pagination (load more).
- **Player:** Full controls (play/pause, prev/next), seek bar, shuffle and repeat (off / all / one), download for offline.
- **Mini Player:** Persistent bottom bar; tap to open full Player; play/pause in sync with full player.
- **Queue:** Add from Home (tap song to play, or “+ Queue”), reorder (up/down), remove; persisted across restarts.
- **Bonus:** Shuffle, repeat modes, offline download with local playback.

