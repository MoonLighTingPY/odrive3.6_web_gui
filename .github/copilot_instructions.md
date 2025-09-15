# Copilot Instructions – ODrive Web GUI

## Overview

This project is a **Web GUI Interface for ODrive**, designed to support **two API versions**:

* **ODrive 0.5.6** (legacy API, last open source release).
* **ODrive 0.6.x** (new API structure with methods and different paths).

The GUI must dynamically detect the connected ODrive device version and automatically switch to the appropriate API reference, ensuring correct commands, configurations, and property handling.

---

## Technologies

* **Frontend:** React + Vite
  * Modular, reusable components.
  * Automatic UI generation based on API metadata.
  * State management via **Store with slices**:
    * **Device slice** – for managing connected devices.
    * **Config slice** – for managing configuration parameters for both axis. 
    * **UI slice** – for handling UI state.
    * **Telemetry slice** – for managing telemetry data (charts in Inspector).
    If needed - some slices may be duplicated to for example configSlice05x and configSlice06x for different versions, if needed.
* **Backend:** Python (Flask)
  * Unified API endpoints, version differences handled internally via adapters.
  * Provides data to frontend based on the API JSON files.
  * Telemetry data transfer via **WebSocket only**.

---

## Project Root Contents

* `backend/` – backend source code.
* `frontend/` – frontend source code.
* `odrive_api_references/` – documentation folder containing:
  * `API ODrive Reference 0.5.x.txt`
  * `API ODrive Reference 0.6.x.txt`
  * `odrive_reference05x.html`
  * `odrive_reference06x.html`
* `odriveApiReference05x.json` – structured metadata for ODrive 0.5.x API.
* `odriveApiReference06x.json` – structured metadata for ODrive 0.6.x API.

Both JSON files act as **bridges** between raw ODrive API references and the application. They provide metadata for commands, methods, properties, categories, and types.

---

## API Reference Handling

* Frontend and backend must consume the **separate JSON files** for each version.
* Both layers use metadata to:
  * Identify commands, properties, and methods.
  * Retrieve **name**, **category**, **description**, **path**, and **type**.
  * Validate parameters automatically based on type.
  * Generate UI dynamically (e.g., boolean → switch, numeric → input field, enum → dropdown).
* **Axes Handling:**
  * JSON references define commands for a single axis (Axis0).
  * The application must support multiple axes by cloning and replacing `axis0` with `axis1`, `axis2`, etc.
  * Config slice must adapt dynamically for multiple axes.

---

## Frontend Requirements

### Sidebar – DeviceList

* Displays a list of ODrive devices.
* Each entry shows **serial number**, **connect button**, and basic info.
* Once connected, shows live values (e.g., bus voltage).
* Connection state indicator (connected / reconnecting / disconnected).

### Main View – Tabs

The main interface has five tabs:

1. **Configuration**
   * Sub-tabs: (0.5.x: Power, Motor, Encoder, Control, Interface)/(0.6.x: Simmilar, but depends on the new API structure), Apply
    * Bulk actions:
      * `Erase Config`
      * `Pull Current Config`
      * `Apply and Reboot`
   * Inputs generated dynamically from API JSON.
   * **Advanced Sections** per category (collapsible).
   * Inline **Refresh Value** button per parameter.
   * Category-level **Refresh All** action.
   * Visual markers for:
     * Modified vs default values.
     * Invalid input (type/format).
   * Enum fields rendered as dropdowns; booleans as switches; numbers with min/max (if present in metadata); textual user notes where needed.
   * **Apply Tab**:
     * Grouped command preview (per axis + global).
     * Editable command lines (inline editing).
     * Enable/disable individual commands.
     * Add custom command row.
     * Remove command row.
     * Summary counts (total, modified, disabled).
     * Confirmation modals for destructive actions.
     * Post-apply status feedback (success / errors / pending reboot).
2. **Presets**
   * Save full configuration presets
   * Export / Import (JSON file).
   * Saved in localstorage.
3. **Dashboard**
   * High-level panels for:
     * Bus voltage / current.
     * Motor status (armed, errors).
     * Encoder status (ready, index found).
     * Controller mode / state machine state.
     * Temperature(s) if available.
   * Quick action buttons:
     * Reboot / Clear Errors / Run Calibration sequences.
   * Real-time mini-sparkline indicators for key metrics.
4. **Inspector**
   * Hierarchical **Property Tree** (expand/collapse).
   * Property search
   * Inline editing with validation.
   * Read-only properties visually distinguished (ex. a badge RO/RW)
   * Hover tooltips with description & type.
   * "Favourites" for separate categories
   * Checkbox per property to add/remove charts.
   * **Charts Panel**:
     * Real-time line charts (multiple series).
     * Legend with toggle visibility.
     * Time window selector (e.g., 10s / 30s / 60s).
     * Tooltip showing exact timestamp/value.
     * Min/max/avg stats
     * Filter toggle (Kalman)
5. **Command Console**
   * Command categories grouped (system, power, motor, encoder, controller, calibration, gpio, can, etc.).
   * Auto-generated command list from metadata.
   * Click inserts template into input field.
   * Command history with navigation (↑ / ↓).
   * Output formatting (raw / JSON pretty / single-value).
   * Error output highlighted separately.
   * Clear history button.
   * Favorite/pin frequently used commands.
   * Optional quick filter for command list.

---

## Additional UI Feature Inventory

* **Version Auto-Detection Banner**: Shows detected firmware version
* **Axis Context Indicators**: Current axis scope (Axis 0 / Axis 1 / Both) shown near action areas.
* **Dirty State Indicator**: Global unsaved changes badge in navigation.
* **Status Badges**:
  * Connected / Disconnected / Scanning.
  * Error / Warning / Healthy.
* **Inline Notifications**: Toast-style ephemeral feedback for actions (applied, failed, reset).
* **Deferred Loading States**: Skeleton placeholders for first-load property trees and dashboards.
* **Tooltips & Help Icons**: For less obvious parameters (especially advanced ones).
* **Per-Field Reset**: Refresh a single parameter to last fetched value.
* **Color Coding**:
  * Axis-scoped items tinted subtly by axis index.
  * Error vs normal values (e.g., red for fault flags).

---

## Presets UI

* Preset List:
  * Name, timestamp, size (count of params stored).
  * Apply, Rename, Duplicate, Delete actions.
* Import:
  * Drag & drop or file picker.
  * Validation summary (missing/unknown params).
* Export:
  * Full device state or axis-specific subset.
* Diff Preview:
  * Table: Parameter | Current | Preset | Action (Apply / Skip).
  * Apply selection remembered before final commit.

---

## Calibration Flows (UI Expression)

* Guided sequence prompts (e.g., “Begin Motor Calibration”).
* Status panel showing stage progression (Idle → Running → Complete / Failed).
* Real-time result fields (resistance / inductance / phase offset) where available.
* Retry / Abort buttons.
* Previous result caching (last successful run values).

---

## Error & Health Display

* Aggregated “System Status” panel summarizing:
  * Axis errors
  * Motor errors
  * Encoder errors
  * Controller errors
* Expandable error detail sections (bit-flag decoding presented as labeled chips).
* “Clear Errors” button with result toast.
* Visual pulse or highlight when a new error appears.

---

## Command Console UI Details

* Category sidebar with active highlight.
* Optional “Raw Entry Mode” toggle (no validation vs structured).
* Auto-suggestion (basic path completion) when typing.
* Execution timestamp tagging on each response block.
* Collapsible previous outputs to declutter.

---


## Summary of Core UI Goals

1. **Metadata-Driven Rendering** – No hardcoded field duplication.
4. **High Observability** – Real-time telemetry
5. **Safe Operations** – Clear confirmations, visibility into changes
6. **Scalable UI** – Additional axes, commands, or properties require minimal manual adjustment.
7. **Usability & Clarity** – Structured hierarchy, consistent language, responsive performance.
8. **Chakra-UI** - Use chakra 2.x


## Adiitional info for AI agents

* The user uses powershell, not cmd, so check the syntax for powershell when proposing a command to execute
* 
## **SUPER IMPORTANT** 

* NEVER ADD FALLBACKS IN THE CODE. THE CODE SHOULD BE PERFECTLY PREDICTABLE.
* NEVER HARDCODE ANYTHING, ESPECIALLY ODRIVE PATHS!
