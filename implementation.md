# Poultri mobile prototype implementation brief

## Objective

Maintain a polished Expo / React Native demonstrator for Poultri. Mentors and business partners should be able to explore the main product idea using Expo Go or an installable Android APK, with no account, backend, camera, or farm hardware.

This app is a local simulation. Keep that clear anywhere a reading, alert, or record could look real. Poultri surfaces changes for inspection; it does not diagnose or prescribe treatment.

## Product guardrails

- Treat concept-note accuracy, response-time, offline-duration, and field-trial numbers as targets to validate, never as achieved results.
- Describe the ₱40,000 installation package and separate subscription as proposed pricing.
- Keep cameras, sensors, edge processing, cloud sync, accounts, notifications, payments, and farm trials out until evidence or infrastructure exists.
- Keep the local demo useful without implying that a hardware monitoring MVP exists.

## Demonstration MVP

The existing mobile app in `mobile/` is the scope to maintain:

- Branded static welcome screen with one clear demo entry action; it is not real authentication.
- Home overview with three editable example houses, current readings, production totals, status, and open alerts.
- House details with simulated temperature, humidity, movement, activity, and production context.
- Four local scenarios: Normal, Temperature rising, Movement dropping, and Recovery. The presenter selects a scenario and advances it one step at a time. A step updates readings, recent charts, house status, and alert state together.
- Editable temperature, humidity, movement, and egg production controls. Signal changes evaluate the same clearly explained demonstration rule used for house status. This rule is illustrative and unvalidated.
- Alert list and detail with acknowledgement, resolution, and a saved inspection note.
- Records view for selecting a house, viewing seven illustrative days, and editing today's egg total.
- Profile for local farm, owner, house, and bird-count edits; offline demonstration toggle; data reset; proposal and validation context.
- Local persistence on the device. No network service is required after installation.

Do not add product features speculatively. Prefer a direct screen or native control to a new abstraction or dependency. Retain a library only when it provides an active user-facing capability that Expo / React Native does not already provide.

## UI and UX requirements

- Use the supplied official Poultri logo and wordmark as provided. Do not redraw or recolor the artwork.
- Use white surfaces, readable dark text, and Spring Boot green (`#6DB33F`) as the primary accent. Amber and green status states must also have text labels.
- Give each screen one clear title and primary action. Keep navigation visible and use familiar labels: Home, Alerts, Records, Profile.
- Keep interactive controls at least 44 dp high where practical. Give buttons, scenario choices, house cards, and selectors accessible roles, labels, and selected states.
- Use readable supporting text (normally 12 sp or larger), meaningful spacing, safe areas, and layouts that fit narrow Android screens.
- Show slider values as they move and commit a reading when the presenter releases the control.
- Make selected states and system feedback clear. Avoid color as the only status cue and avoid tiny chart labels.
- Mark simulated values and example records in context. Keep the alert explanation factual: state the observed change and its demo reference, then invite inspection.
- Keep the welcome page intentionally static. Do not add password fields, account setup, or a second path that bypasses the main demo action.

## Data and alert behavior

- Use a small local model for farm details, houses, readings, seven production values, alerts, and scenario progress.
- Keep scenario data deterministic, bounded, and plausible for a presentation. Scenario steps should show normal behavior, a change, an alert, and recovery across the available presets.
- Use one shared set of example-rule thresholds for both generated alert text and house status. Explain the rule and label it as unvalidated.
- Preserve acknowledgement, resolution, notes, profile edits, readings, and records across relaunches. Reset restores a clean walkthrough.
- Do not use health diagnoses, treatment advice, or universal safe/danger thresholds.

## Run and delivery

- Use the existing Expo Router / TypeScript app structure and dependencies. Avoid a server and avoid adding dependencies for one-off UI details.
- For Expo Go: from `mobile/`, run `npm install` and `npx expo start`; scan the QR code on the same network.
- For an installable APK: use the EAS `preview` profile in `mobile/eas.json`, which must produce an APK rather than an app bundle. State clearly if no hosted APK build has been produced.
- Follow `instructions.md` for the presenter walkthrough and `mobile/README.md` for app-specific launch/build details.
- Before completion, follow `mobile/AGENTS.md` for Expo lint and TypeScript checks. Never describe those checks as an APK build.

## Out of scope

Live cameras or computer vision; physical sensor connections; calibrated poultry-health rules; cloud accounts and synchronization; push notifications; billing; deployment; validated impact claims; and field trials.
