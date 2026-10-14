# Poultri Wokwi + Mobile Demo

<p align="center">
  <img src="assets/poultri_full_logo.png" alt="Official Poultri full logo" width="190" />
</p>

## 🐔 What is Poultri?

**Poultri is a proposed monitoring system for commercial layer farms.** It is intended to help farm staff see changing conditions and identify which poultry house may need attention.

The longer-term concept may bring together:

- **Environmental sensors** for temperature, humidity, ammonia, and carbon dioxide.
- **Camera observations and farm records** to give staff more context.
- **A mobile app** for viewing monitoring information and alerts.
- **Optional farm-approved controls and SMS alerts**, depending on equipment compatibility, farm approval, and connectivity.

### What this demo shows

This repository demonstrates one small part of Poultri: **a simulated ESP32/DHT22 sends temperature and humidity readings from Wokwi, through a laptop bridge, to the mobile app.** The app displays the readings and an illustrative inspection prompt.

> **Prototype status:** Poultri is still a concept and prototype. This demo uses simulated data; it has not been validated on a farm and does not provide poultry-health guidance.

## Team

- **Aldrin Kyle Delfin** — Team Lead & System Architect
- **Nadah Isidro** — UI/UX Design
- **Lance Kyle Ebue** — Product Analyst
- **Ralph Xavier Macabante** — Software Developer

## What works in this demo

- Wokwi simulates one ESP32 and one DHT22. Change temperature and humidity from the sensor controls.
- The ESP32 sends readings every two seconds to the local Node bridge.
- The mobile app displays temperature, humidity, connection state, sample age, and an inspection prompt.
- The first fresh reading after connecting or resetting is the reference. A rise of **1.5°C or more** creates one prompt. Acknowledge it; lower the temperature to show recovery; use **Reset Demo** to start a new app session.
- Humidity is display-only. All values and the alert rule are illustrative.

**Scope note:** the current app uses the relative **+1.5°C** rule. The proposed fixed 25°C threshold and simulated fan indicator are not implemented yet.

## Run the connected demo

### Before you start

Install or have ready:

1. **Node.js LTS** and npm.
2. **VS Code** with the **Wokwi for VS Code** extension.
3. **PlatformIO Core** or the **PlatformIO IDE** extension.
4. **Wokwi Private IoT Gateway access**. The private gateway is required for Wokwi to reach the bridge on your laptop; Wokwi lists it as a paid-plan feature. The public gateway cannot reach your laptop's local bridge. See [Wokwi's gateway guide](https://docs.wokwi.com/guides/esp32-wifi).
5. An Android phone and laptop on the same Wi-Fi for the connected phone demo.

### 1. Build the Wokwi firmware

Open PowerShell at the repository root and build the ESP32 firmware:

```powershell
$pio = Join-Path $env:USERPROFILE '.platformio\penv\Scripts\platformio.exe'
Push-Location .\wokwi
& $pio run
Pop-Location
```

Wait for PlatformIO to report a successful build. Firmware output is created in `wokwi/.pio/build/esp32dev/`. If `pio` is already on your PATH, you can run `pio run` from `wokwi/` instead.

### 2. Start the local bridge

Open a **second PowerShell terminal** at the repository root:

```powershell
Set-Location .\bridge
npm.cmd start
```

Leave this terminal open. The bridge prints:

- The Wokwi address: `http://host.wokwi.internal:4174`
- Candidate laptop Wi-Fi addresses for the phone, such as `http://192.168.1.20:4174`

If Windows Firewall asks, allow Node on **Private networks only**.

### 3. Start the Wokwi simulation

1. Open this repository in VS Code.
2. If Wokwi has not selected the project, press **Ctrl+Shift+P**, run **Wokwi: Select Config File**, and choose `wokwi/wokwi.toml`.
3. Press **Ctrl+Shift+P** and run **Wokwi: Start Simulator**.
4. Confirm the serial monitor prints temperature/humidity readings and successful bridge POST status codes.

The project uses the private gateway at `ws://localhost:9011`. Its gateway process should report **Listening on TCP port 9011** and then show a connected client. If Wokwi says it cannot connect to that address, the sensor simulation can still run, but readings will not reach the bridge or app. Follow [Wokwi's gateway setup](https://docs.wokwi.com/guides/esp32-wifi); the [official Windows gateway download](https://github.com/wokwi/wokwigw/releases/latest) is available if needed.

### 4. Start the mobile app

Open a **third PowerShell terminal** at the repository root:

```powershell
Set-Location .\mobile
npm.cmd install
npx.cmd expo start
```

For UI iteration, scan the QR code with Expo Go. For the connected Android demo, install the project's preview APK so its local-network HTTP configuration is included:

```powershell
npx.cmd eas-cli@latest login
npm.cmd run build:apk
```

Install the generated APK on the phone. Keep the phone and laptop on the same Wi-Fi network.

### 5. Connect and run the alert demo

1. In the app, enter the laptop Wi-Fi address printed by the bridge, for example `http://192.168.1.20:4174`.
2. Tap **Connect** and wait until the app shows a reading.
3. Leave the Wokwi DHT22 at **24.0°C** while the app takes its first reading as the reference.
4. Click the DHT22 in Wokwi to open its controls. Raise the temperature to **25.5°C or higher**.
5. Wait for the next sensor update. The app should show **Temperature rise detected**.
6. Tap **Acknowledge**. Lower the temperature to show **Reading recovered**; the prompt remains until **Reset Demo** is tapped.

The ESP32 samples every two seconds and the app polls the bridge every second, so allow a few seconds for each change to appear.

## Repeat the demo

There is no single control that resets Wokwi, the bridge, and the app together. To start another run quickly:

1. Restart the Wokwi simulation, or set the DHT22 temperature below the alert trigger.
2. Wait for a fresh reading in the app.
3. Tap **Reset Demo** in the app.
4. Raise the DHT22 temperature again.

Keep the bridge running between runs. The next Wokwi POST replaces its latest reading; the app reset clears the app's session reference and prompt.

## Troubleshooting

- **Wokwi simulation runs, but app receives no readings:** check that the private gateway is active at `ws://localhost:9011`. The public gateway cannot connect to the laptop bridge.
- **App cannot connect:** check that Node is running, use the laptop's Wi-Fi IPv4 address with port `4174`, keep the phone and laptop on the same Wi-Fi, and allow Node through Windows Firewall on Private networks.
- **Old reading remains visible:** the app labels readings older than five seconds as stale. Confirm Wokwi is running and sending successful POSTs.

## Project guides

- [MVP requirements](mvp-requirements.md) — demo scope and presenter flow.
- [Build requirements](build-requirements.md) — architecture, bridge API, setup, and verification details.
- [Implementation notes](implementation.md) — current feature inventory and verification status.

**Prototype boundary:** no physical sensors, fan control, diagnoses, accounts, cloud services, push notifications, or farm validation.
