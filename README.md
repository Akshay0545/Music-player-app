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

## Deploy & create APK

### Option 1: EAS Build (recommended – no Android Studio)

Build an APK in the cloud and download it.

1. **Install EAS CLI and log in**
   ```bash
   npm install -g eas-cli
   eas login
   ```
   Create a free [Expo account](https://expo.dev/signup) if needed.

2. **Configure the project (first time only)**
   ```bash
   eas build:configure
   ```
   This uses the existing `eas.json` (preview profile builds an APK).

3. **Build the Android APK**  
   **Important:** Run this from the **project root** (`react_native`), not from the `android/` folder.
   ```bash
   cd C:\Users\Akshay Kashyap\Desktop\react_native
   eas build -p android --profile preview
   ```
   When the build finishes, Expo gives you a link to **download the APK**. Install it on a device or share the file.

   For a **production** APK (same profile, different name):
   ```bash
   eas build -p android --profile production
   ```

   **If the build failed (e.g. Gradle / “unknown error”):**
   - Run from the project root (not `android/`).
   - This project uses the **SDK 52** EAS fixes: `eas.json` has `"image": "sdk-52"` for Android, and `expo-build-properties` is configured in `app.json`. Try rebuilding with `--clear-cache`.
   - If it still fails, open the build log URL from the terminal and check the **“Run gradlew”** step for the exact error.
   - Reinstall deps and clear EAS cache, then rebuild:
     ```bash
     cd C:\Users\Akshay Kashyap\Desktop\react_native
     rm -rf node_modules package-lock.json
     npm install
     eas build -p android --profile preview --clear-cache
     ```
     **On Windows:** `Remove-Item` often fails on long paths in `node_modules`. Use:
     ```powershell
     npx rimraf node_modules
     Remove-Item -Force package-lock.json
     npm install
     eas build -p android --profile preview --clear-cache
     ```

### Option 2: Local build (Android Studio required)

Build on your machine. You need [Android Studio](https://developer.android.com/studio) and the Android SDK installed.

1. **Generate native Android project**
   ```bash
   npx expo prebuild -p android
   ```

2. **Build a debug APK** (quick, for testing)
   ```bash
   npx expo run:android
   ```
   APK path (after build): `android/app/build/outputs/apk/debug/app-debug.apk`

3. **Build a release APK** (for distribution)
   ```bash
   cd android
   ./gradlew assembleRelease
   cd ..
   ```
   APK path: `android/app/build/outputs/apk/release/app-release.apk`

   For a signed release (required for Play Store), configure signing in `android/app/build.gradle` and use `bundleRelease` for an AAB instead of APK.

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

