# 🚀 ODrive v3.6(0.5.6) Web GUI

A comprehensive, modern web-based GUI for configuring, monitoring, and controlling ODrive motor controllers running firmware v0.5.6 (aka v3.6). Built with React frontend and Python Flask backend for maximum compatibility and performance.

[![Latest Release](https://img.shields.io/github/release/MoonLighTingPY/odrive3.6_web_gui.svg?logo=github)](https://github.com/MoonLighTingPY/odrive3.6_web_gui/releases)
[![ODrive Firmware](https://img.shields.io/badge/ODrive-v0.5.6%20(v3.6--56V)-blue.svg)](https://docs.odriverobotics.com/v/0.5.6/)
[![Python](https://img.shields.io/badge/Python-3.8.6-green.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org)

## ✨ Why This GUI?

The official ODrive GUI only supports newer firmware versions, leaving v0.5.6 users without a modern interface. This project fills that gap with:

- **Native v0.5.6 Support**: Built specifically for ODrive firmware v0.5.6 (v3.6-56V)
- **Complete Feature Parity**: All functionality of the official GUI adapted for older firmware
- **Modern Web Interface**: Responsive React-based UI with real-time updates
- **Standalone Deployment**: Windows executable requires no Python/Node.js installation
- **Cross-Platform**: Works on Windows, Linux, and macOS

## 🎯 Key Features

| Feature | Status | Notes |
|---------|--------|-------|
| Motor Configuration | ✅ | All motor types supported |
| Encoder Setup | ✅ | Incremental, Hall, SPI, Analog |
| Control Modes | ✅ | Position, Velocity, Torque |
| CAN Interface | ✅ | Full CANopen support |
| UART Interface | ✅ | All protocols supported |
| Step/Direction | ✅ | Real-time step input |
| Anticogging | ✅ | Automatic calibration |
| Endstops | ✅ | Min/Max with homing |
| Thermistors | ✅ | FET and motor monitoring |
| Brake Resistor | ✅ | Configurable limits |


### 🔧 Configuration Wizard
- **6-Step Setup Process**: Power → Motor → Encoder → Control → Interfaces → Calibration
- **Live Command Preview**: See exact ODrive commands before execution
- **Smart Validation**: Real-time parameter validation with helpful error messages
- **Preset Management**: Save and load common motor configurations

### 📊 Real-Time Dashboard
- **Live Telemetry Plots**: Position, velocity, current, and voltage over time
- **Thermal Monitoring**: FET and motor temperature gauges with limits
- **Power Metrics**: Real-time power consumption and efficiency
- **System Health**: Comprehensive error monitoring and diagnostics

### 🔍 Inspector & Debugging
- **ASCII Console**: Direct ODrive command interface with autocomplete
- **Command History**: Persistent command history with search
- **JSON Property Viewer**: Live device state in structured format
- **Property Tree**: Navigate and modify all ODrive parameters

### 🖥️ Device Management
- **Auto-Discovery**: Automatic USB device scanning
- **Multi-Device Support**: Manage multiple ODrive units simultaneously
- **Connection Monitoring**: Real-time connection status and recovery
- **Device Information**: Hardware/firmware version display

### 🎮 Motor Controls
- **Manual Control**: Direct position, velocity, and torque commands
- **Safety Features**: Configurable limits and emergency stop
- **Calibration Tools**: Step-by-step motor and encoder calibration
- **Homing Functions**: Automated homing with endstop support

## 📥 Quick Start

### Windows (Recommended)

1. **Download** the latest release from [GitHub Releases](https://github.com/MoonLighTingPY/odrive3.6_web_gui/releases)
2. **Extract** the zip file to your desired location
3. **Run** `tray_app.exe` - your browser will open automatically
4. **Connect** your ODrive via USB and start configuring!

> 💡 The Windows build is completely standalone - no Python, Node.js, or other dependencies required.

### Development Setup

For development or non-Windows platforms:

#### Prerequisites
- Python 3.8+ with pip
- Node.js 16+ with npm
- ODrive connected via USB

#### Backend Setup
```bash
git clone https://github.com/MoonLighTingPY/odrive3.6_web_gui.git
cd odrive3.6_web_gui/backend
pip install -r requirements.txt
python start_backend.py
```

#### Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

Navigate to `http://localhost:3000` in your browser.

## 🏗️ Building from Source

### Windows Executable

```bash
# 1. Setup backend dependencies
cd backend
pip install -r requirements.txt

# 2. Build frontend
cd ../frontend
npm install
npm run build

# 3. Create executable
cd ../backend
pyinstaller tray_app.spec --clean --noconfirm

# Your executable will be in dist/ODrive_GUI_Tray.exe
```

### Development Build

```bash
# Backend (Terminal 1)
cd backend
python start_backend.py

# Frontend (Terminal 2)
cd frontend
npm run dev
```

## 📖 Documentation

### ODrive v0.5.6 Resources
- **Local Documentation**: Complete offline docs in `odrive_docs_local/`
- **Online Documentation**: [ODrive v0.5.6 Official Docs](https://docs.odriverobotics.com/v/0.5.6/getting-started.html)
- **API Reference**: [ODrive v0.5.6 API](https://docs.odriverobotics.com/v/0.5.6/fibre_types/com_odriverobotics_ODrive.html)

### GUI Usage
- **Configuration**: Use the step-by-step wizard for initial setup
- **Dashboard**: Monitor your system in real-time after configuration
- **Inspector**: Debug issues and fine-tune parameters
- **Property Tree**: Access advanced settings not in the main interface

## 🔧 Technical Architecture

### Frontend
- **React 18**: Modern component-based UI framework
- **Vite**: Lightning-fast development and build tool
- **Chart.js**: High-performance real-time plotting
- **CSS Modules**: Scoped styling for component isolation

### Backend
- **Flask**: Lightweight Python web framework
- **ODrive Library v0.6.10.post0**: Official ODrive Python bindings
- **WebSocket**: Real-time bidirectional communication
- **Threading**: Non-blocking device communication

### Key Components
```
├── frontend/src/
│   ├── components/tabs/        # Main application tabs
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # State management
│   └── utils/                 # ODrive definitions and utils
├── backend/
│   ├── app/                   # Flask application
│   ├── routes/                # API endpoints
│   └── odrive_manager.py      # Device communication
└── odrive_docs_local/         # Offline documentation
```


### Issues

 **GitHub Issues**: [Report bugs or request features](https://github.com/MoonLighTingPY/odrive3.6_web_gui/issues)



## 🚀 Future Enhancements

- [ ] **Multi-Language Support**: GUI localization
- [ ] **Firmware Updates**: Built-in DFU support
- [ ] **Remote Access**: Network-based device control

## 🤝 Contributing

Contributions are welcome! Whether it's bug fixes, new features, or documentation improvements:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



**⚡ Made for ODrive v0.5.6 users who need a modern GUI solution**

*If you find this project helpful, please consider giving it a ⭐ on GitHub!*
