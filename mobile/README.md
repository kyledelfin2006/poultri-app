# Poultri mobile

Expo / React Native TypeScript starter with the official Poultri logo and wordmark. The app currently displays a static placeholder; it has no farm data, server connection, or Wokwi integration.

## Start development

Install Node.js LTS and Expo Go. From this directory, run:

```powershell
npm.cmd install
npx.cmd expo start
```

Scan the QR code with Expo Go. Keep the development server running while using the app.

## Build an Android APK

The EAS `preview` profile creates an installable APK. Sign in, then start a build from this directory:

```powershell
npx.cmd eas-cli@latest login
npm.cmd run build:apk
```

EAS builds in the cloud and needs internet access. No APK or signing credentials are checked into the repository.

## Checks

```powershell
npx.cmd expo lint
npx.cmd tsc --noEmit
```
