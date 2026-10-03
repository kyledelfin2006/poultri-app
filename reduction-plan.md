# Poultri MVP reduction plan

## Summary

Reduce mobile and desktop simulator source from **1,279 to at most 1,023 lines** and make the downloadable Android APK at least **20% smaller** than the existing 64,038,153-byte local APK. Keep the agreed demonstration MVP and all simulated-data labels. The browser simulator remains on localhost and the local Wi-Fi network; only the Android APK is distributed.

## Implementation

- Simplify the screens and browser sandbox. Remove duplicate charts, alert comparisons, decorative elements, and repeated explanatory text where the same information remains available in the appropriate detail screen. Keep the welcome flow, four tabs, on-phone Simulator, three-house browser controls, production history, profile edits, offline walkthrough, and alert actions.
- Replace the desktop event log and mobile cursor polling with one periodic state snapshot. Retain pairing, alert IDs, notes, recovery behavior, and Android push handling. Remove code and dependencies proven unused; keep Expo Router's required dependencies.
- Build for ARM64 Android phones. Use Expo SDK 57's `expo-build-properties` with `buildArchs: ["arm64-v8a"]`. Move the existing local HTTP setting into that plugin and remove its custom plugin. Keep the official logo and wordmark intact.
- Update the launch and demo instructions to describe the smaller ARM64 APK and the localhost desktop simulator.

## Verification

- Count the same source files before and after; require **at most 1,023 lines**, with readable formatting and no line packing to inflate the result.
- Run Expo lint, TypeScript checking, and an Android bundle check. Build an installable APK with comparable settings; require **at most 51,230,522 bytes**. Inspect its contents to confirm it includes ARM64 and excludes x86_64.
- Walk through pairing, scenario alerts, acknowledgement, notes, recovery, Records updates, profile edits, offline mode, and a notification on a physical ARM64 phone. Report push delivery separately from Expo/FCM acceptance.

## Assumptions

The code target measures source lines across `mobile/` and `desktop-simulator/`, excluding generated files and the lockfile. The APK target measures file bytes. ARM64 phones are the supported download target; x86_64 emulators would need a separate build. If either target conflicts with a required MVP behavior, preserve that behavior and report the measured shortfall rather than remove it.

Sources: [Expo SDK 57 build properties](https://docs.expo.dev/versions/v57.0.0/sdk/build-properties/) and [Expo app size guide](https://docs.expo.dev/distribution/app-size/).
