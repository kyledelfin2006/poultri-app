# Poultri mobile demo

Expo / React Native TypeScript demo app for the Wokwi ESP32 + DHT22 simulation. It connects over the local network to the Node bridge, displays simulated readings, and demonstrates one illustrative inspection prompt. It is not connected to physical sensors and has no farm validation.

See the root [MVP requirements](../mvp-requirements.md) and [build guide](../build-requirements.md) for the demo flow, network setup, and acceptance criteria.

## Start development

Install Node.js LTS and Expo Go. Start the bridge from `bridge/` in a separate terminal, then from this directory run:

```powershell
npm.cmd install
npx.cmd expo start
```

Scan the QR code with Expo Go. Keep the development server running while using the app.

In the app, enter the laptop's private Wi-Fi IPv4 URL with port `4174` (for example, `http://192.168.1.20:4174`) and tap **Connect**. Keep the phone and laptop on the same Wi-Fi. The Wokwi Private Gateway must also be active for simulated readings to reach the bridge. See the root [build guide](../build-requirements.md) for complete setup.

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

Android cleartext HTTP is enabled for this private-LAN demo by the local config plugin in `plugins/with-local-bridge-http.js`. The permission is broad to support the entered laptop URL; do not use this demo configuration as a production network policy.
