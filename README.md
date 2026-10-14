# Poultri Wokwi + Mobile Demo

Poultri is an Expo / React Native TypeScript demo connected to one Wokwi ESP32 + DHT22 simulation through a local Node bridge. The mobile screen shows simulated temperature and humidity, a clearly labeled illustrative inspection prompt, acknowledgement, recovery, and reset. It is a prototype, not a farm monitoring system; no physical sensor or farm validation is included.

## Run with Expo Go

Install Node.js LTS and Expo Go, then run these commands from `mobile/`:

```powershell
npm.cmd install
npx.cmd expo start
```

Scan the terminal QR code with Expo Go.

## Build an Android APK

The existing EAS `preview` profile builds an installable APK. From `mobile/`, sign in to EAS and run:

```powershell
npx.cmd eas-cli@latest login
npm.cmd run build:apk
```

The build is hosted by EAS and requires an Expo account and internet access.

## Project files

- [Wokwi firmware and diagram](wokwi/)
- [Local bridge](bridge/)
- [Mobile source](mobile/src/app/index.tsx)
- [Run instructions](build-requirements.md#stage-4-run-each-part-and-connect-them)

- [Mobile setup](mobile/README.md)
- [MVP requirements and two-minute demo](mvp-requirements.md)
- [Mobile + Wokwi architecture and AI build guide](build-requirements.md)
- [Implementation brief](implementation.md)
- [Agent guidance](agents.md)
