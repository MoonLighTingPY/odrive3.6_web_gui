# ODrive 3.6 Web GUI Project

## Project Overview
This is a comprehensive web-based GUI application for controlling ODrive v0.5.6 motor controllers. The project provides real-time telemetry, configuration management, calibration tools, and presets functionality through a modern React frontend and Python Flask backend.

## Architecture
- **Frontend**: React + Vite + Chakra UI (JavaScript)
- **Backend**: Python Flask with ODrive library integration
- **Target**: ODrive v0.5.6 firmware specifically, with API reference for v0.6.11 to implement it in the future
- **Deployment**: Can run as development server or PyInstaller executable with system tray

## Key Features
- Real-time telemetry and charts
- Complete ODrive configuration management
- Motor calibration wizards
- Configuration presets system
- Property tree inspector
- Command console
- System tray application for easy access

---

## File Structure & Descriptions

### Backend (Python Flask)
- **`backend/app/app.py`** - Main Flask application entry point, route registration, static file serving
- **`backend/app/odrive_manager.py`** - Core ODrive communication manager, handles device connection/disconnection, command execution
- **`backend/app/odrive_telemetry_config.py`** - Telemetry data collection and mapping for ODrive properties
- **`backend/app/constants.py`** - Application version and constants
- **`backend/start_backend.py`** - Standalone backend launcher with dependency checking
- **`backend/tray_app.py`** - System tray application for Windows deployment

#### Backend Utilities
- **`backend/app/utils/utils.py`** - General utilities: executable detection, browser opening, JSON sanitization
- **`backend/app/utils/property_tree_mapper.py`** - Maps frontend property paths to ODrive API paths
- **`backend/app/utils/calibration_utils.py`** - Calibration prerequisite checking and validation

#### Backend Routes (API Endpoints)
- **`backend/app/routes/device_routes.py`** - Device scanning, connection, disconnection endpoints
- **`backend/app/routes/config_routes.py`** - Configuration reading/writing, batch operations
- **`backend/app/routes/calibration_routes.py`** - Calibration process management and status
- **`backend/app/routes/telemetry_routes.py`** - Real-time telemetry data endpoints
- **`backend/app/routes/system_routes.py`** - System info and health check endpoints

### Frontend (React)
- **`frontend/src/App.jsx`** - Root React component with layout and device status
- **`frontend/src/components/MainTabs.jsx`** - Main tabbed interface with lazy loading
- **`frontend/src/components/DeviceList.jsx`** - Device discovery and connection interface
- **`frontend/src/components/MotorControls.jsx`** - Motor control buttons (enable/disable/calibrate)

#### Frontend Tabs
- **`frontend/src/components/tabs/ConfigurationTab.jsx`** - ODrive configuration management interface
- **`frontend/src/components/tabs/DashboardTab.jsx`** - Real-time telemetry dashboard with charts
- **`frontend/src/components/tabs/InspectorTab.jsx`** - Property tree browser and editor
- **`frontend/src/components/tabs/PresetsTab.jsx`** - Configuration presets management
- **`frontend/src/components/tabs/CommandConsoleTab.jsx`** - Direct ODrive command interface

#### Frontend Utilities
- **`frontend/src/utils/valueHelpers.js`** - Safe value formatting and conversions
- **`frontend/src/utils/unitConversions.js`** - ODrive v0.5.6 unit conversions (turns/s ↔ RPM)
- **`frontend/src/utils/odriveErrors.js`** - ODrive error code definitions and descriptions
- **`frontend/src/utils/odriveEnums.js`** - ODrive enumeration values (motor types, control modes, etc.)
- **`frontend/src/utils/axisStateChecker.js`** - Axis state monitoring and validation
- **`frontend/src/utils/propertyFavourites.js`** - Property favorites management in localStorage

#### Configuration Management
- **`frontend/src/utils/configBatchApi.js`** - Batch configuration loading from unified registry
- **`frontend/src/utils/configChangesDetector.js`** - Detects configuration changes for command generation
- **`frontend/src/utils/configCommandGenerator.js`** - Generates ODrive commands from configuration
- **`frontend/src/utils/configParameterGrouping.js`** - Groups configuration parameters by importance/category
- **`frontend/src/utils/configurationActions.js`** - Configuration API actions (apply, save, calibrate)

#### Presets System
- **`frontend/src/utils/presetsManager.js`** - Configuration presets CRUD operations
- **`frontend/src/utils/presetsActions.js`** - Preset API actions and device integration
- **`frontend/src/utils/presetsOperations.js`** - Import/export operations for presets
- **`frontend/src/utils/factoryPresets.js`** - Factory preset definitions and generation

#### ODrive Property System
- **`frontend/src/utils/odriveUnifiedRegistry.js`** - Unified registry system for all ODrive properties
- **`frontend/src/utils/odrivePropertyTree.js`** - Complete ODrive v0.5.6 property tree definition
- **`frontend/src/utils/odriveAxisTree.js`** - Axis-specific property definitions

#### Charts and Telemetry
- **`frontend/src/utils/chartFilters.js`** - Chart data filtering (moving average, low-pass)
- **`frontend/src/utils/chartStatistics.js`** - Real-time chart statistics calculation

#### Custom Hooks
- **`frontend/src/hooks/useDashboardTelemetry.js`** - Real-time telemetry data fetching for dashboard
- **`frontend/src/hooks/useCalibration.js`** - Calibration process management and status monitoring
- **`frontend/src/hooks/useChartsTelemetry.js`** - High-frequency telemetry for charts
- **`frontend/src/hooks/useOdriveButtons.jsx`** - Reusable ODrive control buttons with state management

### Documentation
- **`odrive_docs_local/`** - Local ODrive v0.5.6 documentation for reference
- **`odrive_docs_local/api_references/`** - API reference documents for v0.5.6 and v0.6.11

If you see that the description of any file here is not complete or wrong, please tell me, and suggest what to edit/add/remove in this file, for better context in future.
- **`.github/copilot-instructions.md`** - Instructions for Copilot AI to understand

---



## Development Notes
- Use PowerShell for terminal operations
- Project targets ODrive v0.5.6 firmware specifically, but 0.6.11 API reference is available for future compatibility
- Frontend uses Chakra UI for styling
- Backend handles all ODrive communication and provides REST API
- Property tree system provides single source of truth for all ODrive parameters
- Configuration system supports batch operations for performance
- Presets system allows saving/loading complete configurations
- Real-time telemetry optimized for dashboard and charting needs

## Key Concepts
- **Property Tree**: Hierarchical representation of all ODrive properties
- **Unified Registry**: Single source of truth for parameter definitions, commands, and mappings
- **Batch API**: Efficient bulk reading of ODrive properties
- **Telemetry Slices**: Separate Redux slices for different telemetry update rates
- **Axis-Aware**: All operations respect the selected axis (0 or 1)
- **State Management**: Redux for global state, local state for component-specific data

## Copilot Instructions

fyi, i use powershell only in my terminal.
if the change is code is not big - just show me the relevant part, and what i need to edit in the corresponding files.

There is local docs for odrive 0.5.6 at "odrive_docs_local\odrive_local\docs.odriverobotics.com\v\0.5.6"

also, there is an api reference for 0.5.6 and 0.6.11 at "odrive_docs_local\api_references\API ODrive Reference — ODrive Documentation 0.5.6 documentation.txt" and "odrive_docs_local\api_references\API ODrive Reference — ODrive Documentation 0.6.11 documentation.txt"

Current task - add 0.6.11 support to the project, so it will be able to work with both 0.5.x and 0.6.x odrives. always check the changelog and api reference for the changes in the new version, and how it affects the current code.