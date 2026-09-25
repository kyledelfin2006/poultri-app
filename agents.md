# Agent handoff and MVP assessment

## Current delivery

The repository includes an Expo / React Native TypeScript mobile demonstrator in `mobile/`, on the `main` branch. It is intended for Expo Go demos and an installable Android APK built with EAS. The official icon and wordmark are now used from the supplied `assets/` files.

Expo lint (`npx expo lint`), TypeScript (`npx tsc --noEmit`), and the Android production export (`npx expo export --platform android`) pass. The export includes Hermes bytecode and verifies the app's production JavaScript bundle; it does not compile a native APK. No APK has been produced; that step requires an Expo account and an EAS hosted build.

## Concept MVP assessment

| Product MVP from the concept | Prototype coverage | Assessment |
|---|---|---|
| Farm and house monitoring overview | Color-coded Home metrics, three house cards, signal bars, readings, production totals, and status | Demonstrated with seeded data |
| Rising temperature + reduced movement warning | Rule-triggered warnings from scenario steps and editable signals | Demonstrated with a deterministic, unvalidated local rule |
| Temperature and humidity monitoring | Shown on overview and house details | Simulated; no sensors connected |
| Camera activity and existing-camera compatibility | Camera state is described as simulated | UI concept only; no camera input, stream, or vision processing |
| Farm production records | Seven-day egg production charts, per-house comparison, and Simulator input | Demonstrated with illustrative records |
| Alert review and farmer response | Reference/latest visual comparison, active/recovered cue, acknowledge, note, and resolve actions | Demonstrated locally; no notifications or worker assignment |
| Operation during unreliable internet | Local data plus a simulate-offline indicator and control | App flow is local; seven-day offline endurance is unvalidated |
| On-site processing | Explained on Profile screen as an intended capability | Not implemented; there is no edge device or processing pipeline |
| Proposed ₱40,000 package and separate subscription | Clearly labeled proposed pricing | Presentation only; no sales or billing flow |
| Reliability, accuracy, and field validation | Targets are identified as targets | Not performed; no validated claims are made |
| Farm profile and demo edits | Welcome screen, editable farm/owner/house details, and Simulator egg-production input | Local presentation-only profile; no real login or user accounts |
| Inspection notes | Alert can save a note locally | Demonstrated locally; not shared with workers |
| Scenario walkthrough | Dedicated Simulator page with Normal, Temperature rising, Movement dropping, Recovery presets, step controls, sliders, and Pi/IoT status notice | Deterministic local simulation; Raspberry Pi and IoT input are planned, not connected; rule is explicitly labeled unvalidated |

### MVP conclusion

This build covers the product's core *demonstration MVP*: a branded welcome/profile flow, visual farm dashboards, a dedicated shared-state simulator, rule-triggered warning demonstrations, inspection notes, production history, and a basic offline walkthrough. It does not meet the deployable *farm monitoring MVP*: inputs and alert rules are simulated, the rule is not validated, and there is no on-site processing or field result. Do not describe simulated functionality as a working hardware system.

## Demo path

1. Continue from the static welcome screen into the demo farm.
2. Open **Simulator** from Home. Read the notice that Raspberry Pi/IoT ingestion is intended for deployment but is not connected in this prototype.
3. Choose Temperature rising or Movement dropping, then advance steps to show the Simulator, Home dashboard, house detail, and alert comparison update.
4. Open the alert, acknowledge it, and save an inspection note.
5. Return to Simulator, choose Recovery, and advance the steps. Confirm readings recover while the alert and note remain available; resolve the record from Alerts.
6. Adjust House 2's egg slider and open Records to compare the updated seven-day production visuals.
7. Open Profile to edit farm/owner/house details or reset the seeded demo.
8. Toggle Simulate offline and show that local screens remain available.

## Boundaries for follow-on agents

- Keep demo and simulated labels visible wherever readings could be mistaken as live.
- Keep the Simulator notice above all controls and describe Raspberry Pi/IoT readings as planned deployment input, never as connected prototype hardware.
- Keep Home at-a-glance; keep all what-if readings and production inputs on Simulator. Records is a read-only history view.
- Derive charts, status, and alert conditions from the shared `DemoProvider` state. A recovered condition must not delete an unresolved alert or its note.
- Do not add diagnoses, treatment recommendations, unsupported accuracy claims, or fabricated farm validation.
- Keep camera integration, sensors, edge processing, and field validation out of the mobile prototype until hardware and test data are available.
- Keep the supplied logo and wordmark in the login, home, and profile experience; do not redraw or recolor the official artwork.

See `implementation.md` for the original detailed execution brief and `mobile/README.md` for launch and APK instructions.

## UI/UX and YAGNI guardrails

- Keep the supplied Poultri logo and wordmark intact in the welcome, app header, and profile experience.
- Keep screens focused and navigation obvious: Home, Alerts, Records, and Profile. The welcome screen is a static demo entry, not authentication.
- Prefer familiar controls and clear feedback. Aim for 44 dp touch targets, accessible labels and selected states, readable supporting text, and a layout that fits smaller phones.
- Preview slider values while dragging; update readings and connected views when released. Charts and status must use the same scenario timeline as the displayed readings.
- Keep demo/simulated labels visible, and describe alerts as inspection prompts rather than diagnoses.
- Apply YAGNI: retain only features that serve the agreed demo MVP, reuse Expo / React Native primitives, and avoid new layers, dependencies, or settings without a demonstrated need.
- Keep the local model and alert rule small. Share thresholds between status and alert logic, and call them illustrative and unvalidated.
- Do not add accounts, backend, IoT, camera processing, notifications, billing, or claims of farm validation without new requirements and evidence.
- Keep `README.md`, `implementation.md`, and `mobile/README.md` aligned with the working screens and demo flow.
