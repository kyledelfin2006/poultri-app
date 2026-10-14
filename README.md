# Poultri mobile template

Poultri is a small Expo / React Native TypeScript starter that preserves the official Poultri branding. It currently opens to a placeholder screen. Farm monitoring, demo data, desktop tools, and Wokwi integration are not included.

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
- [Implementation brief](implementation.md)
- [Agent guidance](agents.md)

Wokwi support will be scoped after the follow-up instructions are provided.
