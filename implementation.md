# Poultri prototype implementation brief

## Current baseline

The repository contains a branded Expo / React Native TypeScript app in `mobile/`, a one-sensor ESP32 + DHT22 project in `wokwi/`, and a standard-library Node bridge in `bridge/`. The mobile screen connects to simulated readings over the local network and demonstrates one illustrative alert flow. Expo Go support and an EAS Android APK profile are included.

## Current limits

This is a demonstration prototype, not a farm-monitoring product. Wokwi readings are simulated. There is no physical hardware, camera analysis, ammonia/CO₂ measurement, SMS, actuator control, production data, validated rule, or farm trial. Do not describe it as connected to deployed sensors or as proven on farms.

## Implemented in this build

- `mobile/src/app/index.tsx`: one-screen mobile demo with bridge connection, live/stale state, temperature and humidity, one illustrative +1.5°C inspection prompt, acknowledgement, recovery, and reset.
- `mobile/plugins/with-local-bridge-http.js`: Expo config plugin for Android local-LAN HTTP in the preview APK.
- `bridge/server.mjs`: dependency-free Node HTTP bridge on port 4174 with health, latest-reading, and input validation endpoints.
- `wokwi/`: ESP32/DHT22 PlatformIO project, diagram, and firmware that samples every two seconds and posts readings through the Wokwi private gateway.
- `mvp-requirements.md`: scope, acceptance criteria, and the under-two-minute presenter flow.
- `build-requirements.md`: mobile/Wokwi/bridge architecture, setup, data contract, run instructions, verification sequence, and a future AI-chatbot plan. Chat is documented for later and is not implemented in this demo.

The supplied Poultri logo and wordmark are used as existing image assets without modification. No desktop simulator, account system, cloud broker, database, push notifications, camera, or AI service is included.

The generated Android project was refreshed from Expo config. Its manifest enables HTTP for the private-LAN bridge and removes old Firebase/notification metadata; Expo's permission-removal directives block unused storage, overlay, and vibration permissions from the final merged manifest.

## Verification performed

- Passed: `npm.cmd run lint`, `npx.cmd tsc --noEmit`, Expo prebuild-config resolution and clean Android prebuild, generated-manifest checks, Android JavaScript bundle export, `node --check bridge/server.mjs`, Wokwi diagram JSON parsing, and `git diff --check`.
- Not verified here: firmware compilation and the Wokwi private-gateway link because PlatformIO/Wokwi are not installed in this environment; physical-phone delivery and EAS APK creation also need the configured Wokwi access, phone/Wi-Fi, and EAS credentials.
- The bridge process starts, but the sandbox blocks HTTP socket requests from the verification shell, so its endpoint smoke checks still need to be run locally using the PowerShell commands in `build-requirements.md`.

The Android bundle export used Expo's `--no-bytecode` option because the sandbox denied Hermes bytecode output to its temporary directory. This validates Metro bundling, not the final APK build.

## Follow-up work

Use [mvp-requirements.md](mvp-requirements.md) for intended behavior and [build-requirements.md](build-requirements.md) for architecture, interfaces, implementation order, and verification. Do not add features outside those documents without new instructions.

## Development

From `mobile/`, use `npm install` and `npx expo start` for Expo Go. The `preview` EAS profile builds an installable Android APK. See `mobile/README.md` for commands and checks.
