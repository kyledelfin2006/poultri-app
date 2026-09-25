# Agent handoff and MVP assessment

## Current delivery

The repository now includes an Expo / React Native TypeScript mobile demonstrator in `mobile/`, on the `DEMO` branch. It is intended for Expo Go demos and an installable Android APK built with EAS. The official icon and wordmark are now used from the supplied `assets/` files.

Expo lint (`npx expo lint`) and the TypeScript check (`npx tsc --noEmit`) pass, and Expo successfully exported the Android JavaScript bundle. No APK has been produced; that step requires an Expo account and an EAS hosted build.

## Concept MVP assessment

| Product MVP from the concept | Prototype coverage | Assessment |
|---|---|---|
| Farm and house monitoring overview | Three houses with readings, activity, egg counts, and status | Demonstrated with seeded data |
| Rising temperature + reduced movement warning | Rule-triggered warnings from scenario steps and editable signals | Demonstrated with a deterministic, unvalidated local rule |
| Temperature and humidity monitoring | Shown on overview and house details | Simulated; no sensors connected |
| Camera activity and existing-camera compatibility | Camera state is described as simulated | UI concept only; no camera input, stream, or vision processing |
| Farm production records | Seven-day egg production chart and per-house totals | Demonstrated with illustrative records |
| Alert review and farmer response | Alert detail, acknowledge, and resolve actions | Demonstrated locally; no notifications or worker assignment |
| Operation during unreliable internet | Local data plus a simulate-offline indicator and control | App flow is local; seven-day offline endurance is unvalidated |
| On-site processing | Explained on Profile screen as an intended capability | Not implemented; there is no edge device or processing pipeline |
| Proposed ₱40,000 package and separate subscription | Clearly labeled proposed pricing | Presentation only; no sales or billing flow |
| Reliability, accuracy, and field validation | Targets are identified as targets | Not performed; no validated claims are made |
| Farm profile and demo edits | Welcome screen, editable farm/owner/house details and egg records | Local presentation-only profile; no real login or user accounts |
| Inspection notes | Alert can save a note locally | Demonstrated locally; not shared with workers |
| Scenario walkthrough | Normal, Temperature rising, Movement dropping, and Recovery presets with step controls and sliders | Deterministic simulation; rule is explicitly labeled unvalidated |

### MVP conclusion

This build covers the product's core *demonstration MVP*: a branded welcome/profile flow, farm visibility, editable example records, scenario-based readings, rule-triggered warning demonstrations, inspection notes, and a basic offline walkthrough. It does not meet the deployable *farm monitoring MVP*: inputs and alert rules are simulated, the rule is not validated, and there is no on-site processing or field result. Do not describe simulated functionality as a working hardware system.

## Demo path

1. Continue from the static welcome screen into the demo farm.
2. Choose Temperature rising or Movement dropping, then advance steps to show trends and alerts update.
3. Adjust House 2's reading sliders to create another rule-triggered alert.
4. Open the alert, acknowledge it, add an inspection note, then resolve it.
5. Open Records and switch between houses; edit today's demo egg count.
6. Open Profile to edit farm/owner/house details or reset the seeded demo.
7. Toggle Simulate offline and show that local screens remain available.

## Boundaries for follow-on agents

- Keep demo and simulated labels visible wherever readings could be mistaken as live.
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
- Keep `implementation.md`, `instructions.md`, and `mobile/README.md` aligned with the working screens and demo flow.
