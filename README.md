# Poultri Wokwi + Mobile Demo

<p align="center">
  <img src="mobile/assets/poultri-logo.png" alt="Official Poultri logo" width="132" />
  <img src="mobile/assets/poultri-wordmark.png" alt="Official Poultri wordmark" width="250" />
</p>

Poultri is an Expo / React Native TypeScript demo connected to one Wokwi ESP32 + DHT22 simulation through a local Node bridge. The mobile screen shows simulated temperature and humidity, a clearly labeled illustrative inspection prompt, acknowledgement, recovery, and reset. It is a prototype, not a farm monitoring system; no physical sensor or farm validation is included.

## Demo features

- Wokwi ESP32 reads the simulated DHT22 temperature and humidity every two seconds.
- The local Node bridge keeps the latest reading in memory for the mobile app.
- The app displays simulated readings and whether the bridge is connected or the data is stale.
- A local illustrative temperature-rise rule shows one inspection prompt, with acknowledge, recovery, and reset actions.
- The existing Poultri logo and wordmark are shown in the app and included above without alteration.

See [mvp-requirements.md](mvp-requirements.md) for the presenter flow designed to fit under two minutes.

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
