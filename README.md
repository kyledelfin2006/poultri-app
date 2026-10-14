# Poultri Wokwi + Mobile Demo

<p align="center">
  <img src="assets/poultri_full_logo.png" alt="Official Poultri full logo" width="320" />
</p>

A small prototype: change a simulated DHT22 reading in Wokwi, send it through a local Node bridge, and show an illustrative inspection alert in the Poultri mobile app. All readings are simulated; this is not a farm monitoring product or validated poultry guidance.

## What the demo does

- Wokwi runs an ESP32 and DHT22 simulation. Change temperature and humidity using the DHT22 control panel.
- ESP32 firmware samples every two seconds and posts valid readings to the local bridge.
- The Expo app shows temperature, humidity, connection/stale status, and one inspection prompt.
- The first fresh temperature after app connect/reset is the baseline. Raising it by **1.5°C or more** creates the prompt. Acknowledge it, lower the temperature to show recovery, or reset the demo.
- The alert rule is illustrative only. No real sensors, diagnoses, controls, or farm validation are included.

## Run the connected demo

Prerequisites: Node.js LTS, Python 3.9+, PlatformIO Core, VS Code with the **Wokwi for VS Code** extension, Wokwi Private IoT Gateway access, and an Android phone on the same Wi-Fi as the laptop. Install PlatformIO Core with [its official installer](https://docs.platformio.org/en/latest/core/installation/methods/installer-script.html) or use the PlatformIO IDE extension. The Wokwi Private Gateway must be running for the simulated ESP32 to reach the laptop. The public gateway cannot reach the laptop's local bridge. See [Wokwi's network and gateway instructions](https://docs.wokwi.com/guides/esp32-wifi).

### 1. Build the firmware

From the repository root in PowerShell, run this once and again after firmware changes:

```powershell
$pio = Join-Path $env:USERPROFILE '.platformio\penv\Scripts\platformio.exe'
Push-Location .\wokwi
& $pio run
Pop-Location
```

The firmware files are generated under `wokwi/.pio/build/esp32dev/`.

### 2. Start the local bridge

In a new PowerShell terminal:

```powershell
Set-Location .\bridge
npm.cmd start
```

Keep this terminal open. It prints the Wokwi URL and possible phone URLs. If Windows Firewall asks, allow Node on **Private networks** only.

### 3. Start Wokwi

Open the repository in VS Code. If Wokwi does not find its project config automatically, open **Ctrl+Shift+P → Wokwi: Select Config File** and choose `wokwi/wokwi.toml`. Then run **Ctrl+Shift+P → Wokwi: Start Simulator**.

The Wokwi project uses `ws://localhost:9011` for the Private Gateway. Confirm its Wi-Fi status is healthy and the serial output shows readings and successful bridge POSTs. Click the DHT22 in the diagram to open its controls. If you see **“Failed to connect to the IoT Gateway at ws://localhost:9011”**, the simulation itself can still run, but readings will not reach the bridge/mobile app until the Private Gateway is available and active. Follow [Wokwi's gateway setup](https://docs.wokwi.com/guides/esp32-wifi); if needed, download and run the [official Windows gateway](https://github.com/wokwi/wokwigw/releases/latest), which should report **Listening on TCP port 9011**. Wokwi documents Private Gateway access as a paid-plan feature; the Public Gateway cannot reach a service on the laptop.

### 4. Start the mobile app and trigger the alert

In another PowerShell terminal:

```powershell
Set-Location .\mobile
npm.cmd install
npx.cmd expo start
```

Scan the QR code with Expo Go. In the app, enter the laptop's Wi-Fi IPv4 URL printed by the bridge, for example `http://192.168.1.20:4174`, then tap **Connect**. Do not enter `localhost` or `host.wokwi.internal` in the phone app. Keep the phone and laptop on the same Wi-Fi. Expo Go is for UI iteration; for the Android LAN demo, build and install the app's preview APK so the project's HTTP network configuration is included:

```powershell
npx.cmd eas-cli@latest login
npm.cmd run build:apk
```

For a quick alert demo, leave the Wokwi temperature at **24.0°C** while the app connects and establishes its baseline. Click the DHT22 controls and raise the temperature to **25.5°C or higher**. After the next sensor sample, the mobile app should show **Temperature rise detected**. Acknowledge it, lower the temperature below the trigger to show recovery, or tap **Reset demo**.

> **Current verification:** the firmware builds and the Wokwi simulator runs, but this machine's simulator reported that `ws://localhost:9011` was unavailable. The standalone simulation works; the Wokwi → bridge → mobile alert path still needs an active Private Gateway to be verified end to end.

For architecture, API details, troubleshooting, and the full presenter flow, see [build-requirements.md](build-requirements.md) and [mvp-requirements.md](mvp-requirements.md). The current demo feature inventory and verification notes are in [implementation.md](implementation.md).
