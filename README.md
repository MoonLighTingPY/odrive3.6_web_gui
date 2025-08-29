# 🚀 ODrive Web GUI (v0.5.x & v0.6.x) 

A web-based GUI for configuring, monitoring, and controlling ODrive motor controllers running firmware v0.5.1 - v0.5.6 and v0.6.x (up to v0.6.11)
  > **No Python or Node.js required for Windows users – just download and run!**

[![Latest Release](https://img.shields.io/github/release/MoonLighTingPY/odrive3.6_web_gui.svg?logo=github)](https://github.com/MoonLighTingPY/odrive3.6_web_gui/releases)
[![ODrive Firmware](https://img.shields.io/badge/ODrive_firmware-v0.5.x%20%7C%20v0.6.x-blue.svg)](https://docs.odriverobotics.com/)
[![Python](https://img.shields.io/badge/Python-3.8.6-green.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org)

## 🧭 Quick Navigation

<div align="center">

[**✨ Why This GUI?**](#-why-this-gui) • 
[**🎯 Key Features**](#-key-features) • 
[**📥 Quick Start**](#-quick-start) • 
[**🏗️ Building**](#️-building-from-source) • 
[**📖 Documentation**](#-documentation) • 
[**🤝 Contributing**](#-contributing)

</div>

## ✨ Why This GUI?

The official ODrive GUI supports newer firmware versions but has limited support for older versions. This project provides comprehensive support for both legacy and current firmware with:

- **Full Version Support:** Complete compatibility with both 0.5.x and 0.6.x firmware versions
- **Automatic Detection:** Seamlessly switches between firmware versions based on connected device  
- **Feature Parity:** All functionality of the official GUI adapted for multiple firmware versions + new features!
- **Standalone Deployment:** Windows executable doesn't require Python/Node.js installation
- **Cross-Platform:** Works on Linux, macOS, and Windows (executable available for Windows)


## 🎯 Key Features

| Feature                | Status | Notes                                 |
|------------------------|--------|---------------------------------------|
| Configuration Wizard    | ✅     | Power, Motor, Encoder, Control, Interface             |             |
| Presets Wizard | ✅     |     Import/export configuration presets                          |
| Inspector            | ✅     | Inspect and tweak any ODrive properties/settings              |
| Live Charts         | ✅     | Chart any properties/settings in real time                  |
| Dashboard         | ✅     | Quick control and telemetry manager                   |
| Command Console            | ✅     | Categorized native protocol commands                |
| Calibration (motor/encoder)           | ✅     | Full working calibration                |
| Multi-Axis Support            | ✅     | Configure/calibrate/inspect properties of any axis |
| Multi-Device Support            | 🛠️     | Not tested enough yet               |

### 🆕 ODrive 0.6.x Features (NEW!)

| Feature                | Status | Notes                                 |
|------------------------|--------|---------------------------------------|
| **New Encoder Architecture** | ✅ | Load Mapper, Commutation Mapper, Position/Velocity Mapper |
| **Harmonic Compensation** | ✅ | Encoder distortion correction for smoother operation |
| **Thermal Current Limiting** | ✅ | Temperature-based current limiting for enhanced safety |
| **Enhanced Diagnostics** | ✅ | Detailed error codes, system statistics, diagnostic methods |
| **Advanced Initialization** | ✅ | init_pos, init_vel, init_torque startup parameters |
| **Improved CAN Features** | ✅ | Enhanced CAN diagnostics and configuration |
| **New System Methods** | ✅ | identify_once(), test_function(), enhanced debugging |

### Configuration
- **6-Step Setup:** Power → Motor → Encoder → Control → Interfaces → Apply
- **Live Command Preview:** See exact ODrive commands before execution  
- **Preset Management:** Save/load/share motor configuration presets
- **Version-Aware Properties:** Automatically adapts to firmware version (0.5.x vs 0.6.x)

### Inspector & Debugging
- **Property Tree:** Browse and edit all ODrive parameters
- **Live Charts:** Real-time plotting of any property
- **Command Console:** Direct ODrive native command interface (odrivetool) with history

### Dashboard
- **Live Telemetry:** Position, velocity, current, voltage, and more
- **System Health:** Error monitoring and diagnostics
- **Calibration Tools:** Step-by-step motor and encoder calibration

### Device Management
- **Auto-Discovery:** Automatic USB device scanning
- **Multi-Version Support:** Works with both 0.5.x and 0.6.x firmware  
- **Automatic Version Detection:** Seamlessly adapts to connected firmware version
- **Connection Monitoring:** Connection recovery and status tracking

---

## 📥 Quick Start

### Windows (Recommended)

1. **Download** the latest release from [GitHub Releases](https://github.com/MoonLighTingPY/odrive3.6_web_gui/releases)
2. **Run** `ODrive_GUI_Tray.exe` – your browser will open automatically
3. **Connect** your ODrive via USB and start configuring!

> 💡 The Windows build is completely standalone – no Python, Node.js, or other dependencies required.

### Development Setup (Linux/macOS/Advanced)

#### Prerequisites
- Python 3.8+ with pip
- Node.js 16+ with npm

#### Backend Setup
```bash
git clone https://github.com/MoonLighTingPY/odrive3.6_web_gui.git
cd odrive3.6_web_gui/backend
pip install -r requirements.txt
```

#### Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

Navigate to `http://localhost:3000` in your browser.

---

## 🏗️ Building from Source

### Windows Executable

```bash
# 1. Run ./build.bat
git clone https://github.com/MoonLighTingPY/odrive3.6_web_gui.git
cd odrive3.6_web_gui/
./build.bat

# 2. Select Full build
============================================
ODrive v0.5.6 Web GUI Build Script
============================================

Choose build option:
[1] Full install (build frontend + install dependencies + build executable)
[2] Build only (skip frontend build and dependency installation)

Enter your choice (1 or 2): 1 <--

# Your executable will appear in backend/dist/ after building
```

### Development Mode

```bash
# This will run the frontend and backend concurrently
cd frontend
npm run dev
```

---

## 📖 Documentation

- **0.6.11 Support Guide:** [ODrive 0.6.11 Support Documentation](ODrive_0611_Support_Documentation.md)
- **Online Docs:** [ODrive v0.5.6 Official Docs](https://docs.odriverobotics.com/v/0.5.6/getting-started.html)
- **API Reference:** [ODrive v0.5.6 API](https://docs.odriverobotics.com/v/0.5.6/fibre_types/com_odriverobotics_ODrive.html)


## 🚀 Future Enhancements
- [ ] **Remote Access:** Network-based device control
- [ ] **PID Tweaking:** Automated and manual PID tweaker


## 🤝 Contributing

Contributions are welcome! Whether it's bug fixes, new features, or general improvements:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**⚡ Made for ODrive users who need support for both legacy (v0.5.x) and modern (v0.6.x) firmware versions**

*If you find this project helpful, please consider giving it a ⭐ on GitHub!*
