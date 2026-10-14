# Poultri mobile template

Poultri is an Expo / React Native TypeScript prototype for demonstrating one simulated poultry-house reading from Wokwi in the mobile app. It is not a farm monitoring system and has no physical sensor or farm validation.

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

- [Mobile setup](mobile/README.md)
- [MVP requirements and two-minute demo](mvp-requirements.md)
- [Mobile + Wokwi architecture and AI build guide](build-requirements.md)
- [Implementation brief](implementation.md)
- [Agent guidance](agents.md)
