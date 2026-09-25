# Poultri mobile demo

Expo / React Native app for demonstrating Poultri's early-warning experience with simulated farm data. It works locally and does not connect to cameras, sensors, or a server.

For the complete Expo Go setup, APK build steps, and demo walkthrough, see the repository [README](../README.md#run-the-demo).

## Run with Expo Go

1. Install Node.js LTS and Expo Go on an Android phone.
2. In this folder, run `npm install` once, then `npx expo start`.
3. Scan the terminal QR code with Expo Go. Keep the phone and computer on the same Wi-Fi network.

Expo Go is convenient for development demonstrations. For a shareable APK, build and install the standalone app below.

## Build an Android APK

1. Create/sign in to an Expo account and install the EAS CLI: `npm install -g eas-cli`.
2. From this folder, run `eas login`, then `eas build:configure` if EAS asks to link the app.
3. Run `eas build --platform android --profile preview`.
4. When the build completes, open the build link on the Android phone and install the `.apk`.

The `preview` profile is configured for an installable APK. An Expo account and network access are required for the hosted build. This repository does not contain a built APK or signing credentials.

## Walkthrough

- The welcome screen opens the local demo without real authentication.
- Home has four step-through scenarios, accessible scenario choices, and House 2 sliders that preview values while dragging and update linked trends/alerts on release.
- Alerts support acknowledgement, resolution, and a saved inspection note.
- Records are filterable by house; today's demo egg count is editable.
- Profile edits the farm, owner, house names and bird counts, and can reset demo data.

All data is labeled as demo data. The warning is for inspection and is not a diagnosis.
