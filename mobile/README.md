# Poultri mobile demo

Expo / React Native app for demonstrating Poultri's early-warning experience with simulated farm data. It works locally and does not connect to cameras, sensors, or a server.

For complete run, APK installation, and demo walkthrough instructions, see the repository's [instructions.md](../instructions.md).

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

- Overview shows three simulated houses and a combined rising-temperature/reduced-movement alert.
- Tap a house for simulated readings and an illustrative trend.
- Tap an alert to acknowledge it or mark it resolved.
- Records shows seven days of illustrative egg production.
- Overview or About has controls to trigger a sample alert, simulate offline mode, and reset the demo.
- About explains proposed pricing, validation targets, and prototype limitations.

All data is labeled as demo data. The warning is for inspection and is not a diagnosis.
