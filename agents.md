# Agent guidance

## Current project

- The app is an Expo / React Native TypeScript prototype in `mobile/`; its planned live-demo source is a Wokwi ESP32/DHT22 simulation through a local Node bridge.
- Preserve the supplied Poultri logo and wordmark without redrawing or recoloring them.
- Keep Expo Go development and the existing EAS APK profile working.
- Read `mvp-requirements.md` and `build-requirements.md` before changing prototype behavior. The latter is the AI implementation flow and defines the bridge API.
- Do not recreate the deleted desktop simulator. The bridge has no UI and is local-only.
- Do not add cloud brokers, accounts, Firebase, push notifications, cameras, production records, actuators, diagnoses, or farm-validity claims.
- Keep simulated labels visible and preserve the official Poultri artwork unchanged.

## Minimal-change guardrails

- Keep the app small and use Expo / React Native primitives already installed.
- Add only the local bridge, Wokwi firmware, and Android networking support required by `build-requirements.md`.
- Keep README and implementation notes aligned with the actual app.
