# Poultri mobile prototype implementation brief

## Objective

Build a polished, demonstrable mobile prototype for Poultri, a low-cost early-warning monitor for small and medium layer farms. Use React Native with Expo. A mentor or business partner should be able to open the app in Expo Go or install an Android APK and complete the main demo without an account, backend, farm hardware, or internet connection.

This prototype demonstrates the proposed product experience. It does not connect to cameras or sensors and must not present simulated data or validation targets as real measurements or achieved results.

## Product guardrails

- Poultri identifies changes that may need attention; it does not diagnose disease or prescribe treatment.
- Clearly label readings, alerts, charts, and farm records as **Demo data** or **Simulated** wherever a viewer could mistake them for live farm data.
- Do not claim validated accuracy, alert reliability, savings, mortality reduction, or field results. The concept note's 80% controlled-video accuracy, alert within one minute, seven offline days, and three-farm, 8–12-week field test are **validation targets**, not results.
- Preserve the proposed ₱40,000 sensor and installation package price and separate recurring monitoring subscription as proposal/business information, not a confirmed live offer.
- Keep the product focused on layer farms. Do not add diagnosis, treatment advice, computer vision, real device integrations, cloud accounts, or payment flows to this prototype.

## Minimum prototype scope

Build one mobile app with a local, seeded demo dataset and a small number of useful screens. Use straightforward React Native components and Expo-compatible libraries only when the platform does not already provide the feature.

### 1. Overview

- Poultri identity and a clear farm selector/name (seed with **Demo Layer Farm**).
- Summary cards for active houses, current alerts, temperature/humidity, and today's egg production.
- House status list for at least three poultry houses, each showing temperature, humidity, movement/activity status, and a simple status such as Normal or Needs inspection.
- A prominent latest alert when one exists.
- A visible **Demo data** label and a demo timestamp.

### 2. Poultry house detail

- House name/number, bird count, temperature, humidity, bird movement/activity, and daily egg production.
- A simple recent trend visualization for temperature and/or production. Prefer a compact native/custom view over adding a chart dependency just for the prototype.
- Camera and sensor status shown as descriptive demo states (for example, “Existing camera · simulated activity” and “Sensor · demo reading”). Do not request camera or location permissions.

### 3. Alerts and response

- Alert list with severity, house, time, observed change, and status (New, Acknowledged, Resolved).
- Seed at least one representative combined alert: “Bird movement has dropped while temperature is rising. Inspect this poultry house.”
- Detail view explains the observed signals and offers **Acknowledge** and **Mark resolved** actions.
- Repeat the non-diagnostic notice on alert detail: “This is an early warning, not a diagnosis. Inspect the area and decide what action to take.”
- Status changes should update immediately and persist locally between app launches.

### 4. Farm records

- A compact daily egg-production view for the demo farm and selected house, with date and quantity.
- Show a simple recent history (at least seven demo days) and indicate when production is below its seeded baseline.
- Production changes are context for inspection, not automatic diagnoses.

### 5. Demonstration controls

- A clearly labeled **Demo controls** area, accessible from Overview or Settings, with actions to:
  - Trigger the sample rising-temperature + reduced-movement alert.
  - Reset the demo to its original seeded state.
  - Toggle **Simulate offline**.
- Offline mode changes the connectivity indicator and explanatory copy; core screens, seeded readings, records, and alert actions continue to work. State plainly that all data is stored on this device for the prototype. Do not claim that the app has proven seven-day offline operation.
- Alert trigger/reset and acknowledgement/resolution state must persist locally. Use the simplest Expo-compatible local storage option available in the project; add one small storage dependency only if needed.

### 6. About / proposed package

- Short product explanation: combines existing/compatible camera activity, temperature and humidity sensors, and farm records; on-site processing is the intended design for unreliable internet.
- Explain that hardware integration and on-site processing are not implemented in this demo.
- Show proposed sensor and installation package price of ₱40,000 and mention a separate recurring monitoring subscription as proposed pricing, subject to field validation.
- Show validation targets only under a clearly labeled “Targets to validate” section.

## Navigation and design

- Use bottom tabs or an equally obvious mobile navigation for **Overview**, **Alerts**, **Records**, and **About**. House details and alert details open from their parent screens. Avoid deep or hidden navigation.
- Visual direction: clean white surfaces, readable dark text, and Spring Boot green as the main accent (suggested `#6DB33F`). Use restrained red/amber/green status colors with text labels so color is never the only indicator.
- Use Poultri's supplied official logo if present. Inspect `assets/` before implementing. If no usable logo is present, make a simple text wordmark; do not invent or redraw an “official” logo. If the separate Poultri text asset is available, use only the short product tagline in the UI; do not paste the concept note into the app.
- Mobile-first layout, readable typography, touch targets, safe areas, and accessible labels. Handle smaller Android screens without clipped primary actions.
- Keep the interface credible for a farmer and polished enough for a live mentor/business-partner walkthrough. Avoid placeholder lorem ipsum and empty screens.

## Demo data

Use believable, deterministic sample values and name the data source in the UI. Seed one farm with three houses and several days of egg records. Include one alert scenario combining rising temperature with falling movement, plus normal house states for comparison. Ensure all values are plausible and do not imply they came from a real farm. Add a visible demo marker in the app chrome and on detail screens.

Suggested seed scenario: House 2 has a rising temperature around 33 °C, elevated humidity, and reduced movement; the other houses are in a normal demo range. Present this as a scenario for inspection, never as an animal-health diagnosis or universal threshold. Avoid hard-coded “safe” or “dangerous” veterinary thresholds.

## Technical implementation

- Start from the repository's existing structure. It currently contains only a minimal README and an `assets/` directory; inspect the directory contents before relying on assets.
- Create the app with the current stable `create-expo-app` workflow and TypeScript. Keep the default Expo project structure unless a specific requirement needs a change.
- Build for Android and Expo Go. Configure the Expo app name/slug as Poultri and use the logo as the app icon only if a suitable supplied image exists.
- Make the app useful with no server. Store seeded/editable demo state locally; no API, login, analytics, push notifications, or database server.
- Keep the data model small: farm, houses, readings, production entries, and alerts. Avoid generalized repositories, dependency injection, or future backend layers.
- Include clear run instructions and an APK build path in the app README. Prefer Expo Go for the quickest live demo and EAS Build's Android APK profile for a shareable install. Use an installable APK output, not an Android app bundle, for direct mentor/recruiter installation.
- Do not commit credentials, signing keys, or generated build artifacts.

## Delivery and completion criteria

The prototype is complete when an agent has:

1. Implemented the screens, seeded scenario, navigation, demo controls, and local persistence above.
2. Ensured the main flows work with airplane mode/network unavailable after the app is installed: overview → house detail, overview/alerts → alert detail → acknowledge/resolve, records, and demo reset/trigger.
3. Added a concise README with prerequisites, Expo Go launch steps, and exact steps to create/install an Android APK.
4. Run the available Expo typecheck/build or equivalent checks and fixed blocking errors. Do not claim a successful APK build unless one was actually produced.
5. Reported any unavailable logo/text asset, what was implemented, how to launch it, whether an APK was produced, and any remaining hardware/backend limitations.

## Explicitly out of scope

Real camera streaming or computer vision; physical sensor connectivity; alert rules calibrated to veterinary guidance; cloud sync; accounts/roles; push notifications; subscription billing; production deployment; measured impact claims; and the proposed farm field trial. These require validation or infrastructure beyond a demonstrator and should not be simulated as if already operational.
